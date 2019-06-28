module.exports = (sequelize, DataTypes) => (
    sequelize.define('SafeManage', { // 안전관리대행 수수료
        businessType: { // 선입분류 / 0: 대행사업자, 1: 개인사업자
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        voltType: { // 전압유형 / 0: 저압, 1: 고압
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        passiveKw: { // 수전용량 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        generateKw: { // 발전용량 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sunKw: { // 신재생(태양광) 용량 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sum: { // 합계
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        fee: { // 수수료
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        weight: { // 가중치
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        checking: { // 점검횟수
            type: DataTypes.INTEGER(11),
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