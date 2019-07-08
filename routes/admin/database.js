const xlsx = require('xlsx');
const express = require('express');
const multiparty = require('multiparty');

// 모델 import
const { User, StatementAdmin, } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');


const router = express.Router();

// 수수료계산서
router.post('/fee/create', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

// 내역서
router.post('/statement/create', verifyToken, verifyDuplicateLogin, verifyIsAdmin, (req, res, next) => {
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










module.exports = router;