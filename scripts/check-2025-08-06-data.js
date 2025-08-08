import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env 파일 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL과 KEY를 .env 파일에 설정해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  try {
    console.log('🎳 2025-08-06 데이터 확인 중...')
    
    // 2025-08-06 세션 조회
    const { data: sessions, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('date', '2025-08-06')
      .order('lane_number')
    
    if (sessionError) {
      console.error('❌ 세션 조회 실패:', sessionError)
      return
    }
    
    console.log(`📊 2025-08-06에 ${sessions.length}개 세션이 있습니다:`)
    
    for (const session of sessions) {
      console.log(`\n🎯 세션: ${session.session_name}`)
      console.log(`   📍 레인: ${session.lane_number}`)
      console.log(`   📅 ID: ${session.id}`)
      
      // 해당 세션의 게임 결과 조회
      const { data: results, error: resultError } = await supabase
        .from('game_results')
        .select(`
          *,
          members (name)
        `)
        .eq('session_id', session.id)
        .order('member_id')
        .order('game_number')
      
      if (resultError) {
        console.error('❌ 게임 결과 조회 실패:', resultError)
        continue
      }
      
      console.log(`   👥 ${results.length}개의 게임 결과:`)
      
      const memberGroups = {}
      results.forEach(result => {
        const memberName = result.members.name
        if (!memberGroups[memberName]) {
          memberGroups[memberName] = []
        }
        memberGroups[memberName].push(result)
      })
      
      Object.entries(memberGroups).forEach(([memberName, memberResults]) => {
        const scores = memberResults.map(r => r.score).join(', ')
        console.log(`      - ${memberName}: ${scores}점`)
      })
    }
    
    // 전체 통계
    const { data: allResults, error: allError } = await supabase
      .from('game_results')
      .select(`
        *,
        members (name),
        game_sessions (date, session_name, lane_number)
      `)
      .eq('game_sessions.date', '2025-08-06')
    
    if (!allError) {
      const uniqueMembers = new Set(allResults.map(r => r.members.name))
      console.log(`\n📋 2025-08-06 전체 참여 회원: ${uniqueMembers.size}명`)
      console.log(`   이름: ${[...uniqueMembers].join(', ')}`)
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

main()
