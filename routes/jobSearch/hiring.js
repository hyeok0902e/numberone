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

// 묵록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        const hirings = await Hiring.findAll({
            where: { user_id: user.id },
            attributes: ['id', 'company', 'address', 'startDate', 'isSelected'],
            order: [['id', 'DESC']],   
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                }
            ]
        });

        let payLoad = { hirings };
        response(res, 200, "구인 목록", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:hiring_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

        let hiring = await Hiring.findOne({
            where: { id: hiring_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                }
            ]
        });
        if (!hiring) { response(res, 404, "데이터 없음"); return; }

        let payLoad = { hiring };
        response(res, 200, "구인 상세페이지", payLoad);
    } catch (err) {
        console.log(err);ß
        response(res, 500, "서버 에러");
    }
});

// 참여신청

// 구인 등록
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring } = req.body;
        if (!hiring) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        let a = hiring;
        let resHiring = await Hiring.create({
            type: a.type, company: a.company, address: a.address, 
            startDate: a.startDate, endDate: a.endDate, description: a.description,
            isSelected: a.isSelected,
        })
        await user.addHiring(resHiring);
        await asyncForEach(a.labor, async (l) => {
            let labor = await Labor.create({
                major: l.major, people: l.people,
            });
            await resHiring.addLabor(labor);
        });

        resHiring = await Hiring.findOne({
            where: { id: resHiring.id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                }
            ]
        })
        let payLoad = { hiring: resHiring };
        response(res, 201, "구인 등록 완료", payLoad);

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정 페이지
router.get('/:hiring_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

        let hiring = await Hiring.findOne({
            where: { id: hiring_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                }
            ]
        });
        if (!hiring) { response(res, 404, "데이터 없음"); return; }

        let payLoad = { hiring };
        response(res, 200, "구인 수정 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:hiring_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.params;
        const { hiring } = req.body;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }
        if (!hiring) { response(res, 400, "데이터 없음"); return; }
   
        await Hiring.update(
            { 
                // 작성
            },
            { where: { id: hiring_id } },
        )

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/:hiring_id/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.body;
        // 데이터 없음
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

        await Hiring.destroy({ where: { id: hiring_id } });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;