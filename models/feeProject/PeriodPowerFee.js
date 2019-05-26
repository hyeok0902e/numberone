module.exports = (sequelize, DataTypes) => (
    sequelize.define('PeriodReceptFee', { // 정기검사 수수료 - 발전설비
        checkType: { // 검사유형 / 0: 최초검사, 1: 불합격재검사
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        equipType: { // 설비구분 / 0: 내연력 발전, 1: 태양광/풍차
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        voltType: { // 수전전압 유향 / 0: 저압, 1: 고압
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        generateKw: { // 발전용량 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        basicCost: { // 기본 요금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        kwCost: { // Kw당 요금 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sum: { // 소계
            type: DataTypes.INTEGER(11),
            allowNull: true,
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