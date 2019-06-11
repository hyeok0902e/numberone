module.exports = (sequelize, DataTypes) => (
    sequelize.define('Load', {
        type: { // 부하종류: 0: 뱅크, 1: 그룹, 2: 전동기 부하, 3: 일반부하(분전반) 합계, 4. 일반부하(분전반)
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        name: { // 부하명
            type: DataTypes.STRING(45),
            allowNull: false,            
        },
        output: { // 출력 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        hPower: { // 마력 (HP)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        pisangValA: { // 피상분a (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        pole: { // 극수 (P)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sangSang: { // 상구분 - 상
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        sangDiv: { // 상구분 - 선
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        volt: { // 전압 (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        powerLate: { // 역률 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        impowerLate: { // 개선역률 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        efficiency: { // 효율 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        demandLate: { // 수용률 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        taskWay: { // 기동방식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        using: { // 상용/예비
            type: DataTypes.TINYINT(1),
            allowNull: true,
            defaultValue: 1,
        },
        ampeA: { // 전류a` (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        ampeRealA: { // 전류a (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        ampeB: { // 전류b` (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        ampeRealB: { // 전류b (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        pisangValB: { // 피상분b (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        convertLate: { // 계약전력 시 필요 - 환샨율 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        convertVal: { // 계약전력 시 필요 - 환산값 (kW)
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
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);