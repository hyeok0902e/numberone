exports.checkBillAuth = async (user) => {
    if ((user.level != 0) && (user.UserAuth.period > 0) && (user.UserAuth.billProject > 0)) {
        return true;
    } else {
        return false;
    }
}