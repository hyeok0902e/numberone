module.exports = (sequelize, DataTypes) => (
    sequelize.define('Cable', {
        voltType: { // 전압수전 타입 => 0: 고압수전, 1: 저압수전
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        insulationWay: { // 절연방식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        coef: { // 계수
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        permAmpe: { // 허용전류 (lw)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        distance: { // 거리 (m)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        workType: { // 공사방법
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        temp: { // 온도감소 - 온도 (℃)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        tempVal: { // 온도감소 - 값
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        multiCircuit: { // 복수회로 - 회로
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        multiCircuitVal: { // 복수회로 - 값
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        lastVal: { // 최종 적용값 (lw)
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        cableThick: { // 케이블 - 굵기 (㎟)
            type: DataTypes.STRING(45),
            allowNull: true,
            defaultValue: 0,
        },
        cablePermAmpe: { // 케이블 - 허용전류 (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        cableVolt: { // 케이블 - 전압강하 V (V)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        cableVoltPer: { // 케이블 - 전압강하 % (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        userThick: { // 사용자 선정 - 굵기 (㎟)
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        cableThickL: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        cableRef: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        lastValRef: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        userVolt: { // 사용자 선정 - 전압강하 V (V)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        userVoltPer: {  // 사용자 선정 - 전압강하 % (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        groundWire: { // 접지선 (㎟)
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