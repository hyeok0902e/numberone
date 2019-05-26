exports.response = (res, resultCode, message, payLoad) => {  
    return res.status(resultCode).json({
        resultCode: resultCode,
        message: message,
        payLoad,
    });
}