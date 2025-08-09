import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 엑셀 파일 읽기
const filePath = path.join(__dirname, '..', 'sheets', '볼링에버관리_2025-08_1주차_V2.1.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('시트 목록:');
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`${index + 1}. ${sheetName}`);
  });
  
  // 인원별 음료과자 시트 찾기
  const targetSheet = workbook.SheetNames.find(name => 
    name.includes('인원별') || name.includes('음료') || name.includes('과자')
  );
  
  if (targetSheet) {
    console.log(`\n"${targetSheet}" 시트 분석:`);
    const worksheet = workbook.Sheets[targetSheet];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('첫 10행 데이터:');
    data.slice(0, 10).forEach((row, index) => {
      console.log(`${index + 1}:`, row);
    });
    
    // 인원과 레인 컬럼 찾기
    const headerRow = data[3] || []; // 4번째 행이 실제 헤더인 것 같음
    console.log('헤더 행:', headerRow);
    
    const personColumn = headerRow.findIndex(cell => 
      cell && (cell.toString().includes('인원') || cell.toString() === '인원')
    );
    const laneColumn = headerRow.findIndex(cell => 
      cell && (cell.toString().includes('레인') || cell.toString() === '레인')
    );
    
    console.log('\n컬럼 분석:');
    console.log('인원 컬럼 인덱스:', personColumn);
    console.log('레인 컬럼 인덱스:', laneColumn);
    
    if (personColumn >= 0 && laneColumn >= 0) {
      console.log('\n인원별 레인 구성:');
      data.slice(4).forEach((row, index) => {
        const persons = row[personColumn];
        const lanes = row[laneColumn];
        if (persons && lanes && typeof persons === 'number' && typeof lanes === 'number') {
          console.log(`${persons}명 -> ${lanes}팀`);
        }
      });
    }
  } else {
    console.log('\n각 시트의 첫 5행 데이터를 확인합니다:');
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n=== ${sheetName} ===`);
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      data.slice(0, 5).forEach((row, index) => {
        console.log(`${index + 1}:`, row);
      });
    });
  }
  
} catch (error) {
  console.error('엑셀 파일 읽기 실패:', error.message);
}
