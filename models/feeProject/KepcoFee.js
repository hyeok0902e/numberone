module.exports = (sequelize, DataTypes) => (
    sequelize.define('KepcoFee', {
        supplyType: { // 공급방식 / 0: 가공공급, 1: 지중공급
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        division: { // 구분 / 0: 신설, 1: 증설
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        voltType: { // 전압 / 0: 저압단상, 1: 저압 3상, 2: 특고압
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        contractKw: { // 계약전력 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        newDistance: { // 신설거리 (m)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        addDistance: { // 첨가거리 (m)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        basicCost: { // 기본시설부담금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        distanceCost: { // 거리시설부담금
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sum: { // 합계 비용
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        vat: { // 부가세
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        totalCost: { // 총 비용
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