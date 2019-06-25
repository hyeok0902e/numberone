const express = require('express');
const multiparty = require('multiparty');
const xlsx = require('xlsx');
const sequelize = require("sequelize");
const Op = sequelize.Op;


// 모델 import
const {  Material } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyMaterialAuth } = require('../middlewares/userAuth');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');

const router = express.Router();



//자재 엑셀파일을 업로드 하는 라우터
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
                Material.create({
                    name: data.name,
                    standard: data.standard,
                    unit: data.unit,
                    organizePrice: data.organizePrice,
                    organizePage: data.organizePage,
                    dealPrice: data.dealPrice,
                    dealPage: data.dealPage,
                    sellPrice: data.sellPrice,
                    sellPage: data.sellPage,
                    marketPrice: data.marketPrice,
                    marketPage: data.marketPage,
                    searchPrice: data.searchPrice,
                    searchPage: data.searchPage,
                    minPrice: data.minPrice,
                    company: data.company,
                    url: data.url
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

//자재 전체 목록을 보여주는 라우터
router.get('/', verifyToken, verifyDuplicateLogin, verifyMaterialAuth, async(req, res, next)=>{
    try{
        let materials = await Material.findAll({attributes:['id', 'name', 'standard', 'unit', 'organizePrice','marketPrice']});
        if(materials){
            let payload = {materials};
            response(res, '200', "자재 목록", payload);
        }
        else{
            response(res, '404', "목록없음");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//검색되는 자재를 보여주는 라우터
router.get('/search', verifyToken, verifyDuplicateLogin, verifyMaterialAuth, async(req, res, next)=>{
    try{
        let materials = await Material.findAll({where: {name:{ [Op.like]:'%'+req.body.keyword+'%'}}, attributes:['id', 'name', 'standard', 'unit', 'organizePrice','marketPrice']});
        
        if(materials){
            let payload = {materials};
            response(res, '200', "지재 목록", payload);
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
router.get('/show/:id', verifyToken, verifyDuplicateLogin, verifyMaterialAuth, async(req, res, next)=>{
    try{
        let material = await Material.findOne({where: {id: req.params.id}});
        if(material){
            let payload = {material};
            response(res, '200', "자재 상세", payload);
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