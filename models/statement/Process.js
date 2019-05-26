module.exports = (sequelize, DataTypes) => (
    sequelize.define('Process', {
        name: { // 공종 명
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        materialCost: { // 재료비 합계
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        laborCost: { // 노무비 합계
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        operateCost: { // 경비 합계
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
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