# 전기인넘버원 Node.js Server API For React Application
    - 개발 시작일: 2019.05.17(금)
    - 문서(사용법) 기록 공간: Notion - TLSolution - TLS 프로젝트 목록

## 개발일지

### 2019.05.18(토)
- models/load.js 
- models/index.js 

### 2019.05.20(월)
- models/index.js => Load 테이블 내부참조 설계 
- models/user/address.js
- models/billProject

### 2019.05.21(화)
- models/billProject - 계산서 DB 생성 완료
- models/index.js - 계산서 DB 관계 세팅
- passport
- routes/user/auth.js - 로그인/로그아웃/회원가입 기능: 90% 개발 완료

### 2019.05.24(금)
- models/company
- delete passport
- 노션 설명서 정리: Auth, BillProject, Attendance

### 2019.05.25(토)
- models/company - 관리대장

### 2019.05.26(일)
- models/feeProject 
- models/statement
- routes/billProject
- models/jobSearch

### 2019.05.27(월)
#### 모델 설계
- models/marketPrice
- models/document
- models/product
- models/organization
- models/Announcement.js
- models/index.js
#### 라우터 및 미들웨어 설계
- routes/billProject/bank - create, put
- routes/middlewares - exUser, userAuth
#### API
- 주소 API 사용법 정리 => Notion (전기인 넘버원 - Open API)
- jwt 토큰을 이용한 보안 기능 추가(강화)
- 사용자 토큰 업데이트 기능 설계 - routes/user/auth.js ('/token')
    - Front 단에서도 uuid와 token 정보를 업데이트 해주어야 함 (세션을 통해)

### 2019.05.28(화)
#### 라우터 설계
- 필수 체크 요소 개발: 권한(유료 회원, 데이터 소유자), 전달값 존재여부, 입력값 존재여부, 유저 존재여뷰 등
- routes/user/auth - 회원가입부분 주소 입력 추가
    - 현재 주석처리 함 => Front와 테스팅 필요
- routes/billProject/bank - put 
- routes/billProject/group - create
#### 보안/인증
- 사용자 유효성 검사 기능 90% 이상 개발 완료: 노션에 정리되어 있음
    - Front와 테스팅만 진행하면 될듯..

## ToDo
- 회원가입 라우터 => 이미 가입한 사용자인지 체크하는 기능 추가
- image upload to s3
- 만들어 놓은 exUser 미들웨어로 코드 교체
- API Version Routing (ex => /V1/bill/create)
- JWT Token & CleintSecret(uuid) 사용하여 로그인 인증/보안 구축
    - uuid => const uuidv4 = require('uuid/v4'); => node 교과서 411p

## 모델생성 및 관계세팅 진행률
- company & paper - 100%
- billProject - 90% => 점검 1회 필요
- feeProject - 100%
- statement - 100%
- jobSearch - 90% => 관계부분 좀 더 고민해 볼 것 (등록글 - 신청글)
- Announcement - 100%
- Material - 100%
- Organization - 100%
- Product - 90% => 장바구니, 견적 부분에서 좀 더 효율적인 관계 고민 - 1번만 해보기 
- document - 100%
- marketPrice - 100%

## 오류/문제 해결 내용

## 새로 배운 내용

