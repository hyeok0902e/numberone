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
        },
        taskCoef: { // 기동계수
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        impowerLate: { // 개선역률
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        taskPowerLate: { // 기동역률
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        voltDrop: { // 전압강하
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        excessLate: { // 여유율
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secP1: { // 2안 변압기용량 계산 - P1(kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secQ1: { // 2안 변압기용량 계산 - Q1(kVar)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secP2: { // 2안 변압기용량 계산 - P2(kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secQ2: { // 2안 변압기용량 계산 - Q2(kVar)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        secPs: { // 2안 변압기용량 계산 - Ps(kVA)
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
        userVal: { // DB용량 or 사용자 입력
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        voltDropVal: { // 전압강하 (%)
            type: DataTypes.DOUBLE(11, 2),
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