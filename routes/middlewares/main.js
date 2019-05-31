const jwt = require('jsonwebtoken');

// 모델 import
const { User } = require('../../models');

// 커스텀 미들웨어
const { response } = require('./response');

exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            response(res, 419, "토큰 만료");
        } else {
            response(res, 401, "토큰이 유효하지 않습니다.");
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

