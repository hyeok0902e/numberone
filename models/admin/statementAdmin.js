module.exports = (sequelize, DataTypes) => (
    sequelize.define('StatementAdmin', {
        name: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        standard: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        unit: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        materialCost: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        laborCost: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        operateCost: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sum: {
            type: DataTypes.INTEGER(11),
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