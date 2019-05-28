const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const passport = require('passport'); -> React Front 에서 세션 관리
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require("moment");
require('dotenv').config();

// Cross Origin Resource Sharing
const cors = require('cors');

const corsOptions = {
    origin: true,
    credentials: true
};

const { sequelize } = require('./models');
// const passportConfig = require('./passport') ;

/********************** Router (Start) **********************/
const indexRouter = require('./routes');

// user
const attendanceRouter = require('./routes/user/attendance.js');
const authRouter = require('./routes/user/auth.js');

// billProject
const billRouter = require('./routes/billProject/index.js');

// Load
const bankRouter = require('./routes/billProject/bank.js');
const groupRouter = require('./routes/billProject/group.js');
const motorLoadRouter = require('./routes/billProject/motorLoad.js');
const normalLoadRouter = require('./routes/billProject/normalLoad.js');
/*********************** Router (End) ***********************/

const app = express();

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

sequelize.sync();
// passportConfig(passport);
moment.tz.setDefault("Asia/Seoul"); // 시간대 설정

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

app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

/********************** Router URL (Start) **********************/
app.use('/', indexRouter);

// user
app.use('/auth', authRouter);
app.use('/attendance', attendanceRouter);

// billProject
app.use('/bill/', billRouter);
app.use('/bill/motorLoad', motorLoadRouter); // 수정필요

// Load
app.use('/bill/bank', bankRouter);
app.use('/bill/group', groupRouter)
app.use('/bill/normalLoad', normalLoadRouter);
app.use('/bill/motorLoad', motorLoadRouter);
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