import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 특정 월의 둘째주 또는 넷째주 수요일 계산
function getWednesdayOfWeek(year, month, weekNumber) {
  // weekNumber: 2 = 둘째주, 4 = 넷째주
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
  
  // 해당 월의 첫 번째 수요일 찾기
  let firstWednesday = 1;
  if (firstDayOfWeek <= 3) { // 월화수 중 하나라면
    firstWednesday = 4 - firstDayOfWeek;
  } else { // 목금토일 중 하나라면
    firstWednesday = 11 - firstDayOfWeek;
  }
  
  // 원하는 주차의 수요일 계산
  const targetWednesday = firstWednesday + (weekNumber - 1) * 7;
  
  // 해당 월의 마지막 날 체크
  const lastDay = new Date(year, month, 0).getDate();
  
  if (targetWednesday > lastDay) {
    // 넷째주 수요일이 다음 달로 넘어가는 경우, 그 전 주 수요일 사용
    return targetWednesday - 7;
  }
  
  return targetWednesday;
}

// 탭 이름에서 날짜 추출
function extractDateFromSheetName(sheetName) {
  // 예: "2025_08월_미니게임" -> { year: 2025, month: 8, gameType: "미니게임" }
  const match = sheetName.match(/(\d{4})_(\d+)월_(미니게임|라지게임)/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const gameType = match[3];
  
  // 미니게임은 둘째주 수요일, 라지게임은 넷째주 수요일
  const weekNumber = gameType === '미니게임' ? 2 : 4;
  const day = getWednesdayOfWeek(year, month, weekNumber);
  
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  return {
    year,
    month,
    day,
    gameType,
    date: dateStr
  };
}

// 레인 번호 추출 (조 셀에서 두번째 줄의 첫번째 숫자)
function extractLaneNumber(cellValue) {
  if (!cellValue) return null;
  
  const lines = cellValue.toString().split('\n');
  if (lines.length < 2) return null;
  
  const secondLine = lines[1];
  const numbers = secondLine.match(/\d+/g);
  
  return numbers ? parseInt(numbers[0]) : null;
}

function analyzeGameSheets() {
  try {
    const excelFilePath = path.join(__dirname, '../sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
    const excelData = readExcelFileFromPath(excelFilePath);
    
    // 게임 시트들 필터링 (미니게임, 라지게임)
    const gameSheets = excelData.filter(sheet => 
      sheet.sheetName.includes('미니게임') || sheet.sheetName.includes('라지게임')
    );
    
    console.log(`🎳 발견된 게임 시트: ${gameSheets.length}개\n`);
    
    // 각 시트 분석
    gameSheets.forEach(sheet => {
      console.log(`\n📋 시트: ${sheet.sheetName}`);
      console.log(`   행 수: ${sheet.data.length}, 열 수: ${sheet.data[0]?.length || 0}`);
      
      const dateInfo = extractDateFromSheetName(sheet.sheetName);
      if (dateInfo) {
        console.log(`   📅 계산된 날짜: ${dateInfo.date} (${dateInfo.gameType})`);
      }
      
      console.log('   📊 처음 10행 데이터:');
      sheet.data.slice(0, 10).forEach((row, index) => {
        console.log(`     행 ${index + 1}: ${JSON.stringify(row)}`);
      });
    });
    
    // 샘플 시트 하나를 선택해서 상세 분석
    const sampleSheet = gameSheets.find(s => s.sheetName.includes('2025_08월_미니게임'));
    if (sampleSheet) {
      console.log('\n🔍 샘플 시트 상세 분석: 2025_08월_미니게임');
      console.log('전체 데이터:');
      sampleSheet.data.forEach((row, index) => {
        console.log(`행 ${index + 1}: ${JSON.stringify(row)}`);
      });
    }
    
    return gameSheets;
    
  } catch (error) {
    console.error('❌ 분석 오류:', error);
  }
}

// 실행
analyzeGameSheets();
