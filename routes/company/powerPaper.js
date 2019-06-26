const express = require('express');

// 모델 import
const { User, Address, UserAuth, PowerPaper, PowerPaperElement } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();

// 기록표 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id } = req.body; 
        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        // 데이터 체크
        if (!company_id) { console.log(res, 400, "데이터 없음") }

        const company = await Company.findOne({ where: { id: company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다.") }
        // 권한 체크
        if (company.user_id != user.id) { response(res, 401, "권한 없음"); return; }

        // 목록 불러오기
        const powerPapers = await PowerPaper.findAll({ where: { company_id }, attributes: ['id', 'checkDate'] })
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
}); 

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 복사
router.post('/:powerPaper_id/copy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper_id } = req.params
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:powerPaper_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper_id } = req.params
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정페이지
router.get('/:powerPaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper_id } = req.params
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:powerPaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper_id } = req.params
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/delete', verifyToken, verifyDuplicateLogin,  async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// pdf 변환

module.exports = router;