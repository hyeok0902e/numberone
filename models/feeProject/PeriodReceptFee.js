module.exports = (sequelize, DataTypes) => (
    sequelize.define('PeriodReceptFee', { // 정기검사 수수료 - 수전설비
        checkType: { // 검사유형 / 0: 최초검사, 1: 불합격재검사
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        voltType: { // 수전전압 유향 / 0: 저압, 1: 고압
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        passiveKw: { // 수전 용량
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        reCheck: { // 휴지, 폐지 후 재사용 여부
            type: DataTypes.TINYINT(1),
            allowNull: true,
        },
        basicCost: { // 기본 요금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        kwCost: { // Kw 당 요금
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