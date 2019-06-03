module.exports = (sequelize, DataTypes) => (
    sequelize.define('RayPaper', {
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
        target: { // 측정대상
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        volt: { // 사용전압
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        condition: { // 측정조건 (c)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        note: { // 판정기준 - 비고
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        point1: { // 포인트 온도1 (c)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        point2: { // 포인트 온도2 (c)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        point3: { // 포인트 온도3 (c)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        tempGap: { // 온도차 (c)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        trueImg: { // 실화상 이미지
            type: DataTypes.STRING(2083),
            allowNull: true,
        },
        trueComment: { // 실화상 이미지 설명
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fireImg: { // 열화상 이미지
            type: DataTypes.STRING(2083),
            allowNull: true,
        },
        fireComment: { // 열화상 이미지 설명
            type: DataTypes.TEXT,
            allowNull: true,
        }, 
        opinion: { // 종합 의견
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