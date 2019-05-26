module.exports = (sequelize, DataTypes) => (
    sequelize.define('Hiring', {
        type: { // 0: 구인 등록 글, 1: 구인 신청 글
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        company: { // 업체 명
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        address: { // 주소지 - 도 ~ 시/군/구 까지만
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        startDate: { // 시작일
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: { // 종료일
            type: DataTypes.DATE,
            allowNull: true,
        },
        description: { // 상세 내용
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isSelected: { // 선택 여부 파악
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
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