// 가장 최근 게임 정보 조회 스크립트
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일에서 환경 변수를 로드하는 함수
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
            // 따옴표 제거
            process.env[key] = value.replace(/(^['"]|['"]$)/g, '');
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ 환경 변수 로드 중 오류 발생:', error.message);
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL 또는 Anon Key가 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryLatestGame() {
  try {
    console.log('📋 가장 최근 게임 세션을 조회합니다...');

    // 1. 가장 최근의 game_sessions을 하나 가져옵니다.
    const { data: latestSession, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single(); // .limit(1)과 함께 사용하여 단일 객체를 반환받습니다.

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
          console.log('❌ 조회된 게임 세션이 없습니다.');
          return;
      }
      console.error('❌ 게임 세션 조회 오류:', sessionError.message);
      return;
    }

    if (!latestSession) {
      console.log('❌ 조회된 게임 세션이 없습니다.');
      return;
    }

    console.log(`✅ 가장 최근 게임 세션을 찾았습니다: ${latestSession.date}`);
    console.log(`   - 세션 ID: ${latestSession.id}`);
    console.log(`   - 세션 이름: ${latestSession.session_name || '일반 게임'}`);
    console.log(`   - 장소: ${latestSession.location || '미기록'}`);
    console.log(`   - 레인 번호: ${latestSession.lane_number || '미기록'}`);

    // 2. 해당 세션 ID를 사용하는 모든 game_results를 조회합니다.
    console.log(`
📋 해당 세션의 게임 결과를 조회합니다...`);
    const { data: gameResults, error: gameError } = await supabase
      .from('game_results')
      .select(`
        *,
        members(id, name)
      `)
      .eq('session_id', latestSession.id)
      .order('game_number');

    if (gameError) {
      console.error('❌ 게임 결과 조회 오류:', gameError.message);
      return;
    }

    if (!gameResults || gameResults.length === 0) {
      console.log('❌ 해당 세션에 대한 게임 결과가 없습니다.');
      return;
    }

    console.log(`✅ 총 ${gameResults.length}개의 게임 결과가 있습니다.`);

    // 3. 결과를 출력합니다.
    gameResults.forEach(game => {
      const memberName = game.members ? game.members.name : '알 수 없는 회원';
      console.log(`   - [${game.game_number}게임] ${memberName}: ${game.score}점 (핸디캡: ${game.handicap || 0})`);
    });

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류 발생:', error.message);
  }
}

queryLatestGame().then(() => {
  console.log('\n✅ 조회 완료.');
});
