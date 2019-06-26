const jwt = require('jsonwebtoken');

// 모델 import
const { User, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { response } = require('./response');

exports.verifyToken = async (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await User.findOne({ id: req.decoded.user_id });

        // 유저 존재여부 체크
        if (!user) { response(res, 404, "유저가 존재하지 않습니다."); return; }

        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            response(res, 419, "토큰 만료");
        } else {
            response(res, 401, "권한 없음");
        }
    }   
}

exports.exUser = async (user_id) => {
    try {
        const user = await User.findOne({ where: { id: user_id } });

        // user 존재여부 체크
        if (user) { return true; } else { return false; }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            resultCode: 500,
            message: "서버 에러"
        })
    }  
}

// uuid 유효성 체크 => false 이면 중복 로그인!
exports.verifyUid = async (tID, uID) => {
    try {   
        if (tID == uID) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
} 

exports.asyncForEach = async (array, callback) => {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i], i ,array);
    }
}


// 중복로그인 체크
exports.verifyDuplicateLogin = async (req, res, next) =>{ // 사용자 중복확인
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if (!(req.decoded.uuid==user.uuid)){
            
            response(res, 400, "중복 로그인"); ;
        }
        else{
            return next();
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}
