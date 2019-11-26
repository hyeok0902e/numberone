module.exports = (sequelize, DataTypes) => (
    sequelize.define('ProductOpt', {
        name: { // 이름
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: { // 가격
            type: DataTypes.BIGINT,
            allowNull: false,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);