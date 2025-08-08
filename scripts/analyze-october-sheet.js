import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';

const excelFilePath = path.join(process.cwd(), 'sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
const excelData = readExcelFileFromPath(excelFilePath);

// 2024년 10월 시트 구조 분석
const sheet = excelData.find(s => s.sheetName === '2024_10월_미니게임_결과');
if (sheet) {
  console.log('=== 2024_10월_미니게임_결과 구조 분석 ===');
  console.log('총 행 수:', sheet.data.length);
  
  // 첫 15행 구조 확인
  console.log('\n=== 첫 15행 구조 ===');
  for (let i = 0; i < Math.min(15, sheet.data.length); i++) {
    const row = sheet.data[i];
    console.log(`행 ${i + 1}:`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
  }
  
  // 팀 A 첫 번째 멤버 찾기
  console.log('\n=== 팀 A 첫 번째 멤버 ===');
  for (let i = 0; i < sheet.data.length; i++) {
    const row = sheet.data[i];
    if (row[1] === 'A' && row[2] && typeof row[2] === 'string') {
      console.log(`팀 A 첫 번째 멤버 (행 ${i + 1}):`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
      
      // 다음 2-3명도 확인
      for (let j = 1; j <= 3 && i + j < sheet.data.length; j++) {
        const nextRow = sheet.data[i + j];
        if (nextRow[2] && typeof nextRow[2] === 'string') {
          console.log(`  다음 멤버 (행 ${i + j + 1}):`, nextRow.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
        }
      }
      break;
    }
  }
}
