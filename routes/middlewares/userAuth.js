// 업체관리 등록 권한
exports.compAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.compManage > 0)) {
        return true;
    } else {
        return false;
    }
}

// 계산서 프로젝트 등록 권한
exports.billAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.billProject > 0)) {
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
    if ((user.UserAuth.period > 0) && (user.UserAuth.feeProject > 0)) {
        return true;
    } else {
        return false;
    }
}

// 내역서 등록 권한
exports.checkStatementAuth = async (user) => {
    if ((user.UserAuth.period > 0) && (user.UserAuth.statement > 0)) {
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