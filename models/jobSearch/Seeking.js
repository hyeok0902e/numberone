module.exports = (sequelize, DataTypes) => (
    sequelize.define('Seeking', {
        type: { // 0: 구직 등록 글, 1: 구직 신청 글
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
        car: { // 보유 차량
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        career: { // 경력(년)
            type: DataTypes.INTEGER(3),
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