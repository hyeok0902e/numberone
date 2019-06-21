const express = require('express');

// 모델 import
const { User, Address, UserAuth, RayPaper, Company } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { compAuth } = require('../middlewares/userAuth');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();

// 적외선 열화상 기록표 목록
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
        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }
        // 권한 체크
        if(company.user_id != user.id) { response(res, 401, "권한 없음"); return; }

        const rayPapers = await RayPaper.findAll({ where: { company_id: company.id } });
        // 목록이 없을 때
        if (rayPapers.length == 0) { response(res, 404, "목록이 존재하지 않습니다."); }
       
        let payLoad = { rayPapers };
        response(res, 200, "전외선 열화상 기록표 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { 
            
        } = req.body
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; } 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 복사
router.post('/:rayPaper_id/copy', verifyToken, async (req, res, next) => {
    try {
        const { rayPaper_id } = req.params;
         // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // params값 없음
        if (!rayPaper_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: rayPaper.company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 기록표 복사
        await RayPaper.findOne({ where: { id: rayPaper_id }, raw: true })
            .then(async data => {  
                await delete data.id // id값 제거
                const copy = await RayPaper.create(data); // 데이터 복사
                await company.addRayPaper(copy);
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



module.exports = router;