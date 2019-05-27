module.exports = (sequelize, DataTypes) => (
    sequelize.define('EstimateOfBucket', {
        customer_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        name: { // 성함
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        address: { // 주소
            type: DataTypes.STRING(512),
            allowNull: false,
        },
        tel: { // 연락처
            type: DataTypes.STRING(45),
            allowNull: false
        },
        email: { // 이메일
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);