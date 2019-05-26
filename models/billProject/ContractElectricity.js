module.exports = (sequelize, DataTypes) => (
    sequelize.define('ContractElectricity', {
        div: { // 구분
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        convertLate: { // 환산율 (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        convertVal: { // 계약집계 환산값 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        calculateVal: { // 계산값 (kW)
            type: DataTypes.DOUBLE(11, 2),
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