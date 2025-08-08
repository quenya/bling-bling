import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';

const excelFilePath = path.join(process.cwd(), 'sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
const excelData = readExcelFileFromPath(excelFilePath);

// 2025년 8월 시트 구조 분석
const sheet = excelData.find(s => s.sheetName === '2025_08월_미니게임');
if (sheet) {
  console.log('=== 2025_08월_미니게임 전체 구조 ===');
  console.log('총 행 수:', sheet.data.length);
  
  // 모든 행 출력 (처음 20행)
  for (let i = 0; i < Math.min(20, sheet.data.length); i++) {
    const row = sheet.data[i];
    console.log(`행 ${i + 1}:`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
  }
  
  console.log('\n=== 팀 관련 행들 검색 ===');
  for (let i = 0; i < sheet.data.length; i++) {
    const row = sheet.data[i];
    if (row.some(cell => cell && /^[A-F]$/.test(cell.toString().trim()))) {
      console.log(`행 ${i + 1}:`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
    }
  }
}
