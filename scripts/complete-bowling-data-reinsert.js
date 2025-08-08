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

// MD 파일에서 게임 데이터 파싱
function parseMarkdownFile() {
  const filePath = path.join(process.cwd(), 'sheets', 'bowling_games_parsed.md')
  const content = fs.readFileSync(filePath, 'utf-8')
  
  const sessions = []
  const lines = content.split('\n')
  
  let currentSession = null
  let currentTeam = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 세션 헤더 파싱 (### 날짜 (게임타입))
    if (line.startsWith('### ')) {
      if (currentSession) {
        sessions.push(currentSession)
      }
      
      const match = line.match(/### (\d{4}-\d{2}-\d{2}) \((.+)\)/)
      if (match) {
        currentSession = {
          date: match[1],
          type: match[2],
          teams: [],
          location: '라인볼링장' // 기본값
        }
      }
      continue
    }
    
    // 팀 헤더 파싱 (#### 팀 X - 레인 Y)
    if (line.startsWith('#### ')) {
      const match = line.match(/#### (.+) - 레인 (\d+)/)
      if (match && currentSession) {
        currentTeam = {
          name: match[1],
          laneNumber: parseInt(match[2]),
          members: []
        }
        currentSession.teams.push(currentTeam)
      }
      continue
    }
    
    // 게임 결과 파싱 (테이블 데이터)
    if (line.startsWith('|') && !line.includes('이름') && !line.includes('---') && currentTeam) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell)
      if (cells.length >= 5) {
        const name = cells[0]
        const game1 = cells[1] === '-' ? 0 : parseInt(cells[1]) || 0
        const game2 = cells[2] === '-' ? 0 : parseInt(cells[2]) || 0
        const game3 = cells[3] === '-' ? 0 : parseInt(cells[3]) || 0
        const total = parseInt(cells[4]) || 0
        const average = parseFloat(cells[5]) || 0
        
        if (name && !isNaN(game1) && !isNaN(game2) && !isNaN(game3)) {
          currentTeam.members.push({
            name,
            scores: [game1, game2, game3],
            total,
            average
          })
        }
      }
    }
  }
  
  if (currentSession) {
    sessions.push(currentSession)
  }
  
  return sessions
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

async function deleteAllBowlingData() {
  console.log('🗑️  기존 데이터 삭제 중...')
  
  // game_results 삭제
  const { error: gameResultsError } = await supabase
    .from('game_results')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 레코드 삭제
  
  if (gameResultsError) {
    console.error('❌ game_results 삭제 실패:', gameResultsError)
    throw gameResultsError
  }
  
  // game_sessions 삭제
  const { error: gameSessionsError } = await supabase
    .from('game_sessions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 레코드 삭제
  
  if (gameSessionsError) {
    console.error('❌ game_sessions 삭제 실패:', gameSessionsError)
    throw gameSessionsError
  }
  
  console.log('✅ 기존 데이터 삭제 완료')
}

async function insertBowlingData() {
  console.log('📊 MD 파일에서 데이터 파싱 중...')
  const sessions = parseMarkdownFile()
  
  // 2024-01-10부터 2025-08-06까지 필터링
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date)
    const startDate = new Date('2024-01-10')
    const endDate = new Date('2025-08-06')
    return sessionDate >= startDate && sessionDate <= endDate
  })
  
  console.log(`📅 ${filteredSessions.length}개 세션을 처리합니다.`)
  
  // 모든 회원 이름 수집
  const allMemberNames = new Set()
  filteredSessions.forEach(session => {
    session.teams.forEach(team => {
      team.members.forEach(member => {
        if (member.name && member.name !== '동수' && member.name !== '동수1' && member.name !== '동수2' && member.name !== '동수3') {
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
  for (const session of filteredSessions) {
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
  
  console.log(`✅ 모든 데이터 삽입 완료!`)
  console.log(`📊 생성된 세션: ${sessionCount}개`)
  console.log(`🎯 생성된 게임 결과: ${gameResultCount}개`)
  
  return { sessionCount, gameResultCount }
}

async function main() {
  try {
    console.log('🎳 볼링 데이터 완전 재삽입 시작...')
    console.log('📅 기간: 2024-01-10 ~ 2025-08-06')
    
    // 기존 데이터 삭제
    await deleteAllBowlingData()
    
    // 새 데이터 삽입
    const result = await insertBowlingData()
    
    console.log('\n🎉 완료!')
    console.log(`📊 총 ${result.sessionCount}개 세션, ${result.gameResultCount}개 게임 결과가 생성되었습니다.`)
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()
