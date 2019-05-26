module.exports = (sequelize, DataTypes) => (
    sequelize.define('Generator', {
        powerLate: { // 발전기 역률 (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        jeongSu: { // 발전기 정수 (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        overload: { // 과부하 내량
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        taskWay: { // 기동방식 
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        taskKva: { // 기동 Kva (B)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        taskCoef: { // 기동계수 (C)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        taskPowerLate: { // 기동역률 (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        voltDrop: { // 전압강하 (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        excessLate: { // 여유율 (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        firstVal: { // 1안(부하집계) (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secVal: { // 2안(전압강하) (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },  
        thirdVal: { // 3안(최대부하) (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        userKwVal: { // 관리자DB/사용자입력 (kW)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        userKvaVal: { // 관리자DB/사용자입력 (kVA)
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
        }
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);