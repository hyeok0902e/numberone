const express = require('express');

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
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }
            
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 권한 체크
        if (company.user_id = user.id) {
            // 목록 불러오기
            const testPapers = await TestPaper.findAll({ where: { company_id: company.id } });
            
            // 목록이 없을 때
            if (testPapers.length == 0) {
                response(res, 404, "목록이 존재하지 않습니다.");
                return;
            }

            let payLoad = { testPapers };
            response(res, 200, "전기설비 점검결과 기록표 목록", payLoad);
        } else {
            response(res, '401', "권한 없음");
        }

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 복사하기
router.post('/:testPaper_id/copy', verifyToken, async (req, res, next) => {
    try {   
        const { testPaper_id } = req.params;

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // params값 없음
        if (!testPaper_id) { response(res, 400, "params값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        // 기록표 존재여부 체크
        const testPaper = await TestPaper.findOne({ where: { id: testPaper_id }});
        if (!testPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        // 기록표 복사
        await TestPaper.findOne({ where: { id: testPaper_id }, raw: true })
            .then(async data => {  
                await delete data.id // id값 제거
                const copy = await TestPaper.create(data); // 데이터 복사
                let payLoad = { copy };
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

// 기록표 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        // 필수 입력값: 업체 명, 점검 날짜
        const {
            company_id,
            compName, checkDate, passiveVolt, generateVolt, generateKw, sunKw, contractKw,
            checkType, checking, 
            // 점검 내역 - 특고압 설비 15종
            hProcess, hUnder, hSwitch, hWire, hLight, 
            hPoten, hFuse, hTrans, hWant, hReplay, 
            hStop, hCondenser, hProtect, hLoad, hFold,
            // 점검 내역 - 저압 설비 15종
            lEntrance, lPaner, lWireStop, lCircuitStop, lSwitch,
            lWire, lMotor, lHeater, lWeld, lCondenser,
            lLight, lFold, lRace, lEtc, lGenerate,
            // 점검결과 판정 - 9개씩 3개 부분
            a1Volt, a1Ampe, a1Temp, b1Volt, b1Ampe, b1Temp,
            c1Volt, c1Ampe, c1Temp, n1Volt, n1Ampe, n1Temp,
            a2Volt, a2Ampe, a2Temp, b2Volt, b2Ampe, b2Temp,
            c2Volt, c2Ampe, c2Temp, n2Volt, n2Ampe, n2Temp,
            a3Volt, a3Ampe, a3Temp, b3Volt, b3Ampe, b3Temp,
            c3Volt, c3Ampe, c3Temp, n3Volt, n3Ampe, n3Temp,
            // 사용자 정보
            userCompTel // 사용자 회사 대표번호
        } = req.body

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }
        // 입력값 체크
        if (!compName) { response(res, 400, "값을 입력해 주세요."); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id } });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 권한 체크
        if (company.user_id == user.id) {
            let testPaper = await TestPaper.create({
                compName, checkDate, passiveVolt, generateVolt, generateKw, sunKw, contractKw,
                checkType, checking, 
                // 점검 내역 - 특고압 설비 15종
                hProcess, hUnder, hSwitch, hWire, hLight, 
                hPoten, hFuse, hTrans, hWant, hReplay, 
                hStop, hCondenser, hProtect, hLoad, hFold,
                // 점검 내역 - 저압 설비 15종
                lEntrance, lPaner, lWireStop, lCircuitStop, lSwitch,
                lWire, lMotor, lHeater, lWeld, lCondenser,
                lLight, lFold, lRace, lEtc, lGenerate,
                // 점검결과 판정 - 9개씩 3개 부분
                a1Volt, a1Ampe, a1Temp, b1Volt, b1Ampe, b1Temp,
                c1Volt, c1Ampe, c1Temp, n1Volt, n1Ampe, n1Temp,
                a2Volt, a2Ampe, a2Temp, b2Volt, b2Ampe, b2Temp,
                c2Volt, c2Ampe, c2Temp, n2Volt, n2Ampe, n2Temp,
                a3Volt, a3Ampe, a3Temp, b3Volt, b3Ampe, b3Temp,
                c3Volt, c3Ampe, c3Temp, n3Volt, n3Ampe, n3Temp,
                
                // 회사명
                userCompName: user.company, 
                // 대표 번호
                userCompTel: user.companyTel,
                // 팩스
                userCompFax: user.fax,
            });
            await company.addTestPaper(testPaper);

            // 저장된 기록표 다시 한 번 불러오기
            testPaper = await TestPaper.findOne({ where: { id: testPaper.id } });
            let payLoad = { testPaper };

            response(res, 201, "등록을 완료하였습니다.", payLoad);
        } else {
            response(res, 401, "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

router.get('/test', (req, res, next) => {
    console.log(Date.now());
})

module.exports = router;