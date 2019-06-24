const express = require('express');
const multiparty = require('multiparty');
const sequelize = require("sequelize");
const Op = sequelize.Op;


// 모델 import
const { Document } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyMaterialAuth } = require('../middlewares/userAuth');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();



//자료실 파일을 업로드 하는 라우터
router.post('/fileUpload', verifyToken, verifyDuplicateLogin, verifyIsAdmin, uploadImg.single('document'), async (req, res, next)=>{
    try{
        let documentUrl = req.file.location;
        // let document = await Document.create({
        //     num : doc.num,
        //     fileName : doc.fileName,
        //     fileURL: req.file.location,
        //     mainCategory : doc.mainCategory,
        //     middleCategory : doc.middleCategory,
        //     subCategory : doc.subCategory

        // })
        if(documentUrl){
            let payload = {documentUrl};
            response(res,'201',"자료 업로드 성공", payload);
        }
        else{
            response(res,'400',"자료 업로드 실패");    
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//자료 등록 라우터
router.post('/', verifyToken, verifyDuplicateLogin, verifyMaterialAuth, async(req, res, next)=>{
    try{

        let doc = req.body.doc;
        let document = await Document.create({
        num : doc.num,
        fileName : doc.fileName,
        fileURL: doc.url,
        mainCategory : doc.mainCategory,
        middleCategory : doc.middleCategory,
        subCategory : doc.subCategory
    })
    if(document){
        let payload = {document};
        response(res, '201', '자료등록 성공', payload)
    }

    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//자료 전체 목록을 보여주는 라우터
router.get('/', verifyToken, verifyDuplicateLogin, verifyMaterialAuth, async(req, res, next)=>{
    try{
        let documents = await Document.findAll({order:[['num', 'ASC']]});
        if(documents){
            let payload = {documents};
            response(res, '200', "자료 목록", payload);
        }
        else{
            response(res, '404', "목록없음");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//검색되는 자료 보여주는 라우터
router.get('/search', verifyToken, verifyDuplicateLogin, verifyMaterialAuth, async(req, res, next)=>{
    try{
        let documents = await Document.findAll({where: {fileName:{ [Op.like]:'%'+req.body.keyword+'%'} }});
        if(documents){
            let payload = {documents};
            response(res, '200', "자료 목록", payload);
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