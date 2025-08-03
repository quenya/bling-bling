# 개발 지침서

## 1. Context7 MCP 서버 활용

### 자료 검색 우선순위
1. **Context7 MCP 서버** 우선 사용
2. 검색 결과가 부족한 경우에만 다른 소스 활용
3. 검색한 자료는 반드시 문서화하여 팀과 공유

### Context7 활용 방법
```bash
# Context7을 통한 검색 예시
- JavaScript 모범 사례 검색
- 프레임워크별 가이드라인 조회
- 코딩 패턴 및 디자인 패턴 참조
- 버그 수정 사례 검색
```

## 2. 코딩 표준

### JavaScript 코딩 규칙
- **ES6+ 문법** 사용 필수
- **const/let** 사용, var 금지
- **화살표 함수** 우선 사용
- **템플릿 리터럴** 사용 권장

### 네이밍 규칙
```javascript
// 변수/함수: camelCase
const userName = 'john';
const getUserInfo = () => {};

// 상수: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// 클래스: PascalCase
class UserManager {}

// 파일명: kebab-case
user-manager.js
```

### 함수 작성 가이드
```javascript
// 좋은 예
const calculateTotalPrice = (items, taxRate) => {
  return items.reduce((total, item) => total + item.price, 0) * (1 + taxRate);
};

// 나쁜 예
function calc(i, t) {
  let sum = 0;
  for(let x = 0; x < i.length; x++) {
    sum += i[x].price;
  }
  return sum * (1 + t);
}
```

## 3. 프로젝트 구조 및 파일 조직

### 디렉토리 구조
```
src/
├── components/       # 재사용 가능한 컴포넌트
├── pages/           # 페이지별 컴포넌트
├── utils/           # 유틸리티 함수
├── services/        # API 호출 및 비즈니스 로직
├── styles/          # CSS/SCSS 파일
├── assets/          # 이미지, 폰트 등 정적 파일
└── config/          # 설정 파일
```

### 파일 조직 원칙
- **단일 책임 원칙**: 하나의 파일은 하나의 역할만
- **관련성 그룹화**: 관련된 파일들을 같은 폴더에
- **명확한 네이밍**: 파일명만으로도 역할을 알 수 있도록

## 4. 개발 워크플로우

### 새 기능 개발 프로세스
1. **Context7에서 관련 자료 검색**
   - 유사한 기능 구현 사례
   - 모범 사례 및 패턴
   - 잠재적 이슈 및 해결책

2. **기능 설계**
   - 요구사항 정의
   - 인터페이스 설계
   - 데이터 구조 계획

3. **구현**
   - 테스트 주도 개발(TDD) 권장
   - 코드 리뷰 필수

4. **문서화**
   - 구현 과정 기록
   - API 문서 업데이트
   - 사용 예제 작성

### 버그 수정 프로세스
1. **Context7에서 유사 사례 검색**
2. **문제 재현 및 분석**
3. **해결 방안 도출**
4. **테스트 케이스 작성**
5. **수정 구현**
6. **해결 과정 문서화**

## 5. 품질 관리

### 코드 리뷰 체크리스트
- [ ] Context7에서 관련 모범 사례 확인했는가?
- [ ] 코딩 표준을 준수했는가?
- [ ] 함수와 변수명이 명확한가?
- [ ] 주석이 필요한 복잡한 로직에 설명을 추가했는가?
- [ ] 테스트 케이스를 작성했는가?
- [ ] 에러 처리를 적절히 했는가?

### 성능 고려사항
- 불필요한 리렌더링 방지
- 메모리 누수 방지
- 적절한 캐싱 전략
- 번들 크기 최적화

## 6. 문서화 원칙

### README 업데이트
- 새로운 기능 추가 시 README 업데이트
- 설치 및 실행 방법 최신화
- 의존성 변경사항 반영

### 코드 주석
```javascript
/**
 * 사용자 정보를 가져오는 함수
 * Context7에서 검색한 사용자 인증 패턴 적용
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 사용자 정보 객체
 */
const getUserInfo = async (userId) => {
  // 구현 내용...
};
```

## 7. 팀 협업

### 소통 규칙
- 새로운 패턴이나 라이브러리 도입 시 팀원들과 논의
- Context7에서 찾은 유용한 자료는 팀과 공유
- 문제 발생 시 즉시 공유하여 함께 해결

### 지식 공유
- 정기적인 코드 리뷰 세션
- Context7 검색 결과 공유
- 학습한 내용 문서화 및 공유

이 지침서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
