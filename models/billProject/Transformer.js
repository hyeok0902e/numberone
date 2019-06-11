module.exports = (sequelize, DataTypes) => (
    sequelize.define('Transformer', {
        volt: { // 변압기 전압
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        output: { // 변압기 용량(기준 변압기)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        impedance: { // 임피던스
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        taskWay: { // 기동방식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        taskKva: { // 기동 Kva
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        taskCoef: { // 기동계수
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        impowerLate: { // 개선역률
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        taskPowerLate: { // 기동역률
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        voltDrop: { // 전압강하
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        excessLate: { // 여유율
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        secP1: { // 2안 변압기용량 계산 - P1(kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        secQ1: { // 2안 변압기용량 계산 - Q1(kVar)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        secP2: { // 2안 변압기용량 계산 - P2(kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        secQ2: { // 2안 변압기용량 계산 - Q2(kVar)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        secPs: { // 2안 변압기용량 계산 - Ps(kVA)
            type: DataTypes.DOUBLE(11, 2),
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
        userVal: { // DB용량 or 사용자 입력 => 변압기 용량: 수전설비 계산시 사용
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        voltDropVal: { // 전압강하 (%)
            type: DataTypes.DOUBLE(11, 3),
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