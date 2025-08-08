import XLSX from 'xlsx';
import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function excelDateToJSDate(excelDate) {
  // Excel의 날짜는 1900년 1월 1일부터의 일수
  // JavaScript Date는 1970년 1월 1일부터의 밀리초
  const excelEpoch = new Date(1900, 0, 1);
  const jsDate = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
  
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0');
  const day = String(jsDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function parseScoreSheet() {
  try {
    const excelFilePath = path.join(__dirname, '../sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
    const excelData = readExcelFileFromPath(excelFilePath);
    
    // "전체점수(순)" 시트 찾기
    const scoreSheet = excelData.find(sheet => sheet.sheetName === '전체점수(순)');
    
    if (!scoreSheet) {
      console.log('❌ "전체점수(순)" 시트를 찾을 수 없습니다.');
      return;
    }
    
    console.log('📊 "전체점수(순)" 시트 분석 중...');
    console.log(`행 수: ${scoreSheet.data.length}`);
    console.log(`열 수: ${scoreSheet.data[0]?.length || 0}`);
    
    // 헤더 행 분석 (첫 번째 행에서 날짜 정보 추출)
    const headerRow = scoreSheet.data[0];
    const gameNumberRow = scoreSheet.data[1]; // 게임 번호 (1, 2, 3)
    
    console.log('\n📅 헤더 행 (처음 20개 열):');
    console.log(headerRow.slice(0, 20));
    
    console.log('\n🎯 게임 번호 행 (처음 20개 열):');
    console.log(gameNumberRow.slice(0, 20));
    
    // 날짜 정보와 게임 번호 매핑
    const dateGameMapping = [];
    
    let currentDate = '';
    
    for (let i = 2; i < headerRow.length; i++) { // 첫 2열은 이름, 가입 정보
      const cellValue = headerRow[i];
      const gameNum = gameNumberRow[i];
      
      // 날짜인지 확인 (숫자 형태의 Excel 날짜)
      if (typeof cellValue === 'number' && cellValue > 40000) { // Excel 날짜 범위
        currentDate = excelDateToJSDate(cellValue);
      }
      
      // 게임 번호가 1, 2, 3인 경우만 기록
      if (currentDate && (gameNum === 1 || gameNum === 2 || gameNum === 3)) {
        dateGameMapping.push({
          columnIndex: i,
          date: currentDate,
          gameNumber: gameNum
        });
      }
    }
    
    console.log('\n📅 발견된 날짜와 게임 매핑 (처음 10개):');
    dateGameMapping.slice(0, 10).forEach(mapping => {
      console.log(`${mapping.date} - 게임${mapping.gameNumber} (열 ${mapping.columnIndex})`);
    });
    
    // 날짜별 그룹화
    const dateGroups = new Map();
    
    dateGameMapping.forEach(mapping => {
      if (!dateGroups.has(mapping.date)) {
        dateGroups.set(mapping.date, []);
      }
      dateGroups.get(mapping.date).push({
        columnIndex: mapping.columnIndex,
        gameNumber: mapping.gameNumber
      });
    });
    
    console.log(`\n🗓️ 총 ${dateGroups.size}개의 날짜 발견`);
    
    // 각 날짜별 데이터 파싱
    const results = [];
    
    for (const [date, gameColumns] of dateGroups) {
      const members = [];
      
      // 3번째 행부터 멤버 데이터
      for (let rowIndex = 2; rowIndex < scoreSheet.data.length; rowIndex++) {
        const row = scoreSheet.data[rowIndex];
        const memberName = row[0]?.toString().trim();
        
        if (!memberName) continue;
        
        // 이 날짜의 게임 점수들 추출
        let game1 = null;
        let game2 = null;
        let game3 = null;
        
        gameColumns.forEach(({ columnIndex, gameNumber }) => {
          const score = row[columnIndex];
          const parsedScore = typeof score === 'number' ? score : 
                             (typeof score === 'string' ? parseInt(score) : null);
          
          if (parsedScore !== null && !isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 300) {
            if (gameNumber === 1) game1 = parsedScore;
            else if (gameNumber === 2) game2 = parsedScore;
            else if (gameNumber === 3) game3 = parsedScore;
          }
        });
        
        // 이 날짜에 점수가 있는 멤버만 포함
        if (game1 !== null || game2 !== null || game3 !== null) {
          members.push({
            name: memberName,
            game1,
            game2,
            game3
          });
        }
      }
      
      // 이 날짜에 점수가 있는 멤버가 있는 경우만 결과에 포함
      if (members.length > 0) {
        results.push({
          date,
          members
        });
      }
    }
    
    // 날짜순으로 정렬
    results.sort((a, b) => a.date.localeCompare(b.date));
    
    console.log('\n🎳 파싱 결과:');
    console.log(`총 ${results.length}개의 날짜에서 점수 데이터 발견\n`);
    
    // 최근 10개 날짜 출력
    const recentResults = results.slice(-10);
    
    recentResults.forEach((dateResult, index) => {
      console.log(`${index + 1}. 📅 ${dateResult.date}`);
      console.log(`   참여 멤버: ${dateResult.members.length}명`);
      
      dateResult.members.forEach(member => {
        const scores = [
          member.game1 !== null ? member.game1.toString() : '-',
          member.game2 !== null ? member.game2.toString() : '-',
          member.game3 !== null ? member.game3.toString() : '-'
        ];
        console.log(`   ${member.name}: [${scores.join(', ')}]`);
      });
      console.log('');
    });
    
    if (results.length > 10) {
      console.log(`... 외 ${results.length - 10}개 날짜 더`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 파싱 오류:', error);
  }
}

// 스크립트 실행
parseScoreSheet();
