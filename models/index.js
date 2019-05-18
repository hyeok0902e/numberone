const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user/user')(sequelize, Sequelize);
db.Attendance = require('./user/attendance')(sequelize, Sequelize);
db.UserPick = require('./user/userpick')(sequelize, Sequelize);
db.Load = require('./billProject/load')(sequelize, Sequelize);

// User Table
db.Attendance.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Attendance, { foreignKey: 'user_id', sourceKey: 'id' });
db.UserPick.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.UserPick, { foreignKey: 'user_id', sourceKey: 'id' });

// Load Table


module.exports = db;