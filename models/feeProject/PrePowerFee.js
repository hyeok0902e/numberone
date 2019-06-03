module.exports = (sequelize, DataTypes) => (
    sequelize.define('PrePowerFee', { // 사용전 검사 수수료 - 발전설비
        checkType: { // 검사유형
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        equipType: { // 설비구분
            type: DataTypes.INTEGER(2),
            allowNull: true,
        }, 
        voltType: { // 전압선택
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        generateKw: { // 발전용량
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        basicCost: { // 기본 요금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        kwCost: { // Kw 당 요금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sum: { // 총 비용 (소계)
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