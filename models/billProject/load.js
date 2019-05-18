module.exports = (sequelize, DataTypes) => (
    sequelize.define('Load', {
        type: { // 부하종류: 0: 뱅크, 1: 그룹, 2: 전동기 부하, 3: 일반부하(분전반) 합계, 4. 일반부하(분전반)
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        name: { // 부하이름
            type: DataTypes.STRING(45),
            allowNull: false,            
        },
        output: { // 출력
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        hPower: { // 마력
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        pisnagValA: { // 피상분a
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        pole: { // 극수
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sangSang: { // 상구분 - 상
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        sangDiv: { // 상구분 - 선
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        volt: { // 전압
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        powerLate: { // 역률
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        impowerLate: { // 개선역률
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        efficiency: { // 효율
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        demandLate: { // 수용률
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        taskWay: { // 기동방식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        using: { // 상용/예비
            type: DataTypes.TINYINT(1),
            allowNull: true,
        },
        ampeA: { // 전류a`
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        ampeRealA: { // 전류a
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        ampeB: { // 전류b`
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        ampeRealB: { // 전류b
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
        },
        pisangValB: { // 피상분b
            type: DataTypes.DOUBLE(11,2),
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