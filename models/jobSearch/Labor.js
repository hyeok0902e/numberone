module.exports = (sequelize, DataTypes) => (
    sequelize.define('Labor', {
        major: { // 업무
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        people: { // 인원수 
            type: DataTypes.INTEGER(11),
            allowNull: false,
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