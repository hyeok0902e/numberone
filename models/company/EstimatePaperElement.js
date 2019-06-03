module.exports = (sequelize, DataTypes) => (
    sequelize.define('EstimatePaperElement', {
        name: { // 품명
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        standard: { // 규격
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        quantity: { // 수량
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        unitCost: { // 단가
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sumCost: { // 금액
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