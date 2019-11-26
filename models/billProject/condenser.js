module.exports = (sequelize, DataTypes) => (
    sequelize.define('Condenser', {
        voltType: { // 전압수전 타입 => 0: 고압수전, 1: 저압수전
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        pisangVal: { // 피상분(출력) 값 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        volt: { // 전압 (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        powerLate: { // 역률 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        impowerLate: { // 개선역률 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        condenserCal: { // 콘덴서 계산 (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        condenserVal: { // 콘덴서 선정값 (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        userVal: { // 사용자 선정값 (kVA)
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