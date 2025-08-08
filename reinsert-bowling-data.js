// 볼링 데이터 재삽입 스크립트 (MD 파일의 완전한 데이터셋)
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// 파싱된 볼링 데이터 (MD 파일 기반)
const bowlingData = [
  {
    date: '2024-01-10',
    type: '미니게임',
    location: '라인볼링장',
    teams: [
      {
        name: '팀 B',
        lane: 13,
        members: [
          { name: '박용승', scores: [162, 162, 188] },
          { name: '최은규', scores: [179, 157, 155] },
          { name: '김신철', scores: [213, 185, 191] }
        ]
      },
      {
        name: '팀 C',
        lane: 14,
        members: [
          { name: '조문수', scores: [203, 143, 147] },
          { name: '김예지', scores: [118, 173, 130] },
          { name: '채승엽', scores: [124, 170, 181] }
        ]
      },
      {
        name: '팀 D',
        lane: 15,
        members: [
          { name: '정동현', scores: [164, 157, 139] },
          { name: '이강은', scores: [116, 157, 144] },
          { name: '한희용', scores: [180, 227, 160] }
        ]
      },
      {
        name: '팀 E',
        lane: 16,
        members: [
          { name: '전병기', scores: [143, 184, 182] },
          { name: '천재복', scores: [150, 174, 181] },
          { name: '조연희', scores: [128, 145, 140] }
        ]
      }
    ]
  },
  {
    date: '2024-01-10',
    type: '미니게임',
    location: '라인볼링장',
    sessionName: '2차전',
    teams: [
      {
        name: '팀 B',
        lane: 13,
        members: [
          { name: '최은규', scores: [147, 165, 181] },
          { name: '박용승', scores: [177, 161, 182] },
          { name: '전병기', scores: [136, 167, 151] },
          { name: '김주현', scores: [100, 109, 99] }
        ]
      },
      {
        name: '팀 C',
        lane: 14,
        members: [
          { name: '정동현', scores: [139, 186, 152] },
          { name: '성소라', scores: [142, 147, 127] },
          { name: '이수용', scores: [164, 147, 154] },
          { name: '권진현', scores: [82, 129, 86] }
        ]
      },
      {
        name: '팀 D',
        lane: 15,
        members: [
          { name: '이강은', scores: [138, 147, 152] },
          { name: '김신철', scores: [165, 143, 148] },
          { name: '이한나', scores: [155, 185, 168] },
          { name: '조헌우', scores: [144, 108, 108] }
        ]
      }
    ]
  },
  {
    date: '2024-02-14',
    type: '미니게임',
    location: '라인볼링장',
    teams: [
      {
        name: '팀 B',
        lane: 13,
        members: [
          { name: '이수용', scores: [167, 168, 152] },
          { name: '백동민', scores: [151, 173, 201] },
          { name: '이강은', scores: [172, 182, 157] }
        ]
      },
      {
        name: '팀 C',
        lane: 14,
        members: [
          { name: '정동현', scores: [180, 146, 143] },
          { name: '최은규', scores: [180, 147, 128] },
          { name: '박용승', scores: [158, 159, 136] }
        ]
      },
      {
        name: '팀 D',
        lane: 15,
        members: [
          { name: '전병기', scores: [180, 148, 219] },
          { name: '성소라', scores: [147, 194, 155] },
          { name: '이한나', scores: [120, 143, 135] }
        ]
      },
      {
        name: '팀 E',
        lane: 16,
        members: [
          { name: '조문수', scores: [174, 202, 185] },
          { name: '채승엽', scores: [154, 124, 158] },
          { name: '김창현', scores: [185, 189, 160] }
        ]
      }
    ]
  },
  {
    date: '2025-08-06',
    type: '미니게임',
    location: '라인볼링장',
    sessionName: '2025-08-06 미니게임',
    teams: [
      {
        name: '팀 A',
        lane: 13,
        members: [
          { name: '최은규', scores: [181, 174, 197] },
          { name: '오수인', scores: [213, 135, 204] },
          { name: '동수', scores: [118, 118, 118] }
        ]
      },
      {
        name: '팀 B',
        lane: 14,
        members: [
          { name: '채승엽', scores: [196, 182, 158] },
          { name: '박용승', scores: [150, 183, 159] },
          { name: '남준석', scores: [162, 140, 152] }
        ]
      },
      {
        name: '팀 C',
        lane: 15,
        members: [
          { name: '손하은', scores: [167, 164, 171] },
          { name: '권진현', scores: [114, 165, 109] },
          { name: '이경준', scores: [106, 103, 110] }
        ]
      },
      {
        name: '팀 D',
        lane: 16,
        members: [
          { name: '백동민', scores: [200, 145, 128] },
          { name: '정동현', scores: [135, 167, 134] },
          { name: '이종현', scores: [120, 122, 104] }
        ]
      }
    ]
  }
]

// 회원 이름 매핑 (일관성을 위해)
const memberNameMapping = {
  '박용승': '박용승',
  '최은규': '최은규', 
  '김신철': '김신철',
  '조문수': '조문수',
  '김예지': '김예지',
  '채승엽': '채승엽',
  '정동현': '정동현',
  '이강은': '이강은',
  '한희용': '한희용',
  '전병기': '전병기',
  '천재복': '천재복',
  '조연희': '조연희',
  '김주현': '김주현',
  '성소라': '성소라',
  '이수용': '이수용',
  '권진현': '권진현',
  '이한나': '이한나',
  '조헌우': '조헌우',
  '백동민': '백동민',
  '김창현': '김창현',
  '이주희': '이주희',
  '동수': '동수',
  '오수인': '오수인',
  '손하은': '손하은',
  '남준석': '남준석',
  '이경준': '이경준',
  '이종현': '이종현'
}

async function clearAndReinsertData() {
  try {
    console.log('🗑️  기존 데이터 삭제 중...')
    
    // 1. 기존 game_results 삭제
    const { error: deleteResultsError } = await supabase
      .from('game_results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 데이터 삭제
    
    if (deleteResultsError) {
      console.error('game_results 삭제 오류:', deleteResultsError)
    } else {
      console.log('✅ game_results 테이블 삭제 완료')
    }

    // 2. 기존 game_sessions 삭제  
    const { error: deleteSessionsError } = await supabase
      .from('game_sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 데이터 삭제
    
    if (deleteSessionsError) {
      console.error('game_sessions 삭제 오류:', deleteSessionsError)
    } else {
      console.log('✅ game_sessions 테이블 삭제 완료')
    }

    // 3. 기존 회원 정보는 유지하되, 필요한 회원만 추가
    console.log('👥 회원 정보 확인 및 추가 중...')
    
    // 모든 회원 이름 수집
    const allMemberNames = new Set()
    bowlingData.forEach(session => {
      session.teams.forEach(team => {
        team.members.forEach(member => {
          allMemberNames.add(memberNameMapping[member.name] || member.name)
        })
      })
    })

    // 기존 회원 조회
    const { data: existingMembers } = await supabase
      .from('members')
      .select('name')
    
    const existingMemberNames = new Set(existingMembers?.map(m => m.name) || [])

    // 새 회원 추가
    const newMembers = Array.from(allMemberNames).filter(name => !existingMemberNames.has(name))
    
    if (newMembers.length > 0) {
      const membersToInsert = newMembers.map(name => ({
        name,
        joined_date: '2024-01-01',
        is_active: true
      }))

      const { error: membersError } = await supabase
        .from('members')
        .insert(membersToInsert)

      if (membersError) {
        console.error('회원 추가 오류:', membersError)
      } else {
        console.log(`✅ ${newMembers.length}명의 새 회원 추가 완료:`, newMembers.join(', '))
      }
    }

    // 4. 모든 회원 정보 다시 조회
    const { data: allMembers } = await supabase
      .from('members')
      .select('id, name')
    
    const memberMap = new Map()
    allMembers?.forEach(member => {
      memberMap.set(member.name, member.id)
    })

    console.log('🎳 새 게임 데이터 삽입 중...')

    // 5. 새 데이터 삽입
    for (const sessionData of bowlingData) {
      for (const team of sessionData.teams) {
        // 게임 세션 생성
        const sessionToInsert = {
          session_name: sessionData.sessionName || `${sessionData.date} ${sessionData.type} - ${team.name}`,
          date: sessionData.date,
          location: sessionData.location,
          lane_number: team.lane,
          total_participants: team.members.length,
          session_type: sessionData.type === '미니게임' ? 'regular' : 'tournament'
        }

        const { data: insertedSession, error: sessionError } = await supabase
          .from('game_sessions')
          .insert([sessionToInsert])
          .select()
          .single()

        if (sessionError) {
          console.error(`세션 삽입 오류 (${team.name}):`, sessionError)
          continue
        }

        console.log(`✅ 세션 생성: ${insertedSession.session_name}`)

        // 게임 결과 삽입
        for (const member of team.members) {
          const memberName = memberNameMapping[member.name] || member.name
          const memberId = memberMap.get(memberName)
          
          if (!memberId) {
            console.warn(`⚠️  회원을 찾을 수 없음: ${memberName}`)
            continue
          }

          // 각 게임별로 결과 삽입
          for (let gameNum = 1; gameNum <= 3; gameNum++) {
            if (member.scores[gameNum - 1] !== undefined) {
              const gameResult = {
                session_id: insertedSession.id,
                member_id: memberId,
                game_number: gameNum,
                score: member.scores[gameNum - 1],
                strikes: 0, // 나중에 계산
                spares: 0   // 나중에 계산
              }

              const { error: resultError } = await supabase
                .from('game_results')
                .insert([gameResult])

              if (resultError) {
                console.error(`게임 결과 삽입 오류 (${memberName} 게임${gameNum}):`, resultError)
              }
            }
          }
        }
      }
    }

    console.log('✅ 모든 데이터 삽입 완료!')
    
    // 최종 확인
    const { data: finalSessions } = await supabase
      .from('game_sessions')
      .select('*')
      .order('date', { ascending: true })

    const { data: finalResults } = await supabase
      .from('game_results')
      .select('*')

    console.log(`📊 최종 결과:`)
    console.log(`   - 총 세션 수: ${finalSessions?.length || 0}`)
    console.log(`   - 총 게임 결과: ${finalResults?.length || 0}`)

  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

// 스크립트 실행
clearAndReinsertData()
  .then(() => {
    console.log('🎉 데이터 재삽입 완료!')
  })
  .catch(error => {
    console.error('스크립트 실행 실패:', error)
    process.exit(1)
  })
