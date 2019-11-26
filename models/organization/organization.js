module.exports = (sequelize, DataTypes) => (
    sequelize.define('Organization', {
        name: { // 사업소 이름
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        region: { // 지역
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        zipcord: { // 우편번호
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        address: { // 주소
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        branch: { // 지역별 지사
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        jurisdiction: { // 관할지역
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        serviceCenter: { // 번호1 - 고객센터
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        applyTel: { // 번호2 - 전기신청
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        costTel: { // 번호3 - 요금상담
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        fax: { // 번호4 - 팩스번호
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        supplyTel: { // 번호5 - 전력공급
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        checkTel: { // 번호6 - 사용점검
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        sunTel: { // 번호7 - 신재생
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        wireTel: { // 번호8 - 전주이설
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        safeTel: { // 번호9 - 안전관리
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        meterTel: { // 번호10 - 계기이상
            type: DataTypes.STRING(45),
            allowNull: true,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);