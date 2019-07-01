const xlsx = require('xlsx');
const express = require('express');
const multiparty = require('multiparty');

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
const { verifyIsAdmin } = require('../middlewares/adminAuth');

const router = express.Router();

// 관리자 DB 업로드
router.post('/fileUpload', verifyToken, verifyDuplicateLogin, verifyIsAdmin, (req, res, next) => {
     try {
        StatementAdmin.destroy({ where: {} }); // 액셀 파일 업로드 시, 기존 데이터 초기화
        const resData = {};
        const form = new multiparty.Form({
            autoFiles: true,
        });

        form.on('file', async (name, file) => {
            const statement = xlsx.readFile(file.path);
            const sheetnames = Object.keys(statement.Sheets);

            if (!sheetnames) { response(res, 400, "데이터 없음"); return; }
            let i = sheetnames.length;
    
            while (i--) {
                const sheetname = sheetnames[i];
                resData[sheetname] = xlsx.utils.sheet_to_json(statement.Sheets[sheetname]);
            }
        });
        form.on('close', async () => {
            await asyncForEach(resData.Sheet1, (data) => {
                StatementAdmin.create({
                    name: data.name,
                    standard: data.standard,
                    unit: data.unit,
                    materialCost: data.materialCost,
                    laborCost: data.laborCost,
                    operateCost: data.operateCost,
                    sum: data.sum,
                });
            })
        });
        form.parse(req);
        response(res, 201, "등록완료");
     } catch (err) {
         console.log(err);
         response(res, 500, "서버 에러");
     }
});

// 자료요청 목록
router.get('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {
        const statements = await Statement.findAll({ where: { state: 1 } });
        let payLoad = { statements };
        response(res, 200, "자료요청 내역서 목록", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 자료요청 목록 상세
router.get('/:statement_id/show', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {
        const { statement_id } = req.params;
        if (!statement_id) { response(res, 400, "params값 없음"); return; }

        const statement = await Statement.findOne({ where: { id: statement_id, state: 1 } });
        if (!statement) { response(res, 400, "내역서가 존재하지 않습니다."); return; }

        let payLoad = { statement };
        response(res, 200, "자료요청 내역서 목록 상세페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 자료요청 처리
router.post('/:statement_id/back', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {
        const { statement_id } = req.params;
        if (!statement_id) { response(res, 400, "params값 없음"); return; }

        let statement = await Statement.findOne({ where: { id: statement_id } });
        if (!statement) { response(res, 404, "내역서가 존재하지 않습니다."); return; }

        await Statement.update(
            { state: 0 },
            { where: { id: statement_id } }
        );

        response(res, 200, "자료요청 처리 완료")
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;