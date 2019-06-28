module.exports = (sequelize, DataTypes) => (
    sequelize.define('BucketProductOpt', {
        name: { // 이름
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: { // 가격
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        num: { // 수량
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        totalPrice: { // 총 가격
            type: DataTypes.BIGINT,
            allowNull: true,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);