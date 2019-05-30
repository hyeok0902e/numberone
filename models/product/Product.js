module.exports = (sequelize, DataTypes) => (
    sequelize.define('Product', {
        name: { // 이름
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        category: { // 카테고리
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        soldout: { // 품절 여부
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        quantity: { // 수량
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