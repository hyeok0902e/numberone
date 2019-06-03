module.exports = (sequelize, DataTypes) => (
    sequelize.define('Breaker', {
        voltType: { // 전압수전 타입 => 0: 고압수전, 1: 저압수전
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        loadKva: { // 변압기용량(출력) kVA
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        ampeB: { // 전류 b`
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        coef: { // 계수
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        permAmpe: { // 허용 전류 (lw)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        breakerAmpeNormal: { // 차단기 전류 일반
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        breakerAmpeMotor: { // 차단기 전류 전동
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        breakerPermAmpe: { // 허용 전류
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        breakerVal: { // 차단기 선정 값
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        userVal: { // 사용자 선정 값
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        result: { // 결과 => 0: 비정상, 1: 정상
            type: DataTypes.TINYINT(1),
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
        }
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);