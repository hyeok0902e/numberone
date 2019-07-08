const express = require('express');
const axios = require('axios');

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
            where: { type: 0, },
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
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

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

        // 관계설정
        let exHiring = await Hiring.findOne({ where: { id: hiring_id } });
        if (!exHiring) { response(res, 404, "구인 정보가 존재하지 않습니다."); return; }
        await exHiring.addApplying(resHiring);

        // 문자메세지 전송 구현
        let phoneNum = user.phone;
        let message = user.name + "[" + user.email + "]님이 " + resHiring.company + " 업체에 대해 구인 신청을 하였습니다. / Tel: " + user.phone;   
        await axios.post(
            'https://api-sens.ncloud.com/v1/sms/services/ncp:sms:kr:256360784020:numberone/messages',
            {
                "type":"LMS",
                "contentType":"COMM",
                "countryCode":"82",
                "from":"01090075064",
                "to": [phoneNum],
                "content": message
            },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'x-ncp-auth-key': 'aknAO0c9oVle5No8A4yC',
                    'X-NCP-service-secret': 'b063dccf18b7426fa692b3405d93481d',         
                }
            }
        ).then((res) => {
            let payLoad = { hiring: resHiring };
            response(res, 201, "구인 참여신청(SNS 전송) 완료 - 내 참여신청 목록 페이지로 이동");
        }).catch((err) => {
            console.log(err);
            response(res, 400, "문자 메세지 전송오류");
        });
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;