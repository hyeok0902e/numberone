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