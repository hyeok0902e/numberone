module.exports = (sequelize, DataTypes) => (
    sequelize.define('BankPE_High', {
        output: { // 설비용량 (kVA)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        volt: { // 전압 (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        pfTrans: { // PF - 한류형
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        pfNonTrans: { // PF - 비한류형
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        secAmpe: { // 2차 전류 (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secCT125: { // 2차 CT - 1.25배
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secCT15: { // 2차 CT - 1.5 배 
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secBreakerCal: { // 2차 차단기 - 계산
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secBreakerAT: { // 2차 차단기 - AT (AT)
            type: DataTypes.STRING(45),
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