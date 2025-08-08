// 데이터베이스의 모든 게임 세션 location을 '라인볼링장'으로 업데이트
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateAllLocationsToBowlingLane() {
  try {
    console.log('현재 게임 세션들의 location 확인 중...')
    
    // 현재 location 값들 확인
    const { data: sessions, error: fetchError } = await supabase
      .from('game_sessions')
      .select('id, session_name, location')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('세션 조회 오류:', fetchError)
      return
    }
    
    console.log('현재 게임 세션들:')
    sessions?.forEach(session => {
      console.log(`- ${session.session_name}: ${session.location || '(없음)'}`)
    })
    
    // 모든 location을 '라인볼링장'으로 업데이트
    const { data, error } = await supabase
      .from('game_sessions')
      .update({ location: '라인볼링장' })
      .neq('location', '라인볼링장') // 이미 '라인볼링장'이 아닌 것들만 업데이트
    
    if (error) {
      console.error('업데이트 오류:', error)
      return
    }
    
    console.log('✅ 모든 게임 세션의 location이 "라인볼링장"으로 업데이트되었습니다.')
    
    // 업데이트 후 확인
    const { data: updatedSessions, error: verifyError } = await supabase
      .from('game_sessions')
      .select('id, session_name, location')
      .order('created_at', { ascending: false })
    
    if (verifyError) {
      console.error('확인 조회 오류:', verifyError)
      return
    }
    
    console.log('\n업데이트 후 게임 세션들:')
    updatedSessions?.forEach(session => {
      console.log(`- ${session.session_name}: ${session.location}`)
    })
    
  } catch (error) {
    console.error('실행 오류:', error)
  }
}

// 스크립트 실행
updateAllLocationsToBowlingLane()
