console.log('✨ 스크립트 로딩 시작...');

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

console.log('📦 모든 모듈 임포트 완료');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📁 파일 경로 설정 완료:', __dirname);

// 수동으로 .env 파일 로드
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.log('환경 변수 로드 중 오류 (무시됨):', error.message);
  }
}

loadEnv();

// Supabase 클라이언트 생성
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
let supabase;

// 컬럼 탐지 함수 (기존 parse-all-games.js에서 개선된 버전)
function detectGameColumns(sheet) {
  console.log('동적 게임 컬럼 탐지 시작...');
  
  // 기본값
  let game1Col = 3, game2Col = 6, game3Col = 9;
  
  // 헤더에서 "1", "2", "3" 패턴 찾기
  for (let i = 0; i < Math.min(20, sheet.data.length); i++) {
    const row = sheet.data[i];
    
    // "1", "2", "3" 헤더가 있는 행 찾기
    if (row && row.some(cell => cell && cell.toString().trim() === '1')) {
      let found1 = -1, found2 = -1, found3 = -1;
      
      for (let col = 0; col < row.length; col++) {
        const cell = row[col];
        if (cell && cell.toString().trim() === '1') found1 = col;
        else if (cell && cell.toString().trim() === '2') found2 = col;
        else if (cell && cell.toString().trim() === '3') found3 = col;
      }
      
      if (found1 !== -1 && found2 !== -1 && found3 !== -1) {
        game1Col = found1;
        game2Col = found2;
        game3Col = found3;
        console.log(`  동적 컬럼 감지 성공: 1게임=${game1Col}, 2게임=${game2Col}, 3게임=${game3Col}`);
        break;
      }
    }
  }
  
  // 검증: 실제 볼링 점수 데이터가 있는지 확인
  let validationFound = false;
  for (let i = 0; i < sheet.data.length; i++) {
    const row = sheet.data[i];
    
    // 2025년 새로운 형식: 팀 정보가 A\n(13,14,15) 형태로 되어 있음
    let teamCell = row[1] ? row[1].toString().trim() : '';
    let nameCell = row[2] ? row[2].toString().trim() : '';
    
    // 팀 셀에서 A, B, C 등 추출 (줄바꿈이 있는 경우도 처리)
    const teamMatch = teamCell.match(/^([A-F])/);
    const hasValidTeam = teamMatch || /^[A-F]$/.test(teamCell);
    
    if (hasValidTeam && nameCell && nameCell.length > 0) {
      const val1 = row[game1Col];
      const val2 = row[game2Col];
      const val3 = row[game3Col];
      
      // 볼링 점수 범위 검증 (0-300)
      if (typeof val1 === 'number' && val1 >= 0 && val1 <= 300) {
        console.log(`  검증 성공: ${nameCell} 점수 = [${val1}, ${val2}, ${val3}]`);
        validationFound = true;
        break;
      }
    }
  }
  
  if (!validationFound) {
    console.log('  검증 실패: 유효한 볼링 점수 데이터를 찾을 수 없음');
    return null;
  }
  
  return { game1Col, game2Col, game3Col };
}

// 날짜 추출 함수
function extractDateFromSheetName(sheetName) {
  // 예: "2025_08월_미니게임" 또는 "2024_1월(1)_미니게임_결과"
  const match = sheetName.match(/^(\d{4})_(\d+)월(\(\d+\))?_(미니게임|라지게임)(_결과)?$/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  if (year < 1 || month < 1 || month > 12) return null;

  const weekNumberPart = match[3]; // (1), (2) 등
  let gameType = match[4];
  
  // 특별한 경우 처리: 2024년 1월
  if (year === 2024 && month === 1 && weekNumberPart) {
    const weekNum = parseInt(weekNumberPart.replace(/[()]/g, ''));
    if (weekNum === 1) {
      gameType = '라지게임'; // 2024_1월(1)_미니게임_결과 → 라지게임
    } else if (weekNum === 2) {
      gameType = '미니게임'; // 2024_1월(2)_미니게임_결과 → 미니게임  
    }
  }
  
  // 미니게임은 둘째주 수요일, 라지게임은 넷째주 수요일
  const weekNumber = gameType === '미니게임' ? 2 : 4;
  const day = getWednesdayOfWeek(year, month, weekNumber);
  if (day === null) return null;
  
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  return {
    year,
    month,
    day,
    gameType,
    date: dateStr
  };
}

// 회원 생성 또는 조회
async function upsertMember(name) {
  try {
    // 먼저 기존 회원 확인
    const { data: existingMember, error: selectError } = await supabase
      .from('members')
      .select('id, name')
      .eq('name', name)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116은 no rows found
      throw selectError;
    }

    if (existingMember) {
      console.log(`👤 기존 회원 사용: ${name} (ID: ${existingMember.id})`);
      return existingMember;
    }

    // 새 회원 생성
    const { data: newMember, error: insertError } = await supabase
      .from('members')
      .insert({
        name: name
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`🆕 새 회원 생성: ${name} (ID: ${newMember.id})`);
    return newMember;
  } catch (error) {
    console.error(`회원 처리 중 오류 (${name}):`, error);
    throw error;
  }
}

// 게임 세션 생성
async function createGameSession(gameDate, gameType, venue = '라인볼링장') {
  try {
    const { data: session, error } = await supabase
      .from('game_sessions')
      .insert({
        date: gameDate,
        location: venue,
        session_type: gameType,
        total_participants: 0, // 나중에 업데이트
        session_name: `${gameDate} ${gameType}`
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`🎮 게임 세션 생성: ${gameDate} ${gameType} (ID: ${session.id})`);
    return session;
  } catch (error) {
    console.error(`게임 세션 생성 중 오류:`, error);
    throw error;
  }
}

// 게임 결과 삽입
async function insertGameResults(sessionId, memberResults) {
  try {
    const gameResults = [];

    for (const memberResult of memberResults) {
      const { member, scores } = memberResult;
      
      for (let gameNumber = 1; gameNumber <= scores.length; gameNumber++) {
        const score = scores[gameNumber - 1];
        if (score !== null && score !== undefined && !isNaN(score)) {
          gameResults.push({
            session_id: sessionId,
            member_id: member.id,
            game_number: gameNumber,
            score: parseInt(score)
          });
        }
      }
    }

    if (gameResults.length === 0) {
      console.log('삽입할 게임 결과가 없습니다.');
      return [];
    }

    console.log(`📊 ${gameResults.length}개의 게임 결과 삽입 중...`);
    
    const { data: insertedResults, error } = await supabase
      .from('game_results')
      .insert(gameResults)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ ${insertedResults.length}개의 게임 결과가 성공적으로 삽입되었습니다.`);
    return insertedResults;
  } catch (error) {
    console.error('게임 결과 삽입 중 오류:', error);
    throw error;
  }
}

// 게임 세션의 총 플레이어 수 업데이트
async function updateSessionPlayerCount(sessionId, playerCount) {
  try {
    const { error } = await supabase
      .from('game_sessions')
      .update({ total_participants: playerCount })
      .eq('id', sessionId);

    if (error) {
      throw error;
    }

    console.log(`📝 세션 플레이어 수 업데이트: ${playerCount}명`);
  } catch (error) {
    console.error('세션 플레이어 수 업데이트 중 오류:', error);
    throw error;
  }
}

// 단일 게임 처리
async function processGame(gameInfo) {
  try {
    console.log(`\n🎯 === ${gameInfo.date} ${gameInfo.type} 게임 처리 시작 ===`);
    
    // 게임 세션 생성
    const session = await createGameSession(gameInfo.date, gameInfo.type);
    
    // 회원 정보 처리 및 결과 수집
    const memberResults = [];
    
    for (const playerData of gameInfo.players) {
      // 회원 생성/조회
      const member = await upsertMember(playerData.name);
      
      memberResults.push({
        member: member,
        scores: playerData.scores,
        lane: playerData.lane,
        team: playerData.team
      });
    }
    
    // 게임 결과 삽입
    await insertGameResults(session.id, memberResults);
    
    // 세션 플레이어 수 업데이트
    await updateSessionPlayerCount(session.id, memberResults.length);
    
    console.log(`✅ === ${gameInfo.date} ${gameInfo.type} 게임 처리 완료 ===\n`);
    
    return {
      sessionId: session.id,
      playerCount: memberResults.length,
      gameCount: memberResults.reduce((total, result) => total + result.scores.filter(s => s !== null).length, 0)
    };
    
  } catch (error) {
    console.error(`❌ 게임 처리 중 오류 (${gameInfo.date} ${gameInfo.type}):`, error);
    throw error;
  }
}

// 날짜 계산 함수들 (기존 코드에서 가져옴)
function getWednesdayOfWeek(year, month, weekNumber) {
  const firstDay = new Date(year, month - 1, 1);
  const firstWednesday = new Date(firstDay);
  
  const daysToAdd = (3 - firstDay.getDay() + 7) % 7;
  firstWednesday.setDate(firstDay.getDate() + daysToAdd);
  
  const targetWednesday = new Date(firstWednesday);
  targetWednesday.setDate(firstWednesday.getDate() + (weekNumber - 1) * 7);
  
  if (targetWednesday.getMonth() !== month - 1) {
    return null;
  }
  
  return targetWednesday.getDate();
}

// 데이터베이스 초기화 함수
async function clearDatabase() {
  console.log('🗑️  데이터베이스 초기화 시작...');
  
  try {
    // game_results 테이블 먼저 삭제 (외래키 제약조건)
    const { error: gameResultsError } = await supabase
      .from('game_results')
      .delete()
      .not('id', 'is', null); // 모든 레코드 삭제
    
    if (gameResultsError) {
      console.error('❌ game_results 삭제 실패:', gameResultsError);
      throw gameResultsError;
    }
    console.log('✅ game_results 테이블 초기화 완료');

    // game_sessions 테이블 삭제
    const { error: gameSessionsError } = await supabase
      .from('game_sessions')
      .delete()
      .not('id', 'is', null); // 모든 레코드 삭제
    
    if (gameSessionsError) {
      console.error('❌ game_sessions 삭제 실패:', gameSessionsError);
      throw gameSessionsError;
    }
    console.log('✅ game_sessions 테이블 초기화 완료');

    // members 테이블 삭제
    const { error: membersError } = await supabase
      .from('members')
      .delete()
      .not('id', 'is', null); // 모든 레코드 삭제
    
    if (membersError) {
      console.error('❌ members 삭제 실패:', membersError);
      throw membersError;
    }
    console.log('✅ members 테이블 초기화 완료');

    console.log('🎉 데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
}

// 메인 함수
async function main() {
  try {
    console.log('🚀 스크립트 시작...');
    
    // 명령행 인수 처리
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run') || args.includes('-d');
    const isClear = args.includes('--clear') || args.includes('-c');
    const inputPath = args.find(arg => !arg.startsWith('-'));
    
    console.log('📝 명령행 인수:', args);
    console.log('🔍 드라이런 모드:', isDryRun);
    console.log('🗑️  데이터 초기화 모드:', isClear);
    
    if (isDryRun) {
      console.log('🔍 === 드라이런 모드: 데이터 파싱만 확인합니다 ===\n');
    }

    if (!inputPath) {
      throw new Error(
        'Excel 파일 경로가 필요합니다. 사용법: npm run import:supabase -- /path/to/input.xlsx'
      );
    }

    const excelPath = path.resolve(process.cwd(), inputPath);
    
    if (!fs.existsSync(excelPath)) {
      throw new Error(`Excel 파일을 찾을 수 없습니다: ${excelPath}`);
    }

    console.log('📊 Excel 파일 파싱 중...');
    const workbook = XLSX.readFile(excelPath);
    
    const allGames = [];
    const validationErrors = [];
    
    // 전체점수(순) 탭 처리
    if (workbook.SheetNames.includes('전체점수(순)')) {
      const sheet = workbook.Sheets['전체점수(순)'];
      // 전체점수 탭은 통계용이므로 데이터 삽입에서 제외
      console.log('ℹ️  전체점수(순) 탭은 통계 데이터이므로 건너뜁니다.');
    }

    // 게임 탭들 처리
    const gameSheets = workbook.SheetNames.filter(name => 
      name.includes('미니게임') || name.includes('라지게임')
    );

    console.log(`🎳 처리할 게임 시트: ${gameSheets.length}개`);

    for (const sheetName of gameSheets) {
      try {
        console.log(`\n📋 시트 처리 중: ${sheetName}`);
        
        // 날짜 정보 추출
        const dateInfo = extractDateFromSheetName(sheetName);
        if (!dateInfo) {
          console.log(`⚠️  ${sheetName}: 날짜 정보를 추출할 수 없습니다.`);
          validationErrors.push(`${sheetName}: 날짜 정보를 추출할 수 없습니다.`);
          continue;
        }
        
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (data.length < 2) {
          console.log(`⚠️  ${sheetName}: 데이터가 부족합니다.`);
          validationErrors.push(`${sheetName}: 데이터가 부족합니다.`);
          continue;
        }

        // 시트 객체 생성 (기존 파싱 로직과 호환)
        const sheetObj = {
          sheetName: sheetName,
          data: data
        };

        // 게임 컬럼 구조 동적 감지
        const gameColumns = detectGameColumns(sheetObj);
        if (!gameColumns) {
          console.log(`⚠️  ${sheetName}: 게임 점수 컬럼을 찾을 수 없습니다.`);
          validationErrors.push(`${sheetName}: 게임 점수 컬럼을 찾을 수 없습니다.`);
          continue;
        }

        const { game1Col, game2Col, game3Col } = gameColumns;
        console.log(`✅ ${sheetName}: 컬럼 구조 감지 완료 [${game1Col}, ${game2Col}, ${game3Col}]`);

        // 플레이어 데이터 추출
        const players = [];
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          
          // 팀과 이름이 있는 행만 처리
          if (row && row[1] && row[2]) {
            const teamCell = row[1].toString().trim();
            const nameCell = row[2].toString().trim();
            
            // 2025년 새로운 형식: A\n(13,14,15) 또는 기존 형식: A
            const teamMatch = teamCell.match(/^([A-F])/);
            const team = teamMatch ? teamMatch[1] : (/^[A-F]$/.test(teamCell) ? teamCell : null);
            
            // 이름이 유효하고 팀이 있는 경우만 처리
            if (team && nameCell && nameCell.length > 0 && !nameCell.includes('empty')) {
              // 볼링 점수 추출
              const rawScores = [row[game1Col], row[game2Col], row[game3Col]];
              const invalidScore = rawScores.some(score =>
                score !== null &&
                score !== undefined &&
                score !== '' &&
                (!Number.isInteger(score) || score < 0 || score > 300)
              );

              if (invalidScore) {
                validationErrors.push(`${sheetName}: ${i + 1}행에 유효하지 않은 점수가 있습니다.`);
                continue;
              }

              const scores = rawScores.filter(score => Number.isInteger(score));
              
              if (scores.length > 0) {
                players.push({
                  name: nameCell,
                  scores: scores,
                  team: team,
                  lane: null // 레인 정보는 나중에 처리
                });
              }
            }
          }
        }

        if (players.length > 0) {
          const gameInfo = {
            date: dateInfo.date,
            type: dateInfo.gameType,
            players: players
          };
          
          allGames.push(gameInfo);
          console.log(`✅ ${sheetName}: ${players.length}명의 플레이어 데이터 준비 완료`);
        } else {
          console.log(`⚠️  ${sheetName}: 유효한 플레이어 데이터가 없습니다.`);
          validationErrors.push(`${sheetName}: 유효한 플레이어 데이터가 없습니다.`);
        }

      } catch (error) {
        console.error(`❌ 시트 ${sheetName} 처리 중 오류:`, error);
        validationErrors.push(`${sheetName}: 시트 처리 중 오류가 발생했습니다.`);
      }
    }

    console.log(`\n📋 총 ${allGames.length}개의 게임이 파싱되었습니다.`);

    if (validationErrors.length > 0) {
      throw new Error(`Excel 데이터 검증 실패:\n- ${validationErrors.join('\n- ')}`);
    }

    if (allGames.length === 0) {
      throw new Error('삽입할 수 있는 유효한 게임 데이터를 찾지 못했습니다.');
    }

    if (isDryRun) {
      console.log('\n🔍 === 드라이런 결과 요약 ===');
      for (const game of allGames) {
        console.log(`📅 ${game.date} (${game.type}): ${game.players.length}명`);
        game.players.forEach(p => {
          console.log(`  👤 ${p.name}: [${p.scores.join(', ')}]`);
        });
      }
      console.log('\n💡 실제 데이터를 삽입하려면 --dry-run 옵션 없이 실행하세요.');
      return;
    }

    console.log('🌍 환경 변수 확인 중...');
    console.log('VITE_SUPABASE_URL 설정됨:', !!supabaseUrl);
    console.log('VITE_SUPABASE_ANON_KEY 설정됨:', !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ 환경 변수가 설정되지 않았습니다.');
      console.error('프로젝트 루트에 .env 파일을 만들고 다음 내용을 추가하세요:');
      console.error('');
      console.error('VITE_SUPABASE_URL=your_supabase_project_url');
      console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
      console.error('');
      console.error('자세한 내용은 SUPABASE_IMPORT_GUIDE.md를 참조하세요.');
      console.error('');
      console.error('데이터 파싱만 확인하려면 --dry-run 옵션을 사용하세요:');
      console.error('npm run import:dry-run -- /path/to/input.xlsx');
      process.exit(1);
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🔗 Supabase 연결 테스트...');
    const { error } = await supabase.from('members').select('count').single();
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('✅ Supabase 연결 성공!');

    if (isClear) {
      await clearDatabase();
      console.log('✅ 데이터베이스 초기화 완료. 새로운 데이터를 삽입합니다.');
    }

    console.log(`🚀 총 ${allGames.length}개의 게임을 Supabase에 삽입합니다.`);

    // 데이터베이스에 삽입
    const results = [];
    for (const game of allGames) {
      try {
        const result = await processGame(game);
        results.push(result);
      } catch (error) {
        console.error(`❌ 게임 삽입 실패 (${game.date} ${game.type}):`, error);
        continue;
      }
    }

    console.log('\n🎉 === 삽입 완료 요약 ===');
    console.log(`✅ 성공한 게임: ${results.length}개`);
    console.log(`👥 총 플레이어 수: ${results.reduce((sum, r) => sum + r.playerCount, 0)}명`);
    console.log(`🎳 총 게임 수: ${results.reduce((sum, r) => sum + r.gameCount, 0)}개`);

    console.log('\n🎊 데이터 삽입이 완료되었습니다!');
    console.log('Supabase 대시보드에서 데이터를 확인해보세요.');

  } catch (error) {
    console.error('💥 메인 프로세스 오류:', error);
    process.exit(1);
  }
}

// 스크립트 실행
console.log('🔍 스크립트 실행 조건 확인...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

// ES 모듈에서 직접 실행 확인
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || 
                    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

console.log('isMainModule:', isMainModule);

if (isMainModule) {
  console.log('🚀 메인 함수 호출 중...');
  main().catch(console.error);
} else {
  console.log('📦 모듈로 임포트됨');
}

export { main as importToSupabase };
