const express = require('express');

// 모델 import
const { 
    User, UserAuth, Seeking, Hiring, Labor, Address
} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken , verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyJobSearchAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 구인 완료
router.post('/:hiring_id/end', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.body;
        if (!hiring_id) { response(res, 400, "데이터 없음"); return; }

        const hiring = await Hiring.findOne({ where: { id: hiring_id } });
        if (!hiring) { response(res, 404, "구인정보가 존재하지 않습니다."); return; }
        
        await Hiring.update(
            { isSelected: 1 },
            { where: { id: hiring_id } }
        );
        
        response(res, 200, "마감 처리가 완료되었습니다.");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구직 완료
router.post('/:seeking_id/end', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_id } = req.body;
        if (!seeking_id) { response(res, 400, "데이터 없음"); return; }

        const seeking = await Seeking.findOne({ where: { id: seeking_id } });
        if (!seeking) { response(res, 404, "구직정보가 존재하지 않습니다."); return; }
        
        await Seeking.update(
            { isSelected: 1 },
            { where: { id: seeking_id } }
        );
        
        response(res, 200, "마감 처리가 완료되었습니다.");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;
