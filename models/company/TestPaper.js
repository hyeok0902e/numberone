module.exports = (sequelize, DataTypes) => (
    sequelize.define('TestPaper', {
        compName: { // 상호명
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        checkDate: { // 점검일자
            type: DataTypes.DATE,
            allowNull: false,
        },
        passiveVolt: { // 수전전압 (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        generateVolt: { // 발전전압 (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        generateKw: { // 발전용량 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sunKw: { // 태양광 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        contractKw: { // 계약용량 (Kw)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        checkType: { // 점검종별
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        checking: { // 검사횟수
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        // 점검내역 - 특고압 설비 15종 / 0: 없음, 1: 불합, 2: 합격
        hProcess: { 
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hUnder: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hSwitch: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hWire: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hLight: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hPoten: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hFuse: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hTrans: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hWant: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hReplay: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hStop: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hCondenser: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hProtect: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hLoad: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        hFold: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        // 점검내역 - 저압 설비 15종 / 0: 없음, 1: 불합, 2: 합격
        lEntrance: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lPaner: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lWireStop: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lCircuitStop: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lSwitch: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lWire: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lMotor: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lHeater: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lWeld: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lCondenser: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lLight: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lFold: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lRace: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lEtc: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        lGenerate: {
            type: DataTypes.INTEGER(2),
            allowNull: true,
        },
        // 점검결과 판정 - 3개 구분(각 9개씩)
        a1Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        a1Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        a1Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b1Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b1Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b1Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c1Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c1Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c1Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n1Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n1Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n1Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },  
        a2Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        a2Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        a2Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b2Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b2Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b2Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c2Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c2Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c2Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n2Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n2Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n2Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        a3Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        a3Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        a3Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b3Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b3Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        b3Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c3Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c3Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        c3Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n3Volt: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n3Ampe: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        n3Temp: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        opinion: { // 메모
            type: DataTypes.TEXT,
            allowNull: true,
        },
        checkerSign: { // 점검확인자 사인
            type: DataTypes.STRING(2083),
            allowNull: true,
        },
        managerSign: { // 안전관리자 사인
            type: DataTypes.STRING(2083),
            allowNull: true,
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