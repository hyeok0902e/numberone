module.exports = (sequelize, DataTypes) => (
    sequelize.define('PreChange', { // 사용전 변경 검사 수수료
        sum: { // 합계
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        vat: { // 부가세
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        totalCost: { // 총 비용 (수수료)
            type: DataTypes.BIGINT,
            allowNull: true, 
        },
        offCheck: { // 야간, 공휴일, 토요일 검사 여부
            type: DataTypes.TINYINT(1),
            allowNull: true,
        },
        reCheck: { // 재검사 기간 내 재검 여부
            type: DataTypes.TINYINT(1),
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