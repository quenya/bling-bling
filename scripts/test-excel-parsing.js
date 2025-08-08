import { readExcelFileFromPath, analyzeExcelStructure, parseBowlingData } from '../src/utils/excelParser.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testExcelParsing() {
  try {
    const excelFilePath = path.join(__dirname, '../sheets/볼링에버관리_2025-08_1주차_V2.1.xlsx');
    
    console.log('🔍 엑셀 파일 분석 중...');
    console.log(`파일 경로: ${excelFilePath}`);
    
    // 엑셀 파일 읽기
    const excelData = readExcelFileFromPath(excelFilePath);
    
    console.log('\n📊 엑셀 파일 구조 분석:');
    const structure = analyzeExcelStructure(excelData);
    structure.forEach(sheet => {
      console.log(`\n시트명: ${sheet.sheetName}`);
      console.log(`행 수: ${sheet.rowCount}`);
      console.log(`열 수: ${sheet.columnCount}`);
      console.log(`헤더: ${JSON.stringify(sheet.headers)}`);
      console.log('샘플 데이터:');
      sheet.sampleData.forEach((row, index) => {
        console.log(`  행 ${index + 2}: ${JSON.stringify(row)}`);
      });
    });
    
    // 볼링 데이터 파싱 시도
    console.log('\n🎳 볼링 데이터 파싱 중...');
    const bowlingData = parseBowlingData(excelData);
    
    if (bowlingData.length > 0) {
      console.log(`\n✅ 파싱된 볼링 데이터 (${bowlingData.length}개):`);
      bowlingData.slice(0, 5).forEach((data, index) => {
        console.log(`${index + 1}. ${data.memberName} - ${data.date}`);
        console.log(`   점수: [${data.scores.join(', ')}]`);
      });
      
      if (bowlingData.length > 5) {
        console.log(`   ... 외 ${bowlingData.length - 5}개 더`);
      }
    } else {
      console.log('❌ 볼링 데이터를 파싱할 수 없습니다.');
      console.log('💡 파일 구조를 확인하고 parseBowlingData 함수를 수정해주세요.');
    }
    
  } catch (error) {
    console.error('❌ 엑셀 파일 파싱 오류:', error);
  }
}

// 스크립트 실행
testExcelParsing();
