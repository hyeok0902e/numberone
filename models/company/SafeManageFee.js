module.exports = (sequelize, DataTypes) => (
    sequelize.define('SafeManageFee', {
        businessType: { // 사업자 유형 / 0: 대행사업자, 1: 개인사업자
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        voltType: { // 전압수전 타입 / 0: 저압, 1: 고압
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        passiveKw: { // 수전 용량
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        generateKw: { // 발전 용량
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        sunKw: { // 신재생(태양광) 용량
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        sum: { // 합계
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        fee: { // 수수료
            type: DataTypes.INTEGER(11),
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