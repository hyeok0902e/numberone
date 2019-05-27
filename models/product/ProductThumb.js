module.exports = (sequelize, DataTypes) => (
    sequelize.define('ProductThumb', {
        url: { // 이미지 url
            type: DataTypes.STRING(2083),
            allowNull: false
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);