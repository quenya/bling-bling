// 2025년 8월 20일 전체 게임 정보 조회 (Supabase MCP)
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryGamesFor20250820() {
  try {
    console.log('\n📋 2025년 8월 20일 게임 세션 조회');
    const { data: sessions, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('date', '2025-08-20')
      .order('id');

    if (sessionError) {
      console.error('❌ 게임 세션 조회 오류:', sessionError);
      return;
    }
    if (!sessions || sessions.length === 0) {
      console.log('❌ 2025년 8월 20일에 게임 세션이 없습니다.');
      return;
    }
    console.log(`✅ 2025년 8월 20일 게임 세션: ${sessions.length}개`);

    const sessionIds = sessions.map(s => s.id);
    const { data: gameResults, error: gameError } = await supabase
      .from('game_results')
      .select(`
        *,
        members(id, name, email),
        game_sessions!inner(id, session_name, date, location, lane_number)
      `)
      .in('session_id', sessionIds)
      .order('session_id')
      .order('game_number');

    if (gameError) {
      console.error('❌ 게임 결과 조회 오류:', gameError);
      return;
    }
    if (!gameResults || gameResults.length === 0) {
      console.log('❌ 2025년 8월 20일에 게임 결과가 없습니다.');
      return;
    }
    // 세션별로 그룹화
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
    Object.values(sessionGroups).forEach((group, idx) => {
      const { session, games } = group;
      console.log(`\n📅 세션 ${idx + 1}: ${session.date}`);
      console.log(`   📍 장소: ${session.location || '미기록'}`);
      console.log(`   🏷️  세션명: ${session.session_name || '일반 게임'}`);
      if (session.lane_number) {
        console.log(`   🛤️  레인: ${session.lane_number}번`);
      }
      games.forEach(game => {
        const member = game.members;
        console.log(`   👤 ${member?.name || '미기록'} | ${game.game_number}게임: ${game.score}점`);
      });
    });
  } catch (error) {
    console.error('❌ 조회 중 오류 발생:', error);
  }
}

queryGamesFor20250820().then(() => {
  console.log('\n✅ 조회 완료');
}).catch(error => {
  console.error('❌ 실행 오류:', error);
});
