const jwt = require('jsonwebtoken');

const { User } = require('../../models');

const { response } = require('./response');

exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(419).json({
                resultCode: 419,
                meesage: "토큰 만료"
            });
        }

        return res.status(401).json({
            resultCode: 401,
            message: "토큰이 유효하지 않습니다."
        })
    }   
}

exports.exUser = async (user_id) => {
    try {
        const user = await User.findOne({ where: { id: user_id } });

        // user 존재여부 체크
        if (user) { return true } else { return false; }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            resultCode: 500,
            message: "서버 에러"
        })
    }  
}

