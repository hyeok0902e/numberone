module.exports = (sequelize, DataTypes) => (
    sequelize.define('BucketProduct', {
        name: { // 제품명
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        category: { // 카테고리
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        product_id: { // 제품 id
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);