// 2025년 8월 6일 참여 회원 조회 스크립트
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config()

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY를 확인해주세요.')
  console.error(`URL: ${supabaseUrl ? '설정됨' : '미설정'}`)
  console.error(`KEY: ${supabaseKey ? '설정됨' : '미설정'}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function queryMembersForDate() {
  try {
    console.log('🔍 2025년 8월 6일에 참여한 회원 조회 중...')
    
    // 2025년 8월 6일의 게임 세션과 참여 회원 조회
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        id,
        session_name,
        date,
        location,
        lane_number,
        total_participants,
        game_results(
          member_id,
          game_number,
          score,
          members(
            id,
            name,
            email
          )
        )
      `)
      .eq('date', '2025-08-06')

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      console.log('❌ 2025년 8월 6일에 게임 세션이 없습니다.')
      return { sessions: [], members: [] }
    }

    console.log(`📅 2025년 8월 6일에 ${data.length}개의 게임 세션이 있습니다:\n`)

    // 참여 회원 중복 제거
    const uniqueMembers = new Map()
    
    data.forEach((session, index) => {
      console.log(`🎳 세션 ${index + 1}:`)
      console.log(`   - ID: ${session.id}`)
      console.log(`   - 세션명: ${session.session_name || '이름 없음'}`)
      console.log(`   - 위치: ${session.location || '위치 정보 없음'}`)
      console.log(`   - 레인: ${session.lane_number || '레인 정보 없음'}`)
      console.log(`   - 참여자 수: ${session.total_participants || 0}명`)
      
      if (session.game_results && session.game_results.length > 0) {
        console.log(`   - 참여 회원:`)
        session.game_results.forEach(result => {
          if (result.members) {
            uniqueMembers.set(result.members.id, {
              ...result.members,
              sessionId: session.id,
              sessionName: session.session_name,
              laneNumber: session.lane_number
            })
            console.log(`     * ${result.members.name} (게임${result.game_number}: ${result.score}점)`)
          }
        })
      } else {
        console.log(`   - 참여 회원: 기록 없음`)
      }
      console.log('')
    })

    // 전체 참여 회원 요약
    console.log('='.repeat(50))
    console.log('👥 전체 참여 회원 요약:')
    console.log(`총 ${uniqueMembers.size}명이 참여했습니다.\n`)
    
    const memberList = Array.from(uniqueMembers.values())
    memberList.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name}`)
      console.log(`   - ID: ${member.id}`)
      console.log(`   - 이메일: ${member.email || '이메일 없음'}`)
      console.log(`   - 참여 세션: ${member.sessionName || '세션명 없음'}`)
      console.log(`   - 레인: ${member.laneNumber || '레인 정보 없음'}`)
      console.log('')
    })

    // 회원 이름만 배열로 반환
    const memberNames = memberList.map(member => member.name)
    console.log('📋 참여 회원 이름 목록:')
    console.log(memberNames.join(', '))

    return {
      sessions: data,
      members: memberList,
      memberNames: memberNames
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    if (error.details) {
      console.error('세부 정보:', error.details)
    }
    if (error.hint) {
      console.error('힌트:', error.hint)
    }
    throw error
  }
}

// 스크립트 실행
queryMembersForDate()
  .then(result => {
    if (result && result.members && result.members.length > 0) {
      console.log('\n✅ 조회 완료!')
      console.log(`총 ${result.members.length}명의 회원이 2025년 8월 6일에 참여했습니다.`)
    } else {
      console.log('\n📝 2025년 8월 6일에 참여한 회원이 없습니다.')
    }
  })
  .catch(error => {
    console.error('\n💥 스크립트 실행 중 오류:', error)
    process.exit(1)
  })
