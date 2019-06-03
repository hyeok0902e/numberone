module.exports = (sequelize, DataTypes) => (
    sequelize.define('ProcessDetailElement', {
        name: { // 품명
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        standard: { // 규격
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        unit: { // 단위
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        num: { // 수량
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        materialCost: { // 재료비 단가
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        tMaterialCost: { // 재료비 합계
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        laborCost: { // 노무비 단가
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        tLaborCost: { // 노무비 합계
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        operateCost: { // 경비 단가
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        tOperateCost: { // 경비 합계
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        tUnitCost: { // 총 단가
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        totalCost: { // 총 비용 합계
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