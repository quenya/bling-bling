import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 특정 월의 둘째주 또는 넷째주 수요일 계산
function getWednesdayOfWeek(year, month, weekNumber) {
  // weekNumber: 2 = 둘째주, 4 = 넷째주
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
  
  // 해당 월의 첫 번째 수요일 찾기
  let firstWednesday = 1;
  if (firstDayOfWeek <= 3) { // 월화수 중 하나라면
    firstWednesday = 4 - firstDayOfWeek;
  } else { // 목금토일 중 하나라면
    firstWednesday = 11 - firstDayOfWeek;
  }
  
  // 원하는 주차의 수요일 계산
  const targetWednesday = firstWednesday + (weekNumber - 1) * 7;
  
  // 해당 월의 마지막 날 체크
  const lastDay = new Date(year, month, 0).getDate();
  
  if (targetWednesday > lastDay) {
    // 넷째주 수요일이 다음 달로 넘어가는 경우, 그 전 주 수요일 사용
    return targetWednesday - 7;
  }
  
  return targetWednesday;
}

// 탭 이름에서 날짜 추출
function extractDateFromSheetName(sheetName) {
  // 예: "2025_08월_미니게임" 또는 "2024_1월(1)_미니게임_결과"
  const match = sheetName.match(/(\d{4})_(\d+)월(\(\d+\))?_(미니게임|라지게임)(_결과)?/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const gameType = match[4]; // 게임타입은 4번째 그룹
  
  // 미니게임은 둘째주 수요일, 라지게임은 넷째주 수요일
  const weekNumber = gameType === '미니게임' ? 2 : 4;
  const day = getWednesdayOfWeek(year, month, weekNumber);
  
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  return {
    year,
    month,
    day,
    gameType,
    date: dateStr
  };
}

// 레인 번호 추출 (조 셀에서 두번째 줄의 첫번째 숫자들)
function extractLaneNumbers(cellValue) {
  if (!cellValue) return [];
  
  const cellStr = cellValue.toString();
  // \r\n 또는 \n으로 줄 구분
  const lines = cellStr.split(/\r?\n/);
  
  if (lines.length < 2) return [];
  
  // 두번째 줄에서 괄호 안의 숫자들 추출
  const secondLine = lines[1];
  const match = secondLine.match(/\(([^)]+)\)/);
  
  if (!match) return [];
  
  // 쉼표로 구분된 숫자들 파싱
  const numbers = match[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  
  return numbers;
}

// 팀별 기본 레인 할당 (A팀부터 순서대로)
function assignDefaultLanes(teamIndex, startLane = 13) {
  // A=0, B=1, C=2, D=3, E=4, F=5 순서로 레인 할당
  // 13, 14, 15, 16, 17, 12 순서로 할당
  const laneSequence = [13, 14, 15, 16, 17, 12];
  
  if (teamIndex < laneSequence.length) {
    return laneSequence[teamIndex];
  }
  
  // 6팀 이상인 경우 12부터 시작해서 순차 할당
  return 12 + (teamIndex % 6);
}

// 시트에서 게임 컬럼 구조를 동적으로 감지
function detectGameColumns(sheet) {
  // 기본값 (가장 일반적인 구조)
  let game1Col = 3, game2Col = 6, game3Col = 9;
  
  // 헤더에서 "1", "2", "3" 패턴 찾기
  for (let i = 0; i < Math.min(20, sheet.data.length); i++) {
    const row = sheet.data[i];
    
    // "1", "2", "3" 헤더가 있는 행 찾기
    if (row.some(cell => cell && cell.toString().trim() === '1')) {
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
        console.log(`   동적 컬럼 감지: 1게임=${game1Col}, 2게임=${game2Col}, 3게임=${game3Col}`);
        break;
      }
    }
  }
  
  // 첫 번째 팀 데이터로 검증
  for (let i = 0; i < sheet.data.length; i++) {
    const row = sheet.data[i];
    if (row[1] && /^[A-F]$/.test(row[1].toString().trim()) && row[2] && typeof row[2] === 'string') {
      const val1 = row[game1Col];
      const val2 = row[game2Col];
      const val3 = row[game3Col];
      
      // 볼링 점수 범위 검증
      if (typeof val1 === 'number' && val1 >= 0 && val1 <= 300) {
        console.log(`   검증 성공: ${row[2]} 1게임=${val1}, 2게임=${val2}, 3게임=${val3}`);
        break;
      }
    }
  }
  
  return { game1Col, game2Col, game3Col };
}

// 게임 시트 파싱
function parseGameSheet(sheet) {
  const dateInfo = extractDateFromSheetName(sheet.sheetName);
  if (!dateInfo) return null;
  
  // 동적으로 컬럼 구조 감지
  const { game1Col, game2Col, game3Col } = detectGameColumns(sheet);
  
  const result = {
    date: dateInfo.date,
    gameType: dateInfo.gameType,
    year: dateInfo.year,
    month: dateInfo.month,
    teams: []
  };
  
  // 데이터는 대략 10행 이후부터 시작
  let currentTeam = null;
  let teamCounter = 0; // 팀 순서 카운터 (A=0, B=1, C=2...)
  
  for (let i = 10; i < sheet.data.length; i++) {
    const row = sheet.data[i];
    if (!row || row.length === 0) continue;
    
    const teamInfo = row[1]; // B열에 조 정보
    const memberName = row[2]; // C열에 이름
    
    // 새로운 조 시작인지 확인 (괄호가 있거나 A, B, C 등의 팀명으로 시작)
    if (teamInfo && (teamInfo.toString().includes('(') || /^[A-F](\r|\n|\\r\\n|$)/.test(teamInfo.toString()))) {
      // 이전 팀이 있으면 결과에 추가
      if (currentTeam && currentTeam.members.length > 0) {
        result.teams.push(currentTeam);
      }
      
      // 새 팀 시작
      const laneNumbers = extractLaneNumbers(teamInfo);
      const teamName = teamInfo.toString().split('\r\n')[0] || teamInfo.toString().split('\n')[0];
      
      // 레인 정보가 없으면 기본 할당
      let mainLane;
      if (laneNumbers.length > 0) {
        mainLane = laneNumbers[0];
      } else {
        mainLane = assignDefaultLanes(teamCounter);
        console.log(`   기본 레인 할당: 팀 ${teamName.trim()} → 레인 ${mainLane}`);
      }
      
      currentTeam = {
        teamName: teamName.trim(),
        lanes: laneNumbers.length > 0 ? laneNumbers : [mainLane],
        mainLane: mainLane,
        members: []
      };
      
      teamCounter++;
    }
    
    // 멤버 정보 추가
    if (memberName && memberName.toString().trim() && currentTeam) {
      const name = memberName.toString().trim();
      
      // 동적으로 감지된 컬럼 사용
      const game1Score = row[game1Col] ? (typeof row[game1Col] === 'number' ? row[game1Col] : parseInt(row[game1Col])) : null;
      const game2Score = row[game2Col] ? (typeof row[game2Col] === 'number' ? row[game2Col] : parseInt(row[game2Col])) : null;
      const game3Score = row[game3Col] ? (typeof row[game3Col] === 'number' ? row[game3Col] : parseInt(row[game3Col])) : null;
      
      // 유효한 점수만 포함
      const scores = [];
      if (game1Score !== null && !isNaN(game1Score) && game1Score >= 0 && game1Score <= 300) {
        scores.push(game1Score);
      }
      if (game2Score !== null && !isNaN(game2Score) && game2Score >= 0 && game2Score <= 300) {
        scores.push(game2Score);
      }
      if (game3Score !== null && !isNaN(game3Score) && game3Score >= 0 && game3Score <= 300) {
        scores.push(game3Score);
      }
      
      if (scores.length > 0) {
        currentTeam.members.push({
          name,
          game1: game1Score,
          game2: game2Score,
          game3: game3Score,
          scores
        });
      }
    }
  }
  
  // 마지막 팀 추가
  if (currentTeam && currentTeam.members.length > 0) {
    result.teams.push(currentTeam);
  }
  
  return result;
}

// 모든 게임 시트 파싱
function parseAllGameSheets() {
  try {
    const excelFilePath = path.join(__dirname, '../sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
    const excelData = readExcelFileFromPath(excelFilePath);
    
    // 게임 시트들 필터링 (연도_월_게임타입 패턴)
    const gameSheets = excelData.filter(sheet => {
      const name = sheet.sheetName;
      // 일반 패턴: 2024_8월_미니게임 형태
      // 특별 패턴: 2024_1월(1)_미니게임_결과 형태
      return /\d{4}_\d+월(\(\d+\))?_(미니게임|라지게임)(_결과)?/.test(name);
    });
    
    console.log(`🎳 파싱할 게임 시트: ${gameSheets.length}개\n`);
    
    const results = [];
    
    gameSheets.forEach(sheet => {
      console.log(`📋 파싱 중: ${sheet.sheetName}`);
      
      const parsed = parseGameSheet(sheet);
      if (parsed) {
        results.push(parsed);
        console.log(`   ✅ 성공 - 날짜: ${parsed.date}, 팀 수: ${parsed.teams.length}`);
        
        // 팀별 간단 정보 출력
        parsed.teams.forEach(team => {
          console.log(`      팀 ${team.teamName}: 레인 ${team.mainLane}, 멤버 ${team.members.length}명`);
        });
      } else {
        console.log(`   ❌ 파싱 실패`);
      }
      console.log('');
    });
    
    // 날짜순 정렬
    results.sort((a, b) => a.date.localeCompare(b.date));
    
    return results;
    
  } catch (error) {
    console.error('❌ 파싱 오류:', error);
    return [];
  }
}

// Markdown 파일 생성
function generateMarkdown(gameResults) {
  let markdown = `# 볼링 게임 기록\n\n`;
  markdown += `> 자동 생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;
  
  markdown += `## 📊 전체 현황\n\n`;
  markdown += `- 총 게임 수: ${gameResults.length}개\n`;
  markdown += `- 미니게임: ${gameResults.filter(g => g.gameType === '미니게임').length}개\n`;
  markdown += `- 라지게임: ${gameResults.filter(g => g.gameType === '라지게임').length}개\n\n`;
  
  markdown += `## 🎳 게임별 상세 기록\n\n`;
  
  gameResults.forEach(game => {
    markdown += `### ${game.date} (${game.gameType})\n\n`;
    
    game.teams.forEach(team => {
      markdown += `#### 팀 ${team.teamName} - 레인 ${team.mainLane}\n\n`;
      markdown += `| 이름 | 1게임 | 2게임 | 3게임 |\n`;
      markdown += `|------|-------|-------|-------|\n`;
      
      team.members.forEach(member => {
        const game1 = member.game1 !== null ? member.game1 : '-';
        const game2 = member.game2 !== null ? member.game2 : '-';
        const game3 = member.game3 !== null ? member.game3 : '-';
        
        markdown += `| ${member.name} | ${game1} | ${game2} | ${game3} |\n`;
      });
      
      markdown += `\n`;
    });
    
    markdown += `---\n\n`;
  });
  
  return markdown;
}

// 실행
async function main() {
  console.log('🔍 게임 시트 파싱 시작...\n');
  
  const gameResults = parseAllGameSheets();
  
  if (gameResults.length > 0) {
    console.log(`\n✅ 총 ${gameResults.length}개 게임 파싱 완료`);
    
    // Markdown 생성
    const markdown = generateMarkdown(gameResults);
    
    // 파일 저장
    const outputPath = path.join(__dirname, '../sheets/bowling_games_parsed.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');
    
    console.log(`📝 Markdown 파일 생성 완료: ${outputPath}`);
    
    // 최근 3개 게임 요약 출력
    console.log('\n📋 최근 3개 게임 요약:');
    gameResults.slice(-3).forEach(game => {
      console.log(`\n${game.date} (${game.gameType}):`);
      game.teams.forEach(team => {
        console.log(`  팀 ${team.teamName} (레인 ${team.mainLane}): ${team.members.length}명`);
        team.members.forEach(member => {
          const scores = member.scores.join(', ');
          console.log(`    ${member.name}: [${scores}]`);
        });
      });
    });
    
  } else {
    console.log('❌ 파싱된 게임이 없습니다.');
  }
}

main();
