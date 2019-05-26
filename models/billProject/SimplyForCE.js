module.exports = (sequelize, DataTypes) => (
    sequelize.define('SimplyForCE', {
        loadType: { // 부하형식
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        loadName: { // 부하명
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        output: { // 출력
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true
        },
        volt: { // 전압
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        using: { // 상용/예비
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 1,
        },
        convertLate: { // 환산율
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true
        },
        convertVal: { // 환산값
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true
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