module.exports = (sequelize, DataTypes) => (
    sequelize.define('Statement', {
        name: { // 프로젝트 명
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        dataFrom: { // 자료 선택 (출처)
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        tMaterialCost: { // 재료비 합
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        dMaterialCost: { // 직접 재료비
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        idMaterialCost: { // 간접 재료비
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        tLaborCost: { // 노무비 합
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        dLaborCost: { // 직접 노무비
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        idLaborCost: { // 간접 노무비
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        tOperateCost: { // 경비 합
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        machinCost: { // 기계경비
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        installCost: { // 가설비
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        eIndustry: { // 산재보험
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        eEmploy: { // 고용보험
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        eHealth: { // 건강보험
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        ePension: { // 연금보험
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        eElderly: { // 노인요양
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        eRetire: { // 퇴직공제
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        materialTest: { // 재료시험
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        industrySafe: { // 산업안전
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        basicA: { // 기초액A
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        basicB: { // 기초액B
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        envProtect: { // 환경보전
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        etcOperateCost: { // 기타경비
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        doWork: { // 공사이행
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        constPerform: { // 하도급지급
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        personal: { // 사급
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        etc: { // 기타
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        sum: { // 소계
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        vat: { // 부가세
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        contractCost: { // 도급액
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        public1: { // 관급1
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        public2: { // 관급2
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        kepcoCost: { // 수탁비1 - 한전납입금공사합계
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        commuCost: { // 수탁비2 - 통신납입금공사 합계
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        lastCost: { // 총계
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
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