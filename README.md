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
#### 유저 권한 업데이트
- app.js => node-schedule 모듈 사용: 하루에 한 번 씩 userAuth.period가 0보다 크면 "-1"이 된다.
    - 개발 완료
#### 미들웨어
- 기능별 유저 권한 체크 => routes/middlewares/userAuth.js

### 2019.05.29(수)
#### 라우터 구현
- /billProject/group.js => edit
- delete => bank & group
- s3 이미지 업로드 구현 => middlewares/uploadImg
- /user/auth.js => profileUpload
- /product/product.js => 구조 잡기

### 2019.05.30(목)
#### 라우터 설계
- /product/product.js => create => forEach 샹노무자식
- /company/company.js => get, create, get(edit), put(edit)

### 2019.05.31(금)
#### 라우터 설계
- /company/company.js => show, delete
- /company/company.js => memo (edit, put)
- /billProject/motorLoad.js => create
- /billProject/normalLoad.js => create

### 2019.06.01(토)
#### 라우터 설계
- /feeProject/index.js => get, create
- /product/index.js => show 
- /statement/index.js => get
#### 모델 관계 수정
- FeeProject belongsTo User / User hadMany FeeProject

### 2019.06.02(일)
#### 라우터 설계
- billProject/normalLoad.js => create
- billProject/transformer.js => create
- 계산서(billProject) 라우터 세팅 (+ app.js) => load.js ~ generator.js


### 2019.06.03(월)
#### 라우터 설계
- company/testPaper => copy, create, get ..
- testPaper Router에 verifyToken, verifyUid 적용
#### 기타 코드 변경
- change "sequelize current date timestamp code" 
- 업체 기록표 테이블들에 user 정보 추가 => db drop & create 

### 2019.06.05(수)
#### 라우터 개발
- normalLoad => createEnd => 부모 분전반 데이터 계산 및 업데이트

### 2019.06.06(목)
#### 개발 방향 대폭 수정
- 계산서 라우터 => 최초 기획안 대로 심플하게 수정 (세부항목이 아닌 단계별 저장)
#### router
- 파일명 변경 bank.js => load.js: 기존 라우터 닫음 ("_[url]" 처리) => 맨 위부터 새 라우터 작성
- billProject 내부 파일 닫음 ("_[파일명]" 처리)
- billProject/load.js => create

### 2019.06.07(금)
#### router
- billProject/load.js => create => forEach로 변경

### 2019.06.08(토)
#### router 
- billProject/load.js => create => resonse 데이터 => 계산서 전압수전 타입에 따라 다름
- 

### 2019.06.09(일)
#### router 
- billProject/ce.js
- billProject/transformer.js

### 2019.06.10(월)
#### 기획서 및 DB수정
- Document(자료실)에 '순번' 속성 추가
- SimplyForCE.js(테이블) 삭제: load부분에 필요 데이터 추가 => 워크벤치는 수정 안하고 남겨둠
#### router
- billProject/ce.js => create
#### 검토할 부분
- 다음 단계 계산서 시작 시, 전 계산서 DB create 직후가 아닌, 페이지 로드 시 (get) 필요데이터를 뿌려주어야 할까? => front와 상의 할 것

### 2019.06.11(화)
#### router
- billProject/pe.js => high/create, low/create

### 2019.06.12(수)
#### router
- billProject/condenser

### 2019.06.21(금)
#### router
- billProject 1차 완료 - Front와 핑퐁 필요
- company/rayPaper - 수정, 수정페이지, 상세보기, 목록, 생성, 복사
- company/testPaper - 목록, 생성

### 2019.06.25(화)
#### router
- 사업소 완료
- 자재검색 완료
- 자료실 완료
- 전기 장처 완료
- 시세정보 완료
- 관리자 페이지 진입 (유저, 공지, 기관정보, 자재 완료 )
- 관리자 페이지 Document 부터 추가 진행

### 2019.06.26(수)
#### router
- company
    - openingPaper.js
    - powerPaper.js
    - testPaper.js
    - rayPaper.js
    - estimatePaper.js
- feeProject
    - index.js
    - kepcoFee.js
    - preUsage.js
    - periodUsage.js
    - preChange.js
    - safeManage.js

### 2019.06.27(목)
#### router
- feeProject
    - kepcoFee.js

### 2019.06.29(토)
#### router
- statement
    - index.js

### 2019.07.03(수)
#### router
- jobSearch
    - hiring.js
    - seeknig.js
- myPage
    - auth.js
    - notice.js
- 네이버 sms 연동

### 2019.07.04(목)
#### router
- myPage
    - seekingParti
    - hiringParti

## 해결해야 할 오류 & 이슈
- [해결완료] routes/product/product.js => create에서 product의 productOpt와 productThumb값을 받아오지 못함.
### 일반부하(분전반) 생성 및 집계시 (06.02)
- [해결완료] 일반부하(분전반)의 합계 부하를 어떻게 구분할 것인지? 
    - 사용자 인터페이스 수정(보완)이 필요해 보임
    - 대표님과 상의할것: 최대한 빨리
        - 질문1: 3상4선 혹은 1상2선을 선택할 때 추가할 수 있는 분전반의 갯수가 제한이 있는지 (3상4선일 경우 4개, 1상 2선일 경우 3개)
            - 해결 완료 => 갯수 제한 없음(자유로움) 단 상/구분 선택시 상위 분전반 Row의 이름 Save => 최종 완료 버튼 클릭 시 상위 분전반 Row 데이터 업데이트

## ToDo
- [완료] 회원가입 라우터 => 이미 가입한 사용자(이메일 중복)인지 체크하는 기능 추가
- [완료] image upload to s3
- [완료] 만들어 놓은 exUser 미들웨어로 코드 교체
- API Version Routing (ex => /V1/bill/create)
- [완료] JWT Token & CleintSecret(uuid) 사용하여 로그인 인증/보안 구축
    - uuid => const uuidv4 = require('uuid/v4'); => node 교과서 411p
- [완료] 모든 라우터에 verifyToken, verifyUid 미들웨어 적용하기
- [완료] 미들웨어 교체 - 간편하게
- sequelize Pagenation
- casecade(db) 설정 - 종속 삭제

## [완료] 모델생성 및 관계세팅 진행률
- company & paper - 100%
- billProject - 100% => 점검 1회 필요
- feeProject - 100%
- statement - 100%
- jobSearch - 100% => 관계부분 좀 더 고민해 볼 것 (등록글 - 신청글)
- Announcement - 100%
- Material - 100%
- Organization - 100%
- Product - 90% => 장바구니, 견적 부분에서 좀 더 효율적인 관계 고민 - 1번만 해보기 
- document - 100%
- marketPrice - 100%

## 오류/문제 해결 내용

## 새로 배운 내용
### Sequelize Syntax
#### belongsTo & hasOne 관계일 때 관계 추가하기
- parentModel.setModelName(childModel) => addModelName(hadMany일 때 사용)이 아님

### 반복문
#### for문과 forEach
- 동기 프로그래밍을 위해 async await 을 사용하는데, forEach에선 말을 잘 듣지 않는다.
    - 결론: for(i=0; i < thins.lenght; i++) 을 사용하니 아주 깔끔
