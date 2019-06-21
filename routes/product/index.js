const express = require('express');

// 모델 import
const { User, UserAuth, Product, ProductOpt, ProductThumb, BucketProduct, BucketProductOpt } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { productSeeAuth, verifyProductSeeAuth } = require('../middlewares/userAuth');
const { exUser, verifyToken, verifyUid, asyncForEach, verifyDuplicateLogin, verifyProductSee } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();

// 장터 목록 가져오기
router.get('/', verifyToken, verifyDuplicateLogin, verifyProductSeeAuth, async (req, res, next) => {
    try {   
        // 제품 목록(옵션, 사진 포함) 가져오기
        const products = await Product.findAll({ 
            include: [
                { model: ProductOpt }, 
                { model: ProductThumb }
            ] 
        });
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

// 제품 상세보기
router.get('/:product_id/show', verifyToken, verifyDuplicateLogin, verifyProductSeeAuth, async (req, res, next) => {
    try {
        const { product_id } = req.params;

        if (!product_id) { response(res, 400, "params값 없음"); return; }

        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        const product = await Product.findOne({ where: { id: product_id, user_id: user.id } });
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

router.post('/toBucket' ,verifyToken, verifyDuplicateLogin, verifyProductSeeAuth, async (req, res, next) => {
    try {
        const {bucketProducts}= req.body;

        // 입력값 체크
        if (!bucketProducts.product_id ) { 
            response(res, 400, "존재하지 않는 제품입니다."); 
            return; 
        }

        let product = await Product.findOne({where: {id: bucketProducts.product_id}});

        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 유저 버켓에 들어가는 제품 생성
        let bucketProduct = await BucketProduct.create({ name: product.name, category: product.category, product_id: product.id });
        await user.addBucketProduct(bucketProduct);
        
        // BucketProductOpt 생성
        if (bucketProducts.BucketProductOpts) {
            await asyncForEach(bucketProducts.BucketProductOpts, async (opt)=>{
                let bucketProductOpt = await BucketProductOpt.create({ name: opt.name, price: opt.price, num: opt.num, totalPrice: opt.price * opt.num })
                if(bucketProduct){
                    await bucketProduct.addBucketProductOpt(bucketProductOpt)
                    response(res, 201, "장바구니 담기 성공");
                }
                else{
                    response(res, 400, "에러: 제품 옵션 생성 실패");
                }
            })
        }
        else{
            response(res, 400, "에러: 제품 옵션 생성 실패");
        }


    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});












// 제품 사진 등록
router.post('/imgUpload', verifyToken, uploadImg.single('image'), (req, res) => {
    try {
        console.log("req.file: ", req.file); 

        let payLoad = { profileUrl: req.file.location };
        response(res, 201, "제품 사진 등록 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});
// 제품 등록
router.post('/create', verifyToken, verifyDuplicateLogin, verifyProductSeeAuth, async (req, res, next) => {
    try {
        const {products}= req.body;

        // 입력값 체크
        if (!products.name || !products.category || !products.ProductOpts || !products.ProductThumbs) { 
            response(res, 400, "값을 제대로 입력해 주세요."); 
            return; 
        }
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 제품 생성
        let product = await Product.create({ name: products.name, category: products.category, quantity: products.quantity });
        await user.addProduct(product);
        
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



// 제품 편집 페이지 이동
router.get('/:product_id/edit', verifyToken, verifyDuplicateLogin, verifyProductSeeAuth, async (req, res, next) => {
    try {
        const user_id = req.decoded.user_id;
        const { product_id } = req.params;

        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!product_id) { response(res, 400, "params값 없음"); return; }
  
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }
        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        const product = await Product.findOne({ where: { id: product_id, user_id: user.id } });
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
router.put('/:product_id/edit', verifyToken, verifyDuplicateLogin, verifyProductSeeAuth, async (req, res, next) => {
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
router.delete('/:product_id/delete', verifyToken, verifyDuplicateLogin, verifyProductSeeAuth, async (req, res, next) => {
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