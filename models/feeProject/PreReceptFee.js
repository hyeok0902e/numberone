module.exports = (sequelize, DataTypes) => (
    sequelize.define('PreReceptFee', { // 사용전 검사 수수료 - 수전설비
        checkType: { // 검사유형
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        voltType: { // 전압선택
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        passiveKw: { // 수전 용량
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        supplyKw: { // 구내 배전
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        basicCost: { // 기본 요금
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        kwCost: { // kw 당 요금
            type: DataTypes.BIGINT,
            allowNull: true,   
        },
        supplyCost: { // 구내 배전료
            type: DataTypes.BIGINT,
            allowNull: true,    
        },
        sum: { // 총 비용 (소계)
            type: DataTypes.BIGINT,
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