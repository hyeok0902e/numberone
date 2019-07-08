require('dotenv').config();

module.exports ={
    development: {
        username: 'root',
        password: process.env.RDS_MYSQL_PASSWORD,
        database: 'numberone-develop',
        host: 'numberone.cdov2stfzse5.ap-northeast-2.rds.amazonaws.com',
        dialect: 'mysql',
        operatorsAliases: false
    },
    production: {
        username: 'root',
        password: process.env.RDS_MYSQL_PASSWORD,
        database: 'numberone-product',
        host: 'numberone.cdov2stfzse5.ap-northeast-2.rds.amazonaws.com',
        dialect: 'mysql',
        operatorsAliases: false,
        logging: false
    }
}