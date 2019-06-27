const express = require('express');

// 모델 import
const { Document } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');
const { uploadDocument } = require('../middlewares/uploadImg');

const router = express.Router();



//자료실 파일을 업로드 하는 라우터
router.post('/fileUpload', verifyToken, verifyDuplicateLogin, verifyIsAdmin, uploadDocument.single('document'), async (req, res, next)=>{
    try{
        let documentUrl = req.file.location;
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
router.post('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
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
router.get('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
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

//자료 수정 페이지 이동 라우터
router.get('/edit/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let document = await Document.findOne({where: {id: req.params.id}});
        if(document){
            let payload = {document};
            response(res, '200', "자료 상세", payload);
        }
        else{
            response(res, '404', "목록없음");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
})


//자료 수정 라우터
router.put('/edit/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let doc = req.body.doc;
        let document = await Document.findOne({where: {id: req.params.id}});

    if(document){
        document.update({
            num : doc.num,
            fileName : doc.fileName,
            fileURL: doc.url,
            mainCategory : doc.mainCategory,
            middleCategory : doc.middleCategory,
            subCategory : doc.subCategory
        });
        let payload = {document};
        response(res, '201', '자료 수정 성공', payload)
    }
    else{
        response(res, '404', "자료없음");
    }

    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
})


//자료 삭제 라우터
router.delete('/delete/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let document = await Document.findOne({where: {id: req.params.id}});

    if(document){
        document.destroy();
        response(res, '201', '자료 삭제 성공')
    }
    else{
        response(res, '404', "자료없음");
    }

    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
})








module.exports = router;