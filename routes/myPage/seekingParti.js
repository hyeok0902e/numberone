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

// 내 구직 등록 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        const seekings = await Seeking.findAll({
            where: { user_id: user.id, type: 0, },
            attributes: ['id', 'type', 'company', 'address', 'car', 'career', 'isSelected'],
            order: [['id', 'DESC']],   
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                    limit: 2,
                }
            ]
        });

        let payLoad = { seekings };
        response(res, 200, "내 구직r 등록 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 신청자 목록 - 권한 체크
router.get('/:seeking_id/list', verifyToken, verifyJobSearchAuth, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_id } = req.params;
        if (!seeking_id) { response(res, 400, "params값 없음"); return; }

        const seeking = await Seeking.findOne({ where: { id: seeking_id } });
        if (!seeking) { response(res, 404, "구인 정보가 존재하지 않습니다."); return; }

        const appliers = await seeking.getApplying({
            include: [ 
                {
                    model: Labor,
                    limit: 2,
                    order: [['id', 'ASC']]
                }
            ]
        });
        console.log(appliers.length)
        let payLoad = { appliers };
        response(res, 200, "신청자 목록", payLoad)   
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구직 완료 
router.post('/:seeking_id/end', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_id } = req.params;
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