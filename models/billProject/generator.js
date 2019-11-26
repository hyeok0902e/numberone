module.exports = (sequelize, DataTypes) => (
    sequelize.define('Generator', {
        powerLate: { // 발전기 역률 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        jeongSu: { // 발전기 정수 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        overload: { // 과부하 내량
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        taskWay: { // 기동방식 
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        taskKva: { // 기동 Kva (B)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        taskCoef: { // 기동계수 (C)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        taskPowerLate: { // 기동역률 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        voltDrop: { // 전압강하 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        excessLate: { // 여유율 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        firstVal: { // 1안(부하집계) (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        secVal: { // 2안(전압강하) (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },  
        thirdVal: { // 3안(최대부하) (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        userKwVal: { // 관리자DB/사용자입력 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        userKvaVal: { // 관리자DB/사용자입력 (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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