module.exports = (sequelize, DataTypes) => (
    sequelize.define('Company', {
        name:{
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        key: { // 회사 고유 번호
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        tel: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        fax: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        memo: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);