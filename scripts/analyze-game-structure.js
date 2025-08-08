import { readExcelFileFromPath } from '../src/utils/excelParser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeGameStructure() {
  try {
    const excelFilePath = path.join(__dirname, '../sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
    const excelData = readExcelFileFromPath(excelFilePath);
    
    // 2025_08월_미니게임 시트로 분석
    const sampleSheet = excelData.find(s => s.sheetName === '2025_08월_미니게임');
    if (!sampleSheet) {
      console.log('샘플 시트를 찾을 수 없습니다.');
      return;
    }
    
    console.log('🔍 2025_08월_미니게임 시트 분석\n');
    
    // 헤더 행들 분석 (10~12행)
    console.log('📋 헤더 분석:');
    for (let i = 9; i <= 12; i++) {
      if (sampleSheet.data[i]) {
        console.log(`행 ${i + 1}:`, sampleSheet.data[i].slice(0, 15));
      }
    }
    
    console.log('\n🎯 데이터 행 분석 (첫 번째 팀):');
    for (let i = 12; i <= 17; i++) {
      if (sampleSheet.data[i]) {
        console.log(`행 ${i + 1}:`, sampleSheet.data[i].slice(0, 15));
      }
    }
    
    // 열 인덱스 매핑 찾기
    console.log('\n📊 게임별 열 인덱스 찾기:');
    const headerRow = sampleSheet.data[10]; // 11행
    const gameRow = sampleSheet.data[10]; // 게임 번호 행
    
    if (headerRow) {
      for (let i = 0; i < Math.min(headerRow.length, 20); i++) {
        const value = headerRow[i];
        if (value === 1 || value === 2 || value === 3) {
          console.log(`열 ${i}: 게임 ${value}`);
        }
      }
    }
    
    // 실제 데이터에서 점수 위치 확인
    console.log('\n🎳 실제 점수 데이터 확인:');
    const teamARow = sampleSheet.data[12]; // 첫 번째 팀 첫 번째 멤버
    if (teamARow) {
      console.log('팀 A 첫 번째 멤버 데이터:');
      for (let i = 0; i < Math.min(teamARow.length, 20); i++) {
        const value = teamARow[i];
        if (typeof value === 'number' && value > 0 && value <= 300) {
          console.log(`  열 ${i}: ${value} (점수 후보)`);
        } else if (value) {
          console.log(`  열 ${i}: ${value} (기타)`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 분석 오류:', error);
  }
}

analyzeGameStructure();
