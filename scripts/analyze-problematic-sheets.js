import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';

const excelFilePath = path.join(process.cwd(), 'sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
const excelData = readExcelFileFromPath(excelFilePath);

// 문제가 있는 시기의 시트들 샘플링
const problematicSheets = [
  '2024_1월(1)_미니게임_결과',
  '2024_5월_미니게임_결과', 
  '2024_9월_미니게임_결과'
];

problematicSheets.forEach(sheetName => {
  const sheet = excelData.find(s => s.sheetName === sheetName);
  if (sheet) {
    console.log(`\n=== ${sheetName} 구조 분석 ===`);
    
    // 헤더 부분 확인 (행 10-15 정도)
    console.log('\n헤더 부분:');
    for (let i = 9; i < Math.min(16, sheet.data.length); i++) {
      const row = sheet.data[i];
      console.log(`행 ${i + 1}:`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
    }
    
    // 첫 번째 팀 데이터 찾기
    console.log('\n첫 번째 팀 데이터:');
    for (let i = 0; i < sheet.data.length; i++) {
      const row = sheet.data[i];
      // 팀 표시가 있는 행 찾기 (B, C, D, E 등)
      if (row[1] && /^[B-F]$/.test(row[1].toString().trim()) && row[2] && typeof row[2] === 'string') {
        console.log(`팀 ${row[1]} 첫 번째 멤버 (행 ${i + 1}):`, row.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
        
        // 다음 2명도 확인
        for (let j = 1; j <= 2 && i + j < sheet.data.length; j++) {
          const nextRow = sheet.data[i + j];
          if (nextRow[2] && typeof nextRow[2] === 'string') {
            console.log(`  다음 멤버 (행 ${i + j + 1}):`, nextRow.slice(0, 15).map((cell, idx) => `[${idx}:${cell || 'empty'}]`).join(' '));
          }
        }
        break;
      }
    }
    
    // 볼링 점수 같은 값들이 있는 컬럼 찾기
    console.log('\n점수 후보 컬럼들:');
    for (let i = 0; i < sheet.data.length; i++) {
      const row = sheet.data[i];
      if (row[1] && /^[B-F]$/.test(row[1].toString().trim()) && row[2] && typeof row[2] === 'string') {
        for (let col = 3; col < 15; col++) {
          const value = row[col];
          if (typeof value === 'number' && value >= 50 && value <= 300) {
            console.log(`  컬럼 ${col}: ${value} (볼링 점수 후보)`);
          }
        }
        break;
      }
    }
    
  } else {
    console.log(`\n${sheetName} 시트를 찾을 수 없습니다.`);
  }
});
