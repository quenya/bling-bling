import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';

const excelFilePath = path.join(process.cwd(), 'sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
const excelData = readExcelFileFromPath(excelFilePath);

// 여러 시트 구조 비교
const sheetsToCheck = [
  '2024_10월_미니게임_결과', // 구 구조
  '2024_11월_미니게임_결과', // 신 구조
  '2025_08월_미니게임'       // 최신
];

sheetsToCheck.forEach(sheetName => {
  const sheet = excelData.find(s => s.sheetName === sheetName);
  if (sheet) {
    console.log(`\n=== ${sheetName} 구조 분석 ===`);
    
    // 첫 번째 팀 A 데이터 행 찾기
    for (let i = 0; i < sheet.data.length; i++) {
      const row = sheet.data[i];
      if (row[1] === 'A' && row[2] && typeof row[2] === 'string') {
        console.log(`팀 A 첫 번째 멤버 (행 ${i + 1}):`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
        break;
      }
    }
  } else {
    console.log(`\n${sheetName} 시트를 찾을 수 없습니다.`);
  }
});
