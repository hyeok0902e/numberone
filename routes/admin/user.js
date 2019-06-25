const express = require('express');

// 모델 import
const {  User, Attendance, UserAuth, UserPick} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');
const { changeAuth } = require('../middlewares/userAuth')


const router = express.Router();

//유저 리스트를 보여주는 라우터
router.get('/list', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       let users = await User.findAll({attributes:['id', 'name', 'birth', "email", 'gender', 'phone', 'level']});

       if(users){
           let payload = {users};
           response(res, '200', '유저 목록', payload);
       }
       else{
            response(res, '404', '유저 없음');
       }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})
//유저 상사를 보여주는 라우터
router.get('/show/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       let user = await User.findOne({
           where:{id: req.params.id},
           attributes:['id', 'profile', 'email', 'name', 'birth', 'gender', 'phone', 'task', 'level','productAuth','productAuthPeriod', 'marketAuth', 'marketAuthPeriod'],
           include:[{model: Attendance}, {model:UserAuth, attributes:['period']}, {model: UserPick, attributes:['name']}]
        });
        if(user){
            let payload = {user};
            response(res, '200', '유저 상세', payload);
        }
        else{
             response(res, '404', '유저 없음');
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//유저의 회원 등급을 변경하는 라우터
router.put('/edit/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let {info} = req.body;
        let user = await User.findOne({where: {id: req.params.id}});
        let auth = await user.getUserAuth();
        if(user){
            changeAuth(user, auth, info, res); //미들웨어를 통해 사용자의 등급을 변경
            response(res, '200', '변경 완료');
        }
        else{
            response(res, '404', '유저 없음');
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//유저 검색 라우터
router.get('/search/:email', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let user = await User.findOne({where: {email: req.params.email}, attributes:['id', 'name', 'birth', "email", 'gender', 'phone', 'level']});
        if(user){
            let payload = {user};
            response(res, '200', '유저 정보', payload);       
        }
        else{
            response(res, '404', '유저 없음');
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})





module.exports = router;