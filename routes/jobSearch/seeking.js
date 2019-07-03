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
        const seekings = await Seeking.findAll({
            where: { user_id: user.id, type: 0, },
            attributes: ['id', 'company', 'address', 'car', 'career'],
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
        response(res, 200, "구직 목록", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:seeking_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_id } = req.params;
        if (!seeking_id) { response(res, 400, "params값 없음"); return; }

        let seeking = await Seeking.findOne({ 
            where: { id: seeking_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']],
                }
            ] 
        });
        if (!seeking) { response(res, 404, "구직정보가 존재하지 않습니다."); return; }
        let payLoad = { seeking }
        response(res, 200, "구직정보 상세 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 참여신청

// 구직 등록
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking } = req.body;
        if (!seeking) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        let a = seeking;

        let resSeeking = await Seeking.create({
            type: 0, company: a.company, address: a.address, 
            car: a.car, career: a.career, description: a.description,
            isSelected: 0,
        });
        await user.addSeeking(resSeeking);
        await asyncForEach(a.labor, async (l) => {
            let labor = await Labor.create({
                major: l.major, people: l.people,
            });
            await resSeeking.addLabor(labor);
        });

        resSeeking = await Seeking.findOne({
            where: { id: resSeeking.id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                }
            ]
        });
        let payLoad = { seeking: resSeeking };
        response(res, 201, "구직 등록 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정 페이지
router.get('/:seeking_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_id } = req.params;
        if (!seeking_id) { response(res, 400, "params값 없음"); return; }

        let seeking = await Seeking.findOne({ 
            where: { id: seeking_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']],
                }
            ] 
        });
        if (!seeking) { response(res, 404, "구직정보가 존재하지 않습니다."); return; }
        let payLoad = { seeking }
        response(res, 200, "구직정보 수정 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:seeking_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_id } = req.params;
        if (!seeking_id) { response(res, 400, "params값 없음"); return; }
        const { seeking } = req.body;
        if (!seeking) { response(res, 400, "데이터 없음"); return; }

        let a = seeking;
        await Seeking.update(
            {
                company: a.company, address: a.address, 
                car: a.car, career: a.career, description: a.description,
            },
            { where: { id: seeking_id } }
        );
        await asyncForEach(a.labor, async (l) => {
            await Labor.update(
                {
                    major: l.major, people: l.people,
                },
                { where: { seeking_id } }
            );
        });

        let resSeeking = await Seeking.findOne({
            where: { id: seeking_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                }
            ]
        });
        let payLoad = { seeking: resSeeking };
        response(res, 200, "구직정보 수정 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/:seeking_id/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking_id } = req.params;
        if (!seeking_id) { response(res, 400, "params값 없음"); return; }

        await Seeking.destroy({ where: { id: seeking_id } });
        response(res, 200, "구직정보 삭제 완료")
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 구인 참여신청
router.post('/:seeking_id/participate', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { seeking } = req.body;
        if (!seeking) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        let a = seeking;
        let resSeeking = await Seeking.create({
            type: 1, company: a.company, address: a.address, 
            startDate: a.startDate, endDate: a.endDate, description: a.description,
            isSelected: 0,
        })
        await user.addSeeking(resSeeking);
        await asyncForEach(a.labor, async (l) => {
            let labor = await Labor.create({
                major: l.major, people: l.people,
            });
            await resSeeking.addLabor(labor);
        });

        // 문자메세지 전송 구현
        //
        //
        //
        //

        
        response(res, 201, "구직 참여신청(SNS 전송) 완료 - 내 참여신청 목록 페이지로 이동");
        
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});
module.exports = router;