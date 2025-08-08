import XLSX from 'xlsx';

/**
 * 엑셀 파일을 읽고 파싱하는 유틸리티 함수들
 */

export interface ExcelData {
  sheetName: string;
  data: any[][];
  headers?: string[];
}

export interface ParsedBowlingData {
  memberName: string;
  scores: number[];
  date: string;
  gameNumber: number;
}

/**
 * 파일에서 엑셀 데이터를 읽어옵니다
 */
export const readExcelFile = async (file: File): Promise<ExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        const results: ExcelData[] = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          results.push({
            sheetName,
            data: jsonData as any[][],
            headers: jsonData[0] as string[]
          });
        });
        
        resolve(results);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 로컬 엑셀 파일을 읽어옵니다 (Node.js 환경)
 */
export const readExcelFileFromPath = (filePath: string): ExcelData[] => {
  try {
    const workbook = XLSX.readFile(filePath);
    const results: ExcelData[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      results.push({
        sheetName,
        data: jsonData as any[][],
        headers: jsonData[0] as string[]
      });
    });
    
    return results;
  } catch (error) {
    console.error('엑셀 파일 읽기 오류:', error);
    throw error;
  }
};

/**
 * 볼링 점수 데이터를 파싱합니다
 */
export const parseBowlingData = (excelData: ExcelData[]): ParsedBowlingData[] => {
  const results: ParsedBowlingData[] = [];
  
  excelData.forEach(sheet => {
    const { data } = sheet;
    
    // 첫 번째 행이 헤더라고 가정하고 데이터 행부터 처리
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row || row.length === 0) continue;
      
      // 볼링 데이터 구조에 맞게 파싱
      // 예시: [이름, 날짜, 게임1, 게임2, 게임3, ...]
      const memberName = row[0]?.toString().trim();
      const date = row[1]?.toString().trim();
      
      if (!memberName || !date) continue;
      
      // 점수 데이터 추출 (3번째 열부터)
      const scores: number[] = [];
      for (let j = 2; j < row.length; j++) {
        const score = parseInt(row[j]);
        if (!isNaN(score) && score >= 0 && score <= 300) {
          scores.push(score);
        }
      }
      
      if (scores.length > 0) {
        results.push({
          memberName,
          date,
          scores,
          gameNumber: scores.length
        });
      }
    }
  });
  
  return results;
};

/**
 * 엑셀 데이터를 JSON 형태로 변환합니다
 */
export const convertToJSON = (excelData: ExcelData[]) => {
  return excelData.map(sheet => ({
    sheetName: sheet.sheetName,
    data: sheet.data.slice(1).map((row) => {
      const obj: Record<string, any> = {};
      sheet.headers?.forEach((header, colIndex) => {
        obj[header] = row[colIndex];
      });
      return obj;
    })
  }));
};

/**
 * 엑셀 파일의 구조를 분석합니다
 */
export const analyzeExcelStructure = (excelData: ExcelData[]) => {
  return excelData.map(sheet => ({
    sheetName: sheet.sheetName,
    rowCount: sheet.data.length,
    columnCount: sheet.headers?.length || 0,
    headers: sheet.headers,
    sampleData: sheet.data.slice(1, 4) // 처음 3행의 샘플 데이터
  }));
};
