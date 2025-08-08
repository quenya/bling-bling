import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// .env 파일 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL과 KEY를 .env 파일에 설정해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 2025-08-06 데이터만 파싱
function parse2025080Data() {
  const session = {
    date: '2025-08-06',
    type: '미니게임',
    teams: [
      {
        name: '팀 A',
        laneNumber: 13,
        members: [
          { name: '최은규', scores: [181, 174, 197], total: 552, average: 184.0 },
          { name: '오수인', scores: [213, 135, 204], total: 552, average: 184.0 }
        ]
      },
      {
        name: '팀 B', 
        laneNumber: 14,
        members: [
          { name: '채승엽', scores: [196, 182, 158], total: 536, average: 178.7 },
          { name: '박용승', scores: [150, 183, 159], total: 492, average: 164.0 },
          { name: '남준석', scores: [162, 140, 152], total: 454, average: 151.3 }
        ]
      },
      {
        name: '팀 C',
        laneNumber: 15,
        members: [
          { name: '손하은', scores: [167, 164, 171], total: 502, average: 167.3 },
          { name: '권진현', scores: [114, 165, 109], total: 388, average: 129.3 },
          { name: '이경준', scores: [106, 103, 110], total: 319, average: 106.3 }
        ]
      },
      {
        name: '팀 D',
        laneNumber: 16,
        members: [
          { name: '백동민', scores: [200, 145, 128], total: 473, average: 157.7 },
          { name: '정동현', scores: [135, 167, 134], total: 436, average: 145.3 },
          { name: '이종현', scores: [120, 122, 104], total: 346, average: 115.3 }
        ]
      }
    ],
    location: '라인볼링장'
  }
  
  return [session]
}

// 회원 이름을 기반으로 회원 ID 매핑 생성
async function createMemberMapping(allMemberNames) {
  const { data: existingMembers } = await supabase
    .from('members')
    .select('id, name')
  
  const memberMap = new Map()
  
  if (existingMembers) {
    existingMembers.forEach(member => {
      memberMap.set(member.name, member.id)
    })
  }
  
  // 새로운 회원 추가
  const newMembers = allMemberNames.filter(name => !memberMap.has(name))
  
  for (const name of newMembers) {
    const { data, error } = await supabase
      .from('members')
      .insert({ 
        name,
        email: null,
        phone: null,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) {
      console.error(`❌ 회원 ${name} 추가 실패:`, error)
    } else {
      memberMap.set(name, data.id)
      console.log(`✅ 새 회원 추가: ${name}`)
    }
  }
  
  return memberMap
}

async function insert2025080Data() {
  console.log('📊 2025-08-06 데이터 삽입 중...')
  const sessions = parse2025080Data()
  
  // 모든 회원 이름 수집
  const allMemberNames = new Set()
  sessions.forEach(session => {
    session.teams.forEach(team => {
      team.members.forEach(member => {
        if (member.name && member.name !== '동수') {
          allMemberNames.add(member.name)
        }
      })
    })
  })
  
  console.log(`👥 총 ${allMemberNames.size}명의 회원이 있습니다.`)
  
  const memberMap = await createMemberMapping([...allMemberNames])
  
  let sessionCount = 0
  let gameResultCount = 0
  
  // 세션별 데이터 삽입
  for (const session of sessions) {
    for (const team of session.teams) {
      if (team.members.length === 0) continue
      
      const sessionName = `${session.date} ${session.type}`
      
      // 게임 세션 생성
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          session_name: sessionName,
          date: session.date,
          location: session.location,
          lane_number: team.laneNumber,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()
      
      if (sessionError) {
        console.error(`❌ 세션 생성 실패 (${sessionName}, 레인 ${team.laneNumber}):`, sessionError)
        continue
      }
      
      sessionCount++
      console.log(`✅ 세션 생성: ${sessionName} - 레인 ${team.laneNumber}`)
      
      // 게임 결과 생성
      for (const member of team.members) {
        if (!member.name || member.name.includes('동수')) continue
        
        const memberId = memberMap.get(member.name)
        if (!memberId) {
          console.log(`⚠️  회원 ${member.name}의 ID를 찾을 수 없습니다.`)
          continue
        }
        
        for (let gameIndex = 0; gameIndex < member.scores.length; gameIndex++) {
          const score = member.scores[gameIndex]
          if (score > 0) {
            const { error: resultError } = await supabase
              .from('game_results')
              .insert({
                session_id: sessionData.id,
                member_id: memberId,
                game_number: gameIndex + 1,
                score: score,
                created_at: new Date().toISOString()
              })
            
            if (resultError) {
              console.error(`❌ 게임 결과 생성 실패 (${member.name}, 게임 ${gameIndex + 1}):`, resultError)
            } else {
              gameResultCount++
            }
          }
        }
      }
    }
  }
  
  console.log(`✅ 2025-08-06 데이터 삽입 완료!`)
  console.log(`📊 생성된 세션: ${sessionCount}개`)
  console.log(`🎯 생성된 게임 결과: ${gameResultCount}개`)
  
  return { sessionCount, gameResultCount }
}

async function main() {
  try {
    console.log('🎳 2025-08-06 볼링 데이터 삽입 시작...')
    
    // 2025-08-06 데이터 삽입
    const result = await insert2025080Data()
    
    console.log('\n🎉 완료!')
    console.log(`📊 총 ${result.sessionCount}개 세션, ${result.gameResultCount}개 게임 결과가 생성되었습니다.`)
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()
