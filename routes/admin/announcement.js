const express = require('express');

// 모델 import
const { Announcement } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');


const router = express.Router();

//공지를 등록하는 라우터
router.post('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let { info } = req.body;

        let announcement = await Announcement.create({
            title: info.title,
            body: info.body
        });

        if(announcement){
            let payload = {announcement};
            response(res, '201', '공지 등록 성공', payload);
        }
        else{
            response(res, '404', '등록 실패' );
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

});

// 공지 목록을 불러오는 라우터
router.get('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let announcements = await Announcement.findAll({attributes:['id', 'title', 'createdAt']});
        if(announcements){
            let payload = {announcements};
            response(res, '200', '공지 목록', payload);
        }
        else{
            response(res, '404', '공지 없음');
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 공지를 삭제하는 라우터
router.delete('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let {ids} = req.body;

        await asyncForEach(ids, async (id)=>{
            let announcement = await Announcement.findOne({where:{id: id}});
            if(announcement){
                announcement.destroy();
            }
        });
            response(res, '201', '공지 삭제 성공', );
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

//공지 수정 페이지로 이동
router.get('/edit/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let announcement = await Announcement.findOne({where:{id: req.params.id}});
        if(announcement){
            let payload = {announcement}
            response(res, '201', '공지 상세', payload );
        }
        else{
            response(res, '404', '공지 없음');
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

//공지를 등록하는 라우터
router.put('/edit/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let {info} = req.body;
        let announcement = await Announcement.findOne({where:{id: req.params.id}});
        announcement.update({
            title: info.title,
            body: info.body
        });

        if(announcement){
            let payload = {announcement};
            response(res, '201', '공지 수정 성공', payload);
        }
        else{
            response(res, '404', '등록 실패' );
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

});


//공지 상세
router.get('/edit/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let announcement = await Announcement.findOne({where:{id: req.params.id}});
        if(announcement){
            let payload = {announcement}
            response(res, '201', '공지 상세', payload );
        }
        else{
            response(res, '404', '공지 없음');
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

module.exports = router;