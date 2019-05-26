const express = require('express');
const { BillProject, Load } = require('../../models');

const router = express.Router();

// test 
router.post('/create', async (req, res, next) => {
    try {
        // const { name, type } = req.body
        // const load = await Load.create({ name, type });

        const { bank_id } = req.body
        // const bank = await Load.findOne({ where: { id: 1 }});
        // const group = await Load.findOne({ where: { id: group_id }})
        const bank = await Load.findOne({ where: { id: bank_id }, include: ['Group']});
        // await bank.addGroup(group);

        const group = bank.Group

        res.status(201).json({
            resultCode: 201,
            resultMessage: {
                title: "작성됨",
                message: "성공적으로 요청되었으며 서버가 새 리소스를 작성했습니다."
            },
            payLoad: {
                group
            },  
        });
          
    } catch (err) {
        console.log(err);
        res.status(400).json({
            resultCode: 400,
            resultMessage: {
                title: "잘못된 요청",
                message: "서버가 요청의 구문을 인식하지 못했습니다."
            },
            payLoad: {},
        });
    }
});

module.exports = router;