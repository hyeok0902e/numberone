module.exports = (sequelize, DataTypes) => (
    sequelize.define('PE_Low', {
        loadSimplyCE: { // 부하 계약전력 합계 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        volt: { // 전압 (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        meterCapa: { // 계량기 - 용량 (A)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        meterCTCapa: { // 계량기 - CT용량 (A)
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        meterCase: { // 계량기함
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        firstAmpe: { // 1차 전류 (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        firstCT125: { // 1차 CT - 1.25배
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        firstCT15: { // 1차 CT - 1.5배
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        secBreakerCal: { // 2차 차단기 - 계산
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        }, 
        secBreakerAT: { // 2차 차단기 - AT (AT)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true, 
        }
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);