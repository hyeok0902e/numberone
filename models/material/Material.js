module.exports = (sequelize, DataTypes) => (
    sequelize.define('Material', {
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        standard: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        unit: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        organizePrice: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        organizePage: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        dealPrice: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        dealPage: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sellPrice: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sellPage: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        marketPrice: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        marketPage: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        searchPrice: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        searchPage: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        minPrice: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        company: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        url: {
            type: DataTypes.STRING(2083),
            allowNull: true,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: { // 업데이트 시간
            type: DataTypes.DATE,
            allowNull: true, 
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);