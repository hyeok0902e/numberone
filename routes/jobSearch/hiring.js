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
            where: { user_id: user.id, type: 0, },
            attributes: ['id', 'company', 'address', 'startDate', 'isSelected'],
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
        if (!hiring) { response(res, 404, "구인정보가 존재하지 않습니다."); return; }
        let payLoad = { hiring }
        response(res, 200, "구인정보 상세 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구인 등록
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring } = req.body;
        if (!hiring) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        let a = hiring;
        let resHiring = await Hiring.create({
            type: 0, company: a.company, address: a.address, 
            startDate: a.startDate, endDate: a.endDate, description: a.description,
            isSelected: 0,
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
        });
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
        if (!hiring) { response(res, 404, "구인정보가 존재하지 않습니다."); return; }
        let payLoad = { hiring }
        response(res, 200, "구인정보 수정 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:hiring_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }
        const { hiring } = req.body;
        if (!hiring) { response(res, 400, "데이터 없음"); return; }

        let a = hiring;
        await Hiring.update(
            {
                company: a.company, address: a.address, 
                startDate: a.startDate, endDate: a.endDate, description: a.description,
            },
            { where: { id: hiring_id } }
        );
        await asyncForEach(a.labor, async (l) => {
            await Labor.update(
                {
                    major: l.major, people: l.people,
                },
                { where: { hiring_id } }
            );
        });

        let resHiring = await Hiring.findOne({
            where: { id: hiring_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                }
            ]
        });
        let payLoad = { hiring: resHiring };
        response(res, 200, "구인정보 수정 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/:hiring_id/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

        await Hiring.destroy({ where: { id: hiring_id } });
        response(res, 200, "구인정보 삭제 완료")
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구인 참여신청
router.post('/:hiring_id/participate', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { hiring } = req.body;
        if (!hiring) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        let a = hiring;
        let resHiring = await Hiring.create({
            type: 1, company: a.company, address: a.address, 
            startDate: a.startDate, endDate: a.endDate, description: a.description,
            isSelected: 0,
        })
        await user.addHiring(resHiring);
        await asyncForEach(a.labor, async (l) => {
            let labor = await Labor.create({
                major: l.major, people: l.people,
            });
            await resHiring.addLabor(labor);
        });

        let payLoad = { hiring: resHiring };
        response(res, 201, "구인 참여신청 완료 - 내 참여신청 목록 페이지로 이동", payLoad);
        
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;