module.exports = (sequelize, DataTypes) => (
    sequelize.define('PreWireFee', { // 사용전 검사 수수료 - 전선로
        division: { // 검사 부문 / 0: 전주, 1: 철탑, 2: 지중선
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        num: { // 대수
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        addCost: { // 추가요금 (소계)
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