const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const passport = require('passport'); -> React Front 에서 세션 관리
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require("moment");
const AWS = require('aws-sdk');
const cors = require('cors'); // Cross Origin Resource Sharing
const bodyParser = require('body-parser');

require('dotenv').config();

// aws config
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region : 'ap-northeast-2'
});

// node-schedule
const schedule = require('node-schedule'); 
const rule = new schedule.RecurrenceRule(); 
rule.second = 3; //매 시간 30분 마다 수행 

const { sequelize } = require('./models');
// const passportConfig = require('./passport') ;


/********************** Router (Start) **********************/
const indexRouter = require('./routes');

// user
const attendanceRouter = require('./routes/user/attendance.js');
const authRouter = require('./routes/user/auth.js');
const myPageRouter = require('./routes/myPage/index.js');

// billProject
const billRouter = require('./routes/billProject/index.js');
const loadRouter = require('./routes/billProject/load.js');
const transformerRouter = require('./routes/billProject/transformer.js');
const ceRouter = require('./routes/billProject/ce.js');
const peRouter = require('./routes/billProject/pe.js');
const condenserRouter = require('./routes/billProject/condenser.js');
const breakerRouter = require('./routes/billProject/breaker.js');
const cableRouter = require('./routes/billProject/cable.js');
const wireCaseRouter = require('./routes/billProject/wireCase.js');
const trayRouter = require('./routes/billProject/tray.js');
const generatorRouter = require('./routes/billProject/generator.js');

//company 
const compRouter = require('./routes/company/index.js');
const testPaperRouter = require('./routes/company/testPaper.js');
const rayPaperRouter = require('./routes/company/rayPaper.js');
const powerPaperRouter = require('./routes/company/powerPaper.js');
const estimatePaperRouter = require('./routes/company/estimatePaper.js');
const openingPaperRouter = require('./routes/company/openingPaper.js');

// feeProject
const feeRouter = require('./routes/feeProject/index.js');
const kepcoFeeRouter = require('./routes/feeProject/kepcoFee.js');
const preUsageRouter = require('./routes/feeProject/preUsage.js');
const periodUsageRouter = require('./routes/feeProject/periodUsage.js');
const preChangeRouter = require('./routes/feeProject/preChange.js');
const safeManageRouter = require('./routes/feeProject/safeManage.js');

// statement
const statementRouter = require('./routes/statement/index.js');

// jobSearch
const hiringRouter = require('./routes/jobSearch/hiring.js');
const seekingRouter = require('./routes/jobSearch/seeking.js'); 

// product
const productRouter = require("./routes/product/index.js");

// organization
const organizationRouter = require("./routes/organization/index.js");

// material
const materialRouter = require("./routes/material/index.js");

// document
const documentRouter = require("./routes/document/index.js")

// marketPrice
const marketPriceRouter = require("./routes/marketPrice/index.js")

// admin
const manageUserRouter = require('./routes/admin/user.js')
const manageAnnouncementRouter = require('./routes/admin/announcement.js')
const manageDatabaseRouter = require('./routes/admin/database.js')
const manageOrganizationRouter = require('./routes/admin/organization.js')
const manageMaterialRouter = require('./routes/admin/material.js')
const manageDocumentRouter = require('./routes/admin/document.js')
const manageProductRouter = require('./routes/admin/product.js')
const manageJobSearchRouter = require('./routes/admin/jobSearch.js')
const manageMarketPriceRouter = require('./routes/admin/marketPrice.js')
const manageStatementRouter = require('./routes/admin/statement.js');

// myPage
const myPageAuthRouter = require('./routes/myPage/auth.js');
const myPageNoticeRouter = require('./routes/myPage/notice.js');
const myPageAttendanceRouter = require('./routes/myPage/attendance.js');
const myPageApplyPaidRouter = require('./routes/myPage/applyPaid.js');
const myPageJobSearchRouter = require('./routes/myPage/jobSearch.js');
const myPageHiringPartiRouter = require('./routes/myPage/hiringParti.js');
const myPageSeekingPartiRouter = require('./routes/myPage/seekingParti.js');
const myPageBucketRouter = require('./routes/myPage/bucket.js');

/*********************** Router (End) ***********************/


const app = express();

sequelize.sync();
// passportConfig(passport);

moment.tz.setDefault("Asia/Seoul"); // 시간대 설정


/********************* Udate UserAuht - Period (Start) *********************/
const { UserAuth, User } = require('./models');
schedule.scheduleJob('0 0 0 */1 * *', async () => {       
    const userAuths = await UserAuth.findAll();
    await userAuths.forEach(async (ua) => {
        if (ua.period > 0) {
            var period = ua.period - 1
            await ua.update({ period });
        } else {
            ua.billSimply = 0;
            ua.organization = 0;
            ua.material = 0;
            ua.document = 0;
            ua.product = 0;
            ua.jobSearch = 0;
            ua.marketPrice = 0;
            await User.update(
                {
                    level: 0,
                },
                { where: { id: ua.user_id } }
            );
        }
    }); 
    console.log('a')
});
/********************** Udate UserAuht - Period (End) **********************/


app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8002);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false, 
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    limit: '150mb',
    extended: false,
}));

app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

// Cross Origin Resource Sharing
app.use(cors());


/********************** Router URL (Start) **********************/
app.use('/', indexRouter);

// user
app.use('/auth', authRouter);
app.use('/attendance', attendanceRouter);

// billProject
app.use('/bill/', billRouter);
app.use('/bill/load', loadRouter);
app.use('/bill/transformer', transformerRouter);
app.use('/bill/ce', ceRouter);
app.use('/bill/pe', peRouter);
app.use('/bill/condenser', condenserRouter);
app.use('/bill/breaker', breakerRouter);
app.use('/bill/cable', cableRouter);
app.use('/bill/wireCase', wireCaseRouter);
app.use('/bill/tray', trayRouter);
app.use('/bill/generator', generatorRouter);

// company
app.use('/company', compRouter);
app.use('/company/testPaper', testPaperRouter);
app.use('/company/rayPaper', rayPaperRouter);
app.use('/company/powerPaper', powerPaperRouter);
app.use('/company/estimatePaper', estimatePaperRouter);
app.use('/company/openingPaper', openingPaperRouter);

// feeProject
app.use('/fee', feeRouter);
app.use('/fee/kepcoFee', kepcoFeeRouter);
app.use('/fee/preUsage', preUsageRouter);
app.use('/fee/periodUsage', periodUsageRouter);
app.use('/fee/preChange', preChangeRouter);
app.use('/fee/safeManage', safeManageRouter);

// statement
app.use('/statement', statementRouter);

// jobSearch
app.use('/hiring', hiringRouter);
app.use('/seeking', seekingRouter);

// Product
app.use('/product', productRouter);

// Organization 
app.use('/organization', organizationRouter);

// Material
app.use('/material', materialRouter);

// Document
app.use('/document', documentRouter);

// Market Price
app.use('/marketPrice', marketPriceRouter);

// Admin
app.use('/admin/user', manageUserRouter);
app.use('/admin/announcement', manageAnnouncementRouter);
app.use('/admin/database', manageDatabaseRouter);
app.use('/admin/organization', manageOrganizationRouter);
app.use('/admin/material', manageMaterialRouter);
app.use('/admin/document', manageDocumentRouter);
app.use('/admin/product', manageProductRouter);
app.use('/admin/jobSearch', manageJobSearchRouter);
app.use('/admin/marketPrice', manageMarketPriceRouter);
app.use('/admin/statement', manageStatementRouter);

// MyPqge
app.use('/myPage/auth', myPageAuthRouter);
app.use('/myPage/notice', myPageNoticeRouter);
app.use('/myPage/attendance', myPageAttendanceRouter);
app.use('/myPage/applyPaid', myPageApplyPaidRouter);
app.use('/myPage/jobSearch', myPageJobSearchRouter);
app.use('/myPage/hiringParti', myPageHiringPartiRouter);
app.use('/myPage/seekingParti', myPageSeekingPartiRouter);
app.use('/myPage/bucket', myPageBucketRouter);

/*********************** Router URL (End) ***********************/


app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});