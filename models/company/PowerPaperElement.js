module.exports = (sequelize, DataTypes) => (
    sequelize.define('PowerPaperElement', {
        section: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        maxKw: { // 최대 전력 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        powerLate: { // 역률 (%)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        vVolt1: { // (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        vThd1: { // (%)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        vVolt2: { // (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        vThd2: { // (%)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        }, 
        vVolt3: { // (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        vThd3: { // (%)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        aAmpe1: { // (A)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        aAmpe2: { // (A)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        aAmpe3: { // (A)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        aUnbalance: { // (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        aThd1: { // (%)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        aThd2: { // (%)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        aThd3: { // (%)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        result: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
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