module.exports = (sequelize, DataTypes) => (
    sequelize.define('PreChangeFee', { // 사용전 변경 검사 수수료 - 개발
        division: { // 검사부문 / 0: 차단기, 1: 변압기, 2: 전주, 3: 철주, 4: 철탑, 5: 지중선
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        num: { // 대수
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        basicCost: { // 기본요금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        addCost: { // 추가요금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sum: { // 소계
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
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);