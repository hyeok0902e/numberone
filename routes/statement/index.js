const express = require('express');

// 모델 import
const { 
    User, UserAuth, Statement,
    Process, ProcessDetail, ProcessDetailElement,
    StatementAdmin,
} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken , verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyStatementAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {   
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        const statements = await Statement.findAll({ 
            where: { user_id: user.id },
            attributes: ['id', 'name', 'lastCost', 'contractCost', 'public1', 'public2'],
            order: [['id', 'DESC']],             
        });

        payLoad = { statements }
        response(res, 200, "내역서 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:statement_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {   
        const { statement_id } = req.params;
        if (!statement_id) { response(res, 400, "데이터 없음"); return; }
        const statement = await Statement.findOne({ where: { id: statement_id } });
        if (!statement) { response(res, 404, "내역서가 존재하지 않습니다."); return; }

        const resStatement = await Statement.findOne({
            where: { id: statement_id },
        });
        let payLoad = { statement: resStatement };
        response(res, 200, "내역서 상세 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    } 
});

// 생성
router.post('/create', verifyToken, verifyStatementAuth, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { statement } = req.body;
        if (!statement) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        let a = statement;
        // 생성
        let resStatement = await Statement.create({
            name: a.name, dataFrom: a.dataFrom, 
            tMaterialCost: a.tMaterialCost, dMaterialCost: a.dMaterialCost, idMaterialCost: a.idMaterialCost,
            tLaborCost: a.tLaborCost, dLaborCost: a.dLaborCost, idLaborCost: a.idLaborCost,
            tOperateCost: a.tOperateCost, machinCost: a.machinCost, installCost: a.installCost,
            eIndustry: a.eIndustry, eEmploy: a.eEmploy, eHealth: a.eHealth, ePension: a.ePension,
            eElderly: a.eElderly, eRetire: a.eRetire, materialTest: a.materialTest, industrySafe: a.industrySafe,
            basicA: a.basicA, basicB: a.basicB, envProtect: a.envProtect, etcOperateCost: a.etcOperateCost,
            doWork: a.doWork, constPerform: a.constPerform, personal: a.personal, etc: a.etc, sum: a.sum, vat: a.vat,
            contractCost: a.contractCost, public1: a.public1, public2: a.public2,
            kepcoCost: a.kepcoCost, commuCost: a.commuCost, lastCost: a.lastCost, comment: a.comment,
        });
        await user.addStatement(resStatement);

        await asyncForEach(statement.process, async (p) => {
            let process = await Process.create({
                name: p.name, materialCost: p.materialCost, 
                laborCost: p.laborCost, operateCost: p.operateCost,
            });
            await resStatement.addProcess(process);

            await asyncForEach(p.processDetail, async (p) => {
                let processDetail = await ProcessDetail.create({
                    name: p.name, materialCost: p.materialCost,
                    laborCost: p.laborCost, operateCost: p.operateCost,
                });
                await process.addProcessDetail(processDetail);

                await asyncForEach(p.processDetailElement, async (p) => {
                    let processDetailElement = await ProcessDetailElement.create({
                        name: p.name, standard: p.standard, unit: p.unit, num: p.num,
                        materialCost: p.materialCost, tMaterialCost: p.tMaterialCost,
                        laborCost: p.laborCost, tLaborCost: p.tLaborCost, 
                        operateCost: p.operateCost, tOperateCost: p.operateCost,
                        tUnitCost: p.tUnitCost, totalCost: p.totalCost,
                    });
                    await processDetail.addProcessDetailElement(processDetailElement);
                });
            });
        });

        // 권한 업데이트
        const userAuth = await UserAuth.findOne({ where: { user_id: user.id } });
        let count = 0;
        if (userAuth.statement > 0) {
            count = userAuth.statement - 1;
        } else {
            count = 0;
        }
        await UserAuth.update(
            { statement: count },
            { where: { user_id: user.id } }
        );

        // 응답
        let payLoad = { resStatement };
        response(res, 201, "내역서 생성 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버에러");
    }
});

// 목록에서 추가 
router.get('/processDetailElement', verifyToken, verifyDuplicateLogin, verifyStatementAuth, async (req, res, next) => {
    try {
        let elements = await StatementAdmin.findAll();
        let payLoad = { elements };
        response(res, 200, "세부 공종 엘리먼트 목록 반환", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    } 
});

// 수정 => 기존 데이터 삭제

// 자료 요청
router.post('/:statement_id/call', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { statement_id } = req.params;
        if (!statement_id) { response(res, 400, "params값 없음"); return; }

        let statement = await Statement.findOne({ where: { id: statement_id } });
        if (!statement) { response(res, 404, "내역서가 존재하지 않습니다."); return; }

        await Statement.update(
            { state: 1 },
            { where: { id: statement_id } }
        );

        response(res, 200, "자료요청 완료")
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { statement_ids } = req.body;  

        // 데이터 없음
        if (!statement_ids) { response(res, 400, "데이터 없음"); return; }

        await asyncForEach(statement_ids, async (id) => {
            await Statement.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;