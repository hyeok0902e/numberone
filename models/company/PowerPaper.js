module.exports = (sequelize, DataTypes) => (
    sequelize.define('PowerPaper', {
        compName: { // 설비명(상호명)
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        checkDate: { // 점검일자
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        manager: { // 안전관리자
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        opinion: { // 종합의견
            type: DataTypes.TEXT,
            allowNull: true,
        },
        userCompName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        userCompTel: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        userCompFax: {
            type: DataTypes.STRING(45),
            allowNull: true,
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