const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Transformer } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 변압기(고압용만) 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject_id, transformer } = req.body;

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 입력값 체크
        if (!transformer) { response(res, 400, "값은 입력해 주세요."); return; }
        if (transformer == []) { response(res, 400, "값을 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "유저 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(billAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 계산서 존재여부 체크
        let billProject = await BillProject.findOne({ where: { id: billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }
        
        // 고압수전 체크
        if (billProject.voltType != 0) { response(res, 400, "변압기 등록 불가"); eturn; }
        // 접근 권한 체크
        if (billProject.user_id != user.id) { response(res, 401, "권한 없음"); }

        let transformerKva = 0;
        // 변압기 생성
        await asyncForEach(transformer, async (transformer) => {
            let reTransformer = await Transformer.create({
                volt: transformer.volt, output: transformer.output, impedance: transformer.impedance, 
                taskWay: transformer.taskWay, taskKva: transformer.taskKva, taskCoef: transformer.taskCoef,
                impowerLate: transformer.impowerLate, taskPowerlate: transformer.taskPowerlate, 
                voltDrop: transformer.voltDrop, excessLate: transformer.excessLate,
                secP1: transformer.secP1, secQ1: transformer.secQ1, 
                secP2: transformer.secP2, secQ2: transformer.secQ2, 
                secPs: transformer.secPs, 
                firstVal: transformer.firstVal, secVal: transformer.secVal, 
                userVal: transformer.userVal, voltDropVal: transformer.voltDropVal
            });

            transformerKva += transformer.userVal;

            let bank = await Load.findOne({ where: { id: transformer.bank_id, type: 0 } });
            await bank.setTransformer(reTransformer); // 1:1 관계
        });
        console.log(transformerKva);
        // 프로젝트 DB에 변압기 전체 용량 저장
        await BillProject.update({ transformerKva, volt: 22900 }, { where: { id: billProject_id } });

        // 수전설비에 줄 데이터 준비
        billProject = await BillProject.findOne({
            where: { id: billProject_id },
            attributes: ['id', 'voltType' , 'transformerKva', 'volt'],
            include: [{ 
                model: Load, 
                where: { type: 0 },
                attributes: ['id', 'volt'],
                include: [{
                    model: Transformer,
                    attributes: ['userVal'],
                }] 
            }]
        })

        let payLoad = { 
            billProject,
        };

        response(res, 201, "변압기 데이터 생성 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;