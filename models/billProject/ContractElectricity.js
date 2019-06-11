module.exports = (sequelize, DataTypes) => (
    sequelize.define('ContractElectricity', {
        div: { // 구분
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        convertLate: { // 환산율 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        convertVal: { // 계약집계 환산값 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        calculateVal: { // 계산값 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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