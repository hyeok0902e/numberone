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

// 내 구인 등록 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        const hirings = await Hiring.findAll({
            where: { user_id: user.id, type: 0, },
            attributes: ['id', 'type', 'company', 'address', 'startDate', 'endDate', 'isSelected'],
            order: [['id', 'DESC']],   
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                    limit: 2,
                }
            ]
        });

        let payLoad = { hirings };
        response(res, 200, "내 구인 등록 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 신청자 목록 - 권한 체크
router.get('/:hiring_id/list', verifyToken, verifyJobSearchAuth, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

        const hiring = await Hiring.findOne({ where: { id: hiring_id } });
        if (!hiring) { response(res, 404, "구인 정보가 존재하지 않습니다."); return; }

        const appliers = await hiring.getApplying({
            include: [ 
                {
                    model: Labor,
                    limit: 2,
                    order: [['id', 'ASC']]
                }
            ]
        });
        let payLoad = { appliers };
        response(res, 200, "신청자 목록", payLoad)    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구인 완료 
router.post('/:hiring_id/end', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.params;
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

// 구인 목록 삭제
router.delete('/delete', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
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
module.exports = router;
