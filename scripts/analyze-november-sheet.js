import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';

const excelFilePath = path.join(process.cwd(), 'sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
const excelData = readExcelFileFromPath(excelFilePath);

// 2024_11월_미니게임_결과 시트 찾기
const novemberSheet = excelData.find(sheet => sheet.sheetName === '2024_11월_미니게임_결과');

if (novemberSheet) {
  console.log('=== 2024년 11월 미니게임 시트 구조 분석 ===');
  console.log('총 행 수:', novemberSheet.data.length);
  
  // 헤더 행들 확인 (첫 15행)
  console.log('\n=== 첫 15행 구조 ===');
  for (let i = 0; i < Math.min(15, novemberSheet.data.length); i++) {
    const row = novemberSheet.data[i];
    console.log(`행 ${i + 1}:`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
  }
  
  // 팀 A 데이터 부분 찾기
  console.log('\n=== 팀 관련 행들 (처음 20개) ===');
  let teamCount = 0;
  for (let i = 0; i < novemberSheet.data.length && teamCount < 20; i++) {
    const row = novemberSheet.data[i];
    if (row.some(cell => cell && /[A-F]/i.test(cell.toString()))) {
      console.log(`행 ${i + 1}:`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
      teamCount++;
    }
  }
} else {
  console.log('2024_11월_미니게임_결과 시트를 찾을 수 없습니다.');
  console.log('사용 가능한 시트들:');
  excelData.forEach(sheet => console.log('  -', sheet.sheetName));
}
