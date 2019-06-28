module.exports = (sequelize, DataTypes) => (
    sequelize.define('MarketPriceOpt', {
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
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