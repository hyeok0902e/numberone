const express = require('express');
const multiparty = require('multiparty');
const xlsx = require('xlsx');
const sequelize = require("sequelize");
const Op = sequelize.Op;


// 모델 import
const {  Organization } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyOrganizationAuth } = require('../middlewares/userAuth');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');

const router = express.Router();



//사업소 엑셀파일을 업로드 하는 라우터
router.post('/fileUpload', verifyToken, verifyDuplicateLogin, verifyIsAdmin, (req, res, next)=>{
    try{
        const resData = {};
        const form = new multiparty.Form({
            autoFiles: true,
        });
    
        form.on('file', (name, file) => {
            const workbook = xlsx.readFile(file.path);
            const sheetnames = Object.keys(workbook.Sheets);
    
            let i = sheetnames.length;
    
            while (i--) {
                const sheetname = sheetnames[i];
                resData[sheetname] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
            }
        });
        form.on('close', async () => {
            await asyncForEach(resData.Sheet1, (data)=>{
                Organization.create({
                    name: data.name,
                    region: data.region,
                    zipcord: data.zipcord,
                    address: data.address,
                    branch: data.branch,
                    jurisdiction: data.jurisdiction,
                    serviceCenter: data.serviceCenter,
                    applyTel: data.applyTel,
                    costTel: data.costTel,
                    fax: data.fax,
                    supplyTel: data.supplyTel,
                    checkTel: data.checkTel,
                    sunTel: data.sunTel,
                    wireTel: data.wireTel,
                    safeTel: data.safeTel,
                    meterTel: data.meterTel
                })
            })
        });
        form.parse(req);
        response(res, 201, "등록완료");

    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//사업소 전체 목록을 보여주는 라우터
router.get('/', verifyToken, verifyDuplicateLogin, verifyOrganizationAuth, async(req, res, next)=>{
    try{
        let organizations = await Organization.findAll({attributes:['id', 'name', 'region', 'branch', 'jurisdiction','serviceCenter']});
        if(organizations){
            let payload = {organizations};
            response(res, '200', "사업소 목록", payload);
        }
        else{
            response(res, '404', "목록없음");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//특정 카테고리의 사업소 목록을 보여주는 라우터
router.get('/category/:categoryNum', verifyToken, verifyDuplicateLogin, verifyOrganizationAuth, async(req, res, next)=>{
    try{
        let category = {
            0: "한국전력공사",
            1: "한국전기안전공사",
            2: "한국전기기술인협회",
            3: "한국전기공사협회",
            4: "유통상가",
            5: "전기공사",
            6: "전기안전관리"
        }
        console.log(category[req.params.categoryNum]);

        let organizations = await Organization.findAll({where:{name: category[req.params.categoryNum]}, attributes:['id', 'name', 'region', 'branch', 'jurisdiction','serviceCenter']});
        if(organizations){
            let payload = {organizations};
            response(res, '200', "사업소 목록", payload);
        }
        else{
            response(res, '404', "목록없음");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//특정 사업소의 디테일을 보여주는 사우터
router.get('/show/:id', verifyToken, verifyDuplicateLogin, verifyOrganizationAuth, async(req, res, next)=>{
    try{
        let organization = await Organization.findOne({where: {id: req.params.id}});
        if(organization){
            let payload = {organization};
            response(res, '200', "사업소 상세", payload);
        }
        else{
            response(res, '404', "목록없음");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//검색되는 사업소를 보여주는 라우터
router.get('/search', verifyToken, verifyDuplicateLogin, verifyOrganizationAuth, async(req, res, next)=>{
    try{
        let organizations = await Organization.findAll({where: {jurisdiction:{ [Op.like]:'%'+req.body.keyword+'%'}}, attributes:['id', 'name', 'region', 'branch', 'jurisdiction','serviceCenter']});
        if(organizations){
            let payload = {organizations};
            response(res, '200', "사업소 목록", payload);
        }
        else{
            response(res, '404', "목록없음");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})



module.exports = router;