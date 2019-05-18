module.exports = (sequelize, DataTypes) => (
    sequelize.define('User', {
        email: { // "hyeoke0902e@gmail.com"
            type: DataTypes.STRING(125),
            allowNull: false,
            unique: true,
        },
        password: { // "1k2k12k3asd456&*123123"
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        fbUID: { // "HBTaJt057Bf63oS771gah1allYe2"
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        fbFCM: { // "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1..."
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        name: { // 이름
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        birth: { // 생일
            type: DataTypes.DATE,
            allowNull: false, 
        },
        gender: { // 성
            type: DataTypes.INTEGER(1),
            allowNull: false,
        },
        phone: { // 휴대폰
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        task: { // 직무
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        company: { // 회사명
            type: DataTypes.STRING(125),
            allowNull: true,
        },
        companyTel: { // 회사번호
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        fax: { // 팩스
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        profile: { // 프로필 사진
            type: DataTypes.STRING(2083),
            allowNull: true,
        },
        level: { // 회원등급
            type: DataTypes.INTEGER(2),
            allowNull: false,
            defaultValue: 0,
        },
        productAuth: { // 제품등록 권한
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        productAuthPeriod: { // 제품등록 권한 기간
            type: DataTypes.INTEGER(5),
            allowNull: true,
        },
        marketAuth: { // 시세정보등록 권한
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        marketAuthPeriod: { // 시세정보등록 권한 기간
            type: DataTypes.INTEGER(5),
            allowNull: true,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);