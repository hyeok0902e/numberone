const { User, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { response } = require('./response');



// 업체관리 등록 권한
exports.compAuth = async (user) => {
    if ((user.UserAuth.compManage > 0)) {
        return true;
    } else {
        return false;
    }
}

// 계산서 프로젝트 등록 권한
exports.billAuth = async (user) => {
    if ((user.UserAuth.billProject > 0)) {
        return true;
    } else {
        return false;
    }
}

// 단독계산 이용 권한
exports.billSimplyAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.billSimply == true)) {
        return true;
    } else {
        return false;
    }
}

// 사업소 이용 권한
exports.organizationAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.organization == true)) {
        return true;
    } else {
        return false;
    }
}

// 수수료 프로젝트 등록 권한
exports.feeAuth = async (user) => {
    if ((user.UserAuth.feeProject > 0)) {
        return true;
    } else {
        return false;
    }
}

// 내역서 등록 권한
exports.statementAuth = async (user) => {
    if ((user.UserAuth.statement > 0)) {
        return true;
    } else {
        return false;
    }
}

// 자재검색 이용 권한
exports.materialAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.material == true)) {
        return true;
    } else {
        return false;
    }
}

// 자료실 이용 권한
exports.documentAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.document == true)) {
        return true;
    } else {
        return false;
    }
}

// 장터 이용 권한
exports.productSeeAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.product == true)) {
        return true;
    } else {
        return false;
    }
}

// 구인/구직 이용 및 등록 권한
exports.jobSearchAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.jobSearch == true)) {
        return true;
    } else {
        return false;
    }
}

// 시세정보 이용 권한
exports.marketPriceAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.marketPrice == true)) {
        return true;
    } else {
        return false;
    }
}


////////유저를 넘기지 않고 자동으로 모든 권한을 체크하는 미들웨어입니다.


// 업체관리 등록 권한
exports.verifyCompAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
    
        if ((user.UserAuth.compManage > 0)) {
            return next();
        } else {
            response(res, 401, "업체관리 등록 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }

}

// 계산서 프로젝트 등록 권한
exports.verifyBillAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        if ((user.UserAuth.billProject > 0)) {
            return next();
        } else {
            response(res, 401, "계산서 등록 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 단독계산 이용 권한
exports.verifyBillSimplyAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        if ((user.UserAuth.period > 0) && (user.UserAuth.billSimply == true)) {
            return next();
        } else {
            response(res, 401, "단독계산 이용 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 사업소 이용 권한
exports.verifyOrganizationAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if ((user.UserAuth.period > 0) && (user.UserAuth.organization == true)) {
            return next();
        } else {
            response(res, 401, "사업소 이용 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 수수료 프로젝트 등록 권한
exports.verifyFeeAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if ((user.UserAuth.feeProject > 0)) {
            return next();
        } else {
            response(res, 401, "수수료 프로젝트 등록 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 내역서 등록 권한
exports.verifyStatementAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if ((user.UserAuth.statement > 0)) {
            return next();
        } else {
            response(res, 401, "내역서 등록 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 자재검색 이용 권한
exports.verifyMaterialAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if ((user.UserAuth.period > 0) && (user.UserAuth.material == true)) {
            return next();
        } else {
            response(res, 401, "자재검색 이용 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 자료실 이용 권한
exports.verifyDocumentAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if ((user.UserAuth.period > 0) && (user.UserAuth.document == true)) {
            return next();
        } else {
            response(res, 401, "자료실 이용 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 장터 이용 권한
exports.verifyProductSeeAuth = async (req, res, next) => {
    try{

        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        if ((user.UserAuth.period > 0) && (user.UserAuth.product == true)) {
            return next();
        } else {
            response(res, 401, "장터 이용 권한이 없습니다");
        }
    }catch(err){
        console.log(1111111);
        response(res, 404, "서버에러");
    }
}

// 구인/구직 이용 및 등록 권한
exports.verifyJobSearchAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if ((user.UserAuth.period > 0) && (user.UserAuth.jobSearch == true)) {
            return next();
        } else {
            response(res, 401, "구인구직 이용 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}

// 시세정보 이용 권한
exports.verifyMarketPriceAuth = async (req, res, next) => {
    try{
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });
        if ((user.UserAuth.period > 0) && (user.UserAuth.marketPrice == true)) {
            return next();
        } else {
            response(res, 401, "시세정보 이용 권한이 없습니다");
        }
    }catch(err){
        response(res, 404, "서버에러");
    }
}