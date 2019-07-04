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

// 구인 목록
router.get('/hiring', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        const hirings = await Hiring.findAll({
            where: { user_id: user.id, type: 1, },
            attributes: ['id', 'type', 'company', 'address', 'startDate', 'isSelected'],
            order: [['id', 'DESC']],   
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                    limit: 1,
                }
            ]
        });

        let payLoad = { hirings };
        response(res, 200, "구인 참여신청 목록", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구직 목록
router.get('/seeking', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        const seekings = await Seeking.findAll({
            where: { user_id: user.id, type: 1, },
            attributes: ['id', 'type', 'company', 'address', 'car', 'career', 'isSelected'],
            order: [['id', 'DESC']],   
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                    limit: 1,
                }
            ]
        });

        let payLoad = { seekings };
        response(res, 200, "구직 참여신청 목록", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구인 목록 삭제
router.delete('/hiring/delete', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_ids } = req.body;
        if (!hiring_ids) { response(res, 400, "데이터 없음"); return; }

        await asyncForEach(hiring_ids, async (id) => {
            await Hiring.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 구직 목록 삭제
router.delete('/seeking/delete', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_ids } = req.body;
        if (!seeking_ids) { response(res, 400, "데이터 없음"); return; }

        await asyncForEach(seeking_ids, async (id) => {
            await Seeking.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

module.exports = router;
