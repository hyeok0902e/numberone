const express = require('express');

// 모델 import
const { MarketPrice, MarketPriceOpt, User, Address} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');


const router = express.Router();

//시세정보 목록을 불러오는 라우터
router.get('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let marketPrices = await MarketPrice.findAll({
            attributes:['name','company'],
            include:[{model: Address, attributes:['roadFullAddr']}, {model: MarketPriceOpt, attributes:['price'], limit: 1}, {model: User, attributes:['id']}],
            order: [['id','DESC']]
        });

        if(marketPrices){
            let payload = {marketPrices};
            response(res, 200, "시세정보 목록", payload);
        }
        else{
            response(res, 404, "에러: 존재하지 않는 시세정보");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});
//시세정보 삭제 라우터
router.delete('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        let {ids} = req.body;

        await asyncForEach(ids, async (id)=>{
            let marketPrice = await MarketPrice.findOne({where:{id: id}});
            if(marketPrice){
                marketPrice.destroy();
            }
        });
            response(res, '201', '시세정보 삭제 성공', );
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});



module.exports = router;