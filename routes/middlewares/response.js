exports.response = async (res, resultCode, message, payLoad) => {  
    try {
        console.log("후화")
        return await res.status(resultCode).json({
            resultCode: resultCode,
            message: message,
            payLoad,
        });
    } catch (err) {
        console.log(err);
        return await res.status(500).json({
            resultCode: 500,
            message: "서버 에러"
        })
    }    
}