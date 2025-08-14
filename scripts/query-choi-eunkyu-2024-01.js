// 최은규 회원의 2024년 1월 게임 정보 조회 (Supabase MCP 방식)
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 최은규 회원의 2024년 1월 게임 정보 조회 시작...');

// 환경 변수 로드 함수
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
      console.log('✅ 환경 변수 로드 완료');
    }
  } catch (error) {
    console.error('❌ 환경 변수 로드 실패:', error.message);
  }
}

// 환경 변수 로드
loadEnv();

// Supabase 연결 설정
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.log('필요한 환경 변수: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Supabase 클라이언트 생성 완료');

async function queryChoiEunkyuGames() {
  try {
    console.log('\n📋 1단계: 최은규 회원 조회');
    
    // 회원 정보 조회
    const { data: members, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('name', '최은규');

    if (memberError) {
      console.error('❌ 회원 조회 오류:', memberError);
      return;
    }

    if (!members || members.length === 0) {
      console.log('❌ "최은규" 회원을 찾을 수 없습니다.');
      
      // 전체 회원 목록 확인
      const { data: allMembers } = await supabase
        .from('members')
        .select('name')
        .order('name');
      
      console.log('\n📋 등록된 회원 목록:');
      allMembers?.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.name}`);
      });
      return;
    }

    const member = members[0];
    console.log('✅ 회원 정보:', {
      id: member.id,
      name: member.name,
      joined_date: member.joined_date,
      is_active: member.is_active
    });

    console.log('\n📋 2단계: 2024년 1월 게임 세션 조회');
    
    // 2024년 1월 게임 세션 조회
    const { data: sessions, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .gte('date', '2024-01-01')
      .lte('date', '2024-01-31')
      .order('date');

    if (sessionError) {
      console.error('❌ 게임 세션 조회 오류:', sessionError);
      return;
    }

    console.log(`✅ 2024년 1월 게임 세션: ${sessions?.length || 0}개`);
    
    if (!sessions || sessions.length === 0) {
      console.log('❌ 2024년 1월에 게임 세션이 없습니다.');
      return;
    }

    console.log('\n📋 3단계: 최은규 회원의 게임 결과 조회');
    
    // 최은규 회원의 게임 결과 조회
    const sessionIds = sessions.map(s => s.id);
    const { data: gameResults, error: gameError } = await supabase
      .from('game_results')
      .select(`
        *,
        game_sessions!inner(
          id,
          session_name,
          date,
          location,
          lane_number,
          start_time,
          end_time
        )
      `)
      .eq('member_id', member.id)
      .in('session_id', sessionIds)
      .order('game_number', { ascending: true });

    if (gameError) {
      console.error('❌ 게임 결과 조회 오류:', gameError);
      return;
    }

    if (!gameResults || gameResults.length === 0) {
      console.log('❌ 최은규 회원의 2024년 1월 게임 기록이 없습니다.');
      return;
    }

    console.log(`✅ 최은규 회원의 게임 기록: ${gameResults.length}개`);

    // 결과 정리 및 출력
    console.log('\n🎳 최은규 회원의 2024년 1월 게임 기록');
    console.log('=' .repeat(60));

    const sessionGroups = {};
    gameResults.forEach(game => {
      const sessionId = game.session_id;
      if (!sessionGroups[sessionId]) {
        sessionGroups[sessionId] = {
          session: game.game_sessions,
          games: []
        };
      }
      sessionGroups[sessionId].games.push(game);
    });

    let totalGames = 0;
    let totalScore = 0;
    let totalStrikes = 0;
    let totalSpares = 0;
    const allScores = [];

    Object.values(sessionGroups).forEach((group, index) => {
      const { session, games } = group;
      console.log(`\n📅 세션 ${index + 1}: ${session.date}`);
      console.log(`   📍 장소: ${session.location || '미기록'}`);
      console.log(`   🏷️  세션명: ${session.session_name || '일반 게임'}`);
      if (session.lane_number) {
        console.log(`   🛤️  레인: ${session.lane_number}번`);
      }
      if (session.start_time && session.end_time) {
        console.log(`   ⏰ 시간: ${session.start_time} ~ ${session.end_time}`);
      }

      let sessionTotal = 0;
      games.forEach(game => {
        console.log(`   🎯 ${game.game_number}게임: ${game.score}점 (스트라이크: ${game.strikes || 0}, 스페어: ${game.spares || 0})`);
        sessionTotal += game.score;
        totalScore += game.score;
        totalStrikes += (game.strikes || 0);
        totalSpares += (game.spares || 0);
        totalGames++;
        allScores.push(game.score);
        
        if (game.notes) {
          console.log(`      📝 ${game.notes}`);
        }
      });
      
      console.log(`   📊 세션 합계: ${sessionTotal}점 (평균: ${(sessionTotal / games.length).toFixed(1)}점)`);
    });

    // 월간 통계
    console.log('\n📊 2024년 1월 통계 요약');
    console.log('=' .repeat(40));
    console.log(`🎳 총 세션 수: ${Object.keys(sessionGroups).length}회`);
    console.log(`🎯 총 게임 수: ${totalGames}게임`);
    console.log(`📈 총점: ${totalScore}점`);
    console.log(`📊 평균 점수: ${(totalScore / totalGames).toFixed(1)}점`);
    console.log(`🏆 최고 점수: ${Math.max(...allScores)}점`);
    console.log(`📉 최저 점수: ${Math.min(...allScores)}점`);
    console.log(`⚡ 총 스트라이크: ${totalStrikes}개`);
    console.log(`🎯 총 스페어: ${totalSpares}개`);

    // 세션별 3게임 합계 순위
    console.log('\n🏆 세션별 3게임 합계 순위');
    console.log('-' .repeat(40));
    const sessionTotals = Object.values(sessionGroups)
      .map(g => ({
        date: g.session.date,
        location: g.session.location,
        total: g.games.reduce((sum, game) => sum + game.score, 0),
        gameCount: g.games.length
      }))
      .sort((a, b) => b.total - a.total);

    sessionTotals.forEach((session, index) => {
      console.log(`${index + 1}위: ${session.date} - ${session.total}점 (${session.gameCount}게임) @ ${session.location || '미기록'}`);
    });

  } catch (error) {
    console.error('❌ 조회 중 오류 발생:', error);
  }
}

// 실행
queryChoiEunkyuGames().then(() => {
  console.log('\n✅ 조회 완료');
}).catch(error => {
  console.error('❌ 실행 오류:', error);
});
