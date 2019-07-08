module.exports = (sequelize, DataTypes) => (
    sequelize.define('ProductEstimate', {
        name: { // 성함
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        address: { // 주소
            type: DataTypes.STRING(512),
            allowNull: false,
        },
        mobile: { // 연락처
            type: DataTypes.STRING(45),
            allowNull: false
        },
        email: { // 이메일
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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