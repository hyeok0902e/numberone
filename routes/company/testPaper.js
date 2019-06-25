const express = require('express');
const moment = require("moment");

// 모델 import
const { User, UserAuth, Company, TestPaper } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { compAuth } = require('../middlewares/userAuth');
const { uploadImg } = require('../middlewares/uploadImg');

// /company/testPaper
const router = express.Router();

// 기록표 목록
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const { company_id } = req.body;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }    
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }

        const company = await Company.findOne({ where: { id: company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다.") }
        // 권한 체크
        if (company.user_id != user.id) { response(res, 401, "권한 없음"); return; }
        // 목록 불러오기
        const testPapers = await TestPaper.findAll({ where: { company_id: company.id }, attributes: ['id', 'checkDate'], });          
        // 목록이 없을 때
        if (testPapers.length == 0) { response(res, 404, "목록이 존재하지 않습니다."); return; }

        let payLoad = { testPapers };
        response(res, 200, "전기설비 점검결과 기록표 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        // 필수 입력값: 업체 명, 점검 날짜
        const { company_id, testPaper } = req.body

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }
        if (!testPaper) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id } });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }
        // 권한 체크
        if (company.user_id == user.id) { response(res, 401, "권한 없음"); }

        let reTestPaper = await TestPaper.create({
            compName: company.name, checkDate: moment(Date.now()).format('YYYY-MM-DD'), 
            passiveVolt: testPaper.passiveVolt, generateVolt: testPaper.generateVolt, generateKw: testPaper.generateKw, 
            sunKw: testPaper.sunKw, contractKw: testPaper.contractKw,
            checkType: testPaper.checkType, checking: testPaper.checking, 
            // 점검 내역 - 특고압 설비 15종
            hProcess: testPaper.hProcess, hUnder: testPaper.hUnder, hSwitch: testPaper.hSwitch, hWire: testPaper.hWire, hLight: testPaper.hLight, 
            hPoten: testPaper.hPoten, hFuse: testPaper.hFuse, hTrans: testPaper.hTrans, hWant: testPaper.hWant, hReplay: testPaper.hReplay, 
            hStop: testPaper.hStop, hCondenser: testPaper.hCondenser, hProtect: testPaper.hProtect, hLoad: testPaper.hLoad, hFold: testPaper.hFold,
            // 점검 내역 - 저압 설비 15종
            lEntrance: testPaper.lEntrance, lPaner: testPaper.lPaner, lWireStop: testPaper.lWireStop, lCircuitStop: testPaper.lCircuitStop, lSwitch: testPaper.lSwitch,
            lWire: testPaper.lWire, lMotor: testPaper.lMotor, lHeater: testPaper.lHeater, lWeld: testPaper.lWeld, lCondenser: testPaper.lCondenser,
            lLight: testPaper.lLight, lFold: testPaper.lFold, lRace: testPaper.lRace, lEtc: testPaper.lEtc, lGenerate: testPaper.lGenerate,
            // 점검결과 판정 - 9개씩 3개 부분
            a1Volt: testPaper.a1Volt, a1Ampe: testPaper.a1Ampe, a1Temp: testPaper.a1Temp, b1Volt: testPaper.b1Volt, b1Ampe: testPaper.b1Ampe, b1Temp: testPaper.b1Temp,
            c1Volt: testPaper.c1Volt, c1Ampe: testPaper.c1Ampe, c1Temp: testPaper.c1Temp, n1Volt: testPaper.n1Volt, n1Ampe: testPaper.n1Ampe, n1Temp: testPaper.n1Temp,
            a2Volt: testPaper.a2Volt, a2Ampe: testPaper.a2Ampe, a2Temp: testPaper.a2Temp, b2Volt: testPaper.b2Volt, b2Ampe: testPaper.b2Ampe, b2Temp: testPaper.b2Temp,
            c2Volt: testPaper.c2Volt, c2Ampe: testPaper.c2Ampe, c2Temp: testPaper.c2Temp, n2Volt: testPaper.n2Volt, n2Ampe: testPaper.n2Ampe, n2Temp: testPaper.n2Temp,
            a3Volt: testPaper.a3Volt, a3Ampe: testPaper.a3Ampe, a3Temp: testPaper.a3Temp, b3Volt: testPaper.b3Volt, b3Ampe: testPaper.b3Ampe, b3Temp: testPaper.b3Temp,
            c3Volt: testPaper.c3Volt, c3Ampe: testPaper.c3Ampe, c3Temp: testPaper.c3Temp, n3Volt: testPaper.n3Volt, n3Ampe: testPaper.n3Ampe, n3Temp: testPaper.n3Temp,
            
            // 서명
            checkerName: testPaper.checkerName,
            checkerSign: testPaper.checkerSign,
            managerName: user.name,
            managerSign: testPaper.managerSign,
            // 회사명
            userCompName: user.company, 
            // 대표 번호
            userCompTel: user.companyTel,
            // 팩스
            userCompFax: user.fax,
        });
        await company.addTestPaper(reTestPaper);

        let payLoad = { testPaper: reTestPaper };
        response(res, 201, "등록을 완료하였습니다.", payLoad);     
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 복사
router.post('/:testPaper_id/copy', verifyToken, async (req, res, next) => {
    try {   
        const { testPaper_id } = req.params;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // params값 없음
        if (!testPaper_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 기록표 존재여부 체크
        let testPaper = await TestPaper.findOne({ where: { id: testPaper_id } });
        if (!testPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }
        // 업체 존재여부 체크
        let company = await Company.findOne({ where: { id: testPaper.company_id } });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 기록표 복사
        await TestPaper.findOne({ where: { id: testPaper_id }, raw: true })
            .then(async data => {  
                await delete data.id // id값 제거
                const copy = await TestPaper.create(data); // 데이터 복사
                await company.addTestPaper(copy);
                let payLoad = { testPaper: copy };
                response(res, 201, "기록표가 복사되었습니다.", payLoad);
            })
            .catch(err => { 
                response(res, 404, "기록표를 찾을 수 없습니다.");
            });
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:testPaper_id/show', verifyToken, async (req, res, next) => {
    try {   
        const { testPaper_id } = req.params;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!testPaper_id) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 기록표 존재여부 체크
        let testPaper = await TestPaper.findOne({ where: { id: testPaper_id } });
        if (!testPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { testPaper };
        response(res, 200, "기록표 수정 페이지", payLoad);
    } catch {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정 페이지
router.get('/:testPaper_id/edit', verifyToken, async (req, res, next) => {
    try {
        const { testPaper_id } = req.params;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!testPaper_id) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 기록표 존재여부 체크
        let testPaper = await TestPaper.findOne({ where: { id: testPaper_id } });
        if (!testPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { testPaper };
        response(res, 200, "기록표 수정 페이지", payLoad);

    } catch {   
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:testPaper_id/edit', verifyToken, async (req, res, next) => {
    try {
        const { testPaper_id } = req.params;
        const { testPaper } = req.body;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 없음
        if (!testPaper) { response(res, 400, "데이터 없음"); return; }
        // params값 없음
        if (!testPaper_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; } 
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 기록표 존재여부 체크
        let reTestPaper = await TestPaper.findOne({ where: { id: testPaper_id } });
        if (!reTestPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        // 기록표 업데이트
        await TestPaper.update(
            {
                passiveVolt: testPaper.passiveVolt, generateVolt: testPaper.generateVolt, generateKw: testPaper.generateKw, 
                sunKw: testPaper.sunKw, contractKw: testPaper.contractKw,
                checkType: testPaper.checkType, checking: testPaper.checking, 
                // 점검 내역 - 특고압 설비 15종
                hProcess: testPaper.hProcess, hUnder: testPaper.hUnder, hSwitch: testPaper.hSwitch, hWire: testPaper.hWire, hLight: testPaper.hLight, 
                hPoten: testPaper.hPoten, hFuse: testPaper.hFuse, hTrans: testPaper.hTrans, hWant: testPaper.hWant, hReplay: testPaper.hReplay, 
                hStop: testPaper.hStop, hCondenser: testPaper.hCondenser, hProtect: testPaper.hProtect, hLoad: testPaper.hLoad, hFold: testPaper.hFold,
                // 점검 내역 - 저압 설비 15종
                lEntrance: testPaper.lEntrance, lPaner: testPaper.lPaner, lWireStop: testPaper.lWireStop, lCircuitStop: testPaper.lCircuitStop, lSwitch: testPaper.lSwitch,
                lWire: testPaper.lWire, lMotor: testPaper.lMotor, lHeater: testPaper.lHeater, lWeld: testPaper.lWeld, lCondenser: testPaper.lCondenser,
                lLight: testPaper.lLight, lFold: testPaper.lFold, lRace: testPaper.lRace, lEtc: testPaper.lEtc, lGenerate: testPaper.lGenerate,
                // 점검결과 판정 - 9개씩 3개 부분
                a1Volt: testPaper.a1Volt, a1Ampe: testPaper.a1Ampe, a1Temp: testPaper.a1Temp, b1Volt: testPaper.b1Volt, b1Ampe: testPaper.b1Ampe, b1Temp: testPaper.b1Temp,
                c1Volt: testPaper.c1Volt, c1Ampe: testPaper.c1Ampe, c1Temp: testPaper.c1Temp, n1Volt: testPaper.n1Volt, n1Ampe: testPaper.n1Ampe, n1Temp: testPaper.n1Temp,
                a2Volt: testPaper.a2Volt, a2Ampe: testPaper.a2Ampe, a2Temp: testPaper.a2Temp, b2Volt: testPaper.b2Volt, b2Ampe: testPaper.b2Ampe, b2Temp: testPaper.b2Temp,
                c2Volt: testPaper.c2Volt, c2Ampe: testPaper.c2Ampe, c2Temp: testPaper.c2Temp, n2Volt: testPaper.n2Volt, n2Ampe: testPaper.n2Ampe, n2Temp: testPaper.n2Temp,
                a3Volt: testPaper.a3Volt, a3Ampe: testPaper.a3Ampe, a3Temp: testPaper.a3Temp, b3Volt: testPaper.b3Volt, b3Ampe: testPaper.b3Ampe, b3Temp: testPaper.b3Temp,
                c3Volt: testPaper.c3Volt, c3Ampe: testPaper.c3Ampe, c3Temp: testPaper.c3Temp, n3Volt: testPaper.n3Volt, n3Ampe: testPaper.n3Ampe, n3Temp: testPaper.n3Temp,
                
                // 서명
                checkerName: testPaper.checkerName,
                checkerSign: testPaper.checkerSign,
            },
            { where: { id: testPaper_id } }
        );
        
        let resTestPaper = await TestPaper.findOne({ where: { id: testPaper_id } });
        let payLoad = { testPaper: resTestPaper };
        response(res, 200, "기록표 수정 완료", payLoad);
    } catch {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// pdf 변환
// => show 라우터와 함께 사용

// 삭제
router.delete('/delete', verifyToken, async (req, res, next) => {
    try {
        const { testPaper_ids } = req.body;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 없음
        if (!rayPaper_ids) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }

        await asyncForEach(testPaper_ids, async (id) => {
            await TestPaper.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        responser(res, 500, "서버 에러");
    }
});

module.exports = router;