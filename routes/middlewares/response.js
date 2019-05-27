exports.response = (res, resultCode, message, payLoad) => {  
    try {
        return res.status(resultCode).json({
            resultCode: resultCode,
            message: message,
            payLoad,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            resultCode: 500,
            message: "서버 에러"
        })
    }    
}