const express = require('express');

// 모델 import
const { MarketPrice, MarketPriceOpt, Address, User} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyMarketPriceAuth } = require('../middlewares/userAuth');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');


const router = express.Router();

//시세정보를 등록하는 라우터
router.post('/', verifyToken, verifyDuplicateLogin, verifyMarketPriceAuth, async(req, res, next)=>{
    try{
        let {marketPriceInfo, addressInfo, marketPriceOpts} = req.body;
        let user = await User.findOne({where: req.decoded.id});
        
        let marketPrice = await MarketPrice.create({ // 시세정보 생성
            name: marketPriceInfo.name,
            company: marketPriceInfo.company,
            startDate: marketPriceInfo.startDate,
            endDate: marketPriceInfo.endDate,
            period: marketPriceInfo.period
        });
        if(marketPrice){
            user.addMarketPrice(marketPrice); // 유저와 시세정보를 연결

            let address = await Address.create({ // 주소 정보 생성
                jibunAddr: addressInfo.jibunAddr,
                roadFullAddr: addressInfo.roadFullAddr,
                roadAddrPart1: addressInfo.roadAddrPart1,
                roadAddrPart2: addressInfo.jibunAddr,
                engAddr: addressInfo.engAddr,
                zipNo: addressInfo.zipNo,
                siNm: addressInfo.siNm,
                sggNm: addressInfo.sggNm,
                emdNm: addressInfo.emdNm,
                liNm: addressInfo.liNm,
                rn: addressInfo.rn,
                lnbrMnnm: addressInfo.lnbrMnnm,
                lnbrSlno: addressInfo.lnbrSlno,
                detail: addressInfo.detail
            });

            await marketPrice.setAddress(address); // 시세정보와 주소를 연결

            await asyncForEach(marketPriceOpts, async (opt)=>{ // 시세정보 옵션 생성 후 시세정보와 연결
                let priceOpt = await MarketPriceOpt.create({
                    name: opt.name,
                    price: opt.price
                });
                if(priceOpt){
                    marketPrice.addMarketPriceOpt(priceOpt);
                }
                else{
                    response(res, 400, "에러: 옵션 생성 실패");
                }
            });
            let resultMarketPrice = await MarketPrice.findOne({
                where:{id: marketPrice.id},
                include:[{model: Address}, {model: MarketPriceOpt, limit: 5}],

            });
            let payload = {resultMarketPrice};
            response(res, 201, "시세정보 등록 완료", payload);
        }
        else{
            response(res, 400, "시세정보 등록 실패");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})
//시세정보를 수정하는 라우터
router.put('/edit/:id', verifyToken, verifyDuplicateLogin, verifyMarketPriceAuth, async(req, res, next)=>{
    try{
        let {id} = req.params;
        let {newMarketPriceInfo, newAddressInfo, newMarketPriceOpts} = req.body;

        let marketPrice = await MarketPrice.findOne({where: {id: id}});//기존 시세정보
        let currentAddress = await marketPrice.getAddress();//기존 주소
        let currentMarketPriceOpts = await marketPrice.getMarketPriceOpts();// 기존 시세정보 옵션

        if(marketPrice){// 기존 시세정보 존재시
            await marketPrice.update({//시세정보 업데이트
                name: newMarketPriceInfo.name,
                company: newMarketPriceInfo.company,
                startDate: newMarketPriceInfo.startDate,
                endDate: newMarketPriceInfo.endDate,
                period: newMarketPriceInfo.period
            });

            await currentAddress.update({//기존 주소 업데이트
                jibunAddr: newAddressInfo.jibunAddr,
                roadFullAddr: newAddressInfo.roadFullAddr,
                roadAddrPart1: newAddressInfo.roadAddrPart1,
                roadAddrPart2: newAddressInfo.jibunAddr,
                engAddr: newAddressInfo.engAddr,
                zipNo: newAddressInfo.zipNo,
                siNm: newAddressInfo.siNm,
                sggNm: newAddressInfo.sggNm,
                emdNm: newAddressInfo.emdNm,
                liNm: newAddressInfo.liNm,
                rn: newAddressInfo.rn,
                lnbrMnnm: newAddressInfo.lnbrMnnm,
                lnbrSlno: newAddressInfo.lnbrSlno,
                detail: newAddressInfo.detail
            });
            await asyncForEach(currentMarketPriceOpts, async(opt)=>{ //기존 연관 옵션 데이터를 삭제
                opt.destroy()
            });
            await asyncForEach(newMarketPriceOpts, async (opt)=>{ // 새로운 시세정보 옵션 생성 후 시세정보와 연결
                let priceOpt = await MarketPriceOpt.create({
                    name: opt.name,
                    price: opt.price
                });
                if(priceOpt){
                    marketPrice.addMarketPriceOpt(priceOpt);
                }
                else{
                    response(res, 400, "에러: 옵션 생성 실패");
                }
            });
            response(res, 201, "시세정보 수정 완료");
        }
        else{
            response(res, 404, "에러: 존재하지 않는 시세정보");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//시세 정보를 삭제하는 라우터
router.delete('/delete/:id', verifyToken, verifyDuplicateLogin, verifyMarketPriceAuth, async(req, res, next)=>{
    try{
        let {id} = req.params;
        let marketPrice = await MarketPrice.findOne({where: {id: id}});//기존 시세정보

        if(marketPrice){// 기존 시세정보 존재시
            await marketPrice.destroy();
            response(res, 201, "시세정보 삭제 완료");
        }
        else{
            response(res, 404, "에러: 존재하지 않는 시세정보");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

router.get('/list', verifyToken, verifyDuplicateLogin, verifyMarketPriceAuth, async(req, res, next)=>{
    try{
        let marketPrices = await MarketPrice.findAll({
            attributes:['name','company'],
            include:[{model: Address, attributes:['roadFullAddr']}, {model: MarketPriceOpt, attributes:['price'], limit: 1}],
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

})

router.get('/show/:id', verifyToken, verifyDuplicateLogin, verifyMarketPriceAuth, async(req, res, next)=>{
    try{
        let {id} = req.params;
        let marketPrice = await MarketPrice.findOne({
            where:{id: id},
            include:[{model: Address}, {model: MarketPriceOpt, limit: 5}],
        });//기존 시세정보
        if(marketPrice){// 기존 시세정보 존재시
            let payload = {marketPrice};
            response(res, 200, "시세정보 상세", payload);
        }
        else{
            response(res, 404, "에러: 존재하지 않는 시세정보");
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})


module.exports = router;