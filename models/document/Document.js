module.exports = (sequelize, DataTypes) => (
    sequelize.define('Document', {
        num: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        fileName: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        fileURL: {
            type: DataTypes.STRING(2083),
            allowNull: false,
        },
        mainCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        middleCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        subCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);