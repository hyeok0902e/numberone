module.exports = (sequelize, DataTypes) => (
    sequelize.define('MarketPrice', {
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        company: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        period: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);