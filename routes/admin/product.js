const express = require('express');

// 모델 import
const { Product, ProductOpt, ProductThumb} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');
const { uploadProductImg } = require('../middlewares/uploadImg');

const router = express.Router();



//제품 사진 파일을 업로드 하는 라우터
router.post('/fileUpload', verifyToken, verifyDuplicateLogin, verifyIsAdmin, uploadProductImg.single('product'), async (req, res, next)=>{
    try{
        let documentUrl = req.file.location;
        if(documentUrl){
            let payload = {documentUrl};
            response(res,'201',"자료 업로드 성공", payload);
        }
        else{
            response(res,'400',"자료 업로드 실패");    
        }
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})


// 제품 등록
router.post('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {
        const {products}= req.body;

        // 입력값 체크
        if (!products.name || !products.category || !products.ProductOpts || !products.ProductThumbs) { 
            response(res, 400, "값을 제대로 입력해 주세요."); 
            return; 
        }

        // 제품 생성
        let product = await Product.create({ name: products.name, category: products.category, quantity: products.quantity });
        
        // ProductOpt 생성
        if (products.ProductOpts) {
            await asyncForEach(products.ProductOpts, async (opt)=>{
                let productOpt = await ProductOpt.create({ name: opt.name, price: opt.price })
                if(productOpt){
                    await product.addProductOpts(productOpt)
                }
                else{
                    response(res, 400, "에러: 제품 옵션 생성 실패");
                }
            })
        }
        
        // ProductThumb 생성
        if (products.ProductThumbs) {
            await asyncForEach(products.ProductThumbs, async (thumb)=>{
                let productThumb = await ProductThumb.create({ url: thumb.url })
                if(productThumb){ await product.addProductThumb(productThumb); }
                else{
                    response(res, 400, "에러: 제품 썸네일 생성 실패");
                }
            })
        }
        
        // 제품(옵션, 썸네일 포함) 가져오기
        product = await Product.findOne({
            where: { id: product.id },
            include: [
                { model: ProductOpt }, 
                { model: ProductThumb }
            ] 
        });
        let payLoad = { products: product };
        response(res, 201, "제품이 등록되었습니다.", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

router.get('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {   
        // 제품 목록(옵션, 사진 포함) 가져오기
        const products = await Product.findAll({attributes: ['id', 'name', 'category'],
        include: [{ model: ProductOpt, limit:1, attributes: ['price']}]})
        
        if (products.length > 0) {
            let payLoad = { products };
            response(res, 200, "장터 목록", payLoad);
        } else {
            response(res, 404, "목록이 존재하지 않습니다.");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 제품 편집 페이지 이동
router.get('/:product_id/edit', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {

        const { product_id } = req.params;
        if (!product_id) { response(res, 400, "params값 없음"); return; }


        const product = await Product.findOne({ where : {id: product_id}} );
        if (!product) { response(res, 404, "제품 없음"); return; }

        const productOpts = await ProductOpt.findAll({ where: { product_id: product.id } });
        const productThumbs = await ProductThumb.findAll({ where: { product_id: product.id }});

        let payLoad = { product, productOpts, productThumbs };
        response(res, 200, "제품 상세정보", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 제품 편집
router.put('/:product_id/edit', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {
        const { product_id } = req.params;
        const {products} = req.body;

        //기존 제품과 연관 옵션 및 사진을 찾음
        let product = await Product.findOne({where: {id : product_id},
            include: [
                { model: ProductOpt }, 
                { model: ProductThumb }
            ]});
            if(product){
                await asyncForEach(product.ProductOpts, async(productOpt)=>{ //기존 연관 데이터를 삭제
                    productOpt.destroy()
                });
                await asyncForEach(product.ProductThumbs, async(productThumb)=>{
                    productThumb.destroy()
                });
                // 입력값 체크
                if (!products.name || !products.category || !products.ProductOpts || !products.ProductThumbs) { 
                    response(res, 400, "값을 제대로 입력해 주세요."); 
                    return; 
                }
        
                // 제품 업데이트
                product.update({ name: products.name, category: products.category, quantity: products.quantity });
                
                // ProductOpt 생성
                if (products.ProductOpts) {
                    await asyncForEach(products.ProductOpts, async (opt)=>{
                        let productOpt = await ProductOpt.create({ name: opt.name, price: opt.price })
                        if(productOpt){
                            await product.addProductOpts(productOpt)
                        }
                        else{
                            response(res, 400, "에러: 제품 옵션 생성 실패");
                        }
                    })
                }
                
                // ProductThumb 생성
                if (products.ProductThumbs) {
                    await asyncForEach(products.ProductThumbs, async (thumb)=>{
                        let productThumb = await ProductThumb.create({ url: thumb.url })
                        if(productThumb){ await product.addProductThumb(productThumb); }
                        else{
                            response(res, 400, "에러: 제품 썸네일 생성 실패");
                        }
                    })
                }
                
                // 제품(옵션, 썸네일 포함) 가져오기
                product = await Product.findOne({
                    where: { id: product.id },
                    include: [
                        { model: ProductOpt }, 
                        { model: ProductThumb }
                    ] 
                });
                let payLoad = { products: product };
                response(res, 201, "제품이 수정되었습니다.", payLoad);
            }
            else{
                response(res, 404, "제품 없음");
            }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 제품 삭제
router.delete('/:product_id/delete', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next) => {
    try {
        const { product_id } = req.params;
        let product = await Product.findOne({where: {id : product_id},
            include: [
                { model: ProductOpt }, 
                { model: ProductThumb }
            ]});
            if(product){
                product.destroy();
                response(res, 201, "제품이 삭제되었습니다.");
            }
            else{
                response(res, 404, "제품 없음");
            }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});





module.exports = router;