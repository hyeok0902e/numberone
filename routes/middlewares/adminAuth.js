const { User } = require('../../models');

// 커스텀 미들웨어
const { response } = require('./response');

// 관리자 권한
exports.verifyIsAdmin = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
        });
        if ((user.level == 6)) {
            return next();
        } else {
            response(res, 401, "관리자 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}