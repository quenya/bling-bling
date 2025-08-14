// 2025-08-20 게임 세션 날짜를 2025-08-13으로 일괄 변경
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function updateGameSessionDates() {
  try {
    console.log('\n📋 2025-08-20 게임 세션 id 조회');
    const { data: sessions, error: sessionError } = await supabase
      .from('game_sessions')
      .select('id, date')
      .eq('date', '2025-08-20');
    if (sessionError) {
      console.error('❌ 게임 세션 조회 오류:', sessionError);
      return;
    }
    if (!sessions || sessions.length === 0) {
      console.log('❌ 2025-08-20 세션이 없습니다.');
      return;
    }
    const sessionIds = sessions.map(s => s.id);
    console.log(`✅ 대상 세션: ${sessionIds.join(', ')}`);
    // 날짜 일괄 업데이트
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({ date: '2025-08-13' })
      .in('id', sessionIds);
    if (updateError) {
      console.error('❌ 날짜 변경 오류:', updateError);
      return;
    }
    console.log(`✅ ${sessionIds.length}개 세션 날짜를 2025-08-13으로 변경 완료`);
  } catch (error) {
    console.error('❌ 처리 중 오류:', error);
  }
}

updateGameSessionDates().then(() => {
  console.log('\n✅ 작업 완료');
}).catch(error => {
  console.error('❌ 실행 오류:', error);
});
