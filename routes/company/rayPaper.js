const express = require('express');
const moment = require("moment");

// 모델 import
const { User, Address, UserAuth, RayPaper, Company } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { compAuth } = require('../middlewares/userAuth');
const { uploadImg_rayPaper } = require('../middlewares/uploadImg');

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

        const rayPapers = await RayPaper.findAll({ 
            where: { company_id: company.id },
            attributes: ['id', 'checkDate']
        });
        // 목록이 없을 때
        if (rayPapers.length == 0) { response(res, 404, "목록이 존재하지 않습니다."); }
       
        let payLoad = { rayPapers };
        response(res, 200, "전외선 열화상 기록표 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 사진 등록
router.post('/imgUpload', verifyToken, uploadImg_rayPaper.single('image'), (req, res, next) => {
    try {
        console.log("req.file: ", req.file); 

        let payLoad = { imageUrl: req.file.location };
        response(res, 201, "제품 사진 등록 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
})

// 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { company_id, rayPaper } = req.body
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!rayPaper) { response(res, 400, "데이터 없음"); return; }
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; } 

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }
        if (company.user_id != user.id) { response(res, 401, "권한 없음"); }

        // 기록표 생성
        let reRayPaper = await RayPaper.create({
            // 유저가 입력하지 않은 값
            compName: company.name, 
            checkDate: moment(Date.now()).format('YYYY-MM-DD'),
            manager: user.name,
            userCompName: user.company,
            userCompTel: user.companyTel,
            userCompFax: user.fax,

            // 사용자 입력값
            target: rayPaper.target, volt: rayPaper.volt, condition: rayPaper.condition,
            note: rayPaper.note, point1: rayPaper.point1, point2: rayPaper.point2, point3: rayPaper.point3,
            tempGap: rayPaper.tempGap, trueImg: rayPaper.trueImg, trueComment: rayPaper.trueComment,
            fireImg: rayPaper.fireImg, fireComment: rayPaper.fireComment, opinion: rayPaper.opinion
        });
        await company.addRayPaper(reRayPaper);

        let payLoad = { rayPaper: reRayPaper };
        response(res, 201, "등록을 완료하였습니다.", payLoad);
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
        // 기록표 존재여부 체크
        let rayPaper = await RayPaper.findOne({ where: { id: rayPaper_id } });
        if (!rayPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        const company = await Company.findOne({ where: { id: rayPaper.company_id} });
        // 기록표 복사
        await RayPaper.findOne({ where: { id: rayPaper_id }, raw: true })
            .then(async data => {  
                await delete data.id // id값 제거
                const copy = await RayPaper.create(data); // 데이터 복사
                await company.addRayPaper(copy);
                let payLoad = { rayPaper: copy };
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
router.get('/:rayPaper_id/show', verifyToken, async (req, res, next) => {
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
        // 기록표 존재여부 체크
        let rayPaper = await RayPaper.findOne({ where: { id: rayPaper_id } });
        if (!rayPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { rayPaper };
        response(res, 200, "적외선열화상 기록표 상세 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정 페이지
router.get('/:rayPaper_id/edit', verifyToken, async (req, res, next) => {
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
        // 기록표 존재여부 체크
        let rayPaper = await RayPaper.findOne({ where: { id: rayPaper_id } });
        if (!rayPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { rayPaper };
        response(res, 200, "기록표 수정 페이지", payLoad);
    } catch (err) {
        console.log(err);
        responser(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:rayPaper_id/edit', verifyToken, async (req, res, next) => {
    try {
        const { rayPaper } = req.body;
        const { rayPaper_id } = req.params;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 없음
        if (!rayPaper) { response(res, 400, "데이터 없음"); return; }
        // params값 없음
        if (!rayPaper_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; } 
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        
        // 수정작업
        await RayPaper.update(
            {
                target: rayPaper.target, volt: rayPaper.volt, condition: rayPaper.condition,
                note: rayPaper.note, point1: rayPaper.point1, point2: rayPaper.point2, point3: rayPaper.point3,
                tempGap: rayPaper.tempGap, trueImg: rayPaper.trueImg, trueComment: rayPaper.trueComment,
                fireImg: rayPaper.fireImg, fireComment: rayPaper.fireComment, opinion: rayPaper.opinion
            },
            { where: { id: rayPaper_id } }
        )
        let resRayPaper = await RayPaper.findOne({ where: { id: rayPaper_id } });
        let payLoad = { rayPaper: resRayPaper };
        response(res, 200, "기록표 수정 완료", payLoad);
    } catch (err) {
        console.log(err);
        responser(res, 500, "서버 에러");
    }
});

// 삭제 => 여러개 삭제
router.delete('/delete', verifyToken, async (req, res, next) => {
    try {
        const { rayPaper_ids } = req.body;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 없음
        if (!rayPaper_ids) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }

        await asyncForEach(rayPaper_ids, async (id) => {
            await RayPaper.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        responser(res, 500, "서버 에러");
    }
});

// pdf변환
// => show 라우터와 함께 사용 

module.exports = router;