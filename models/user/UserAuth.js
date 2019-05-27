module.exports = (sequelize, DataTypes) => (
    sequelize.define('UserAuth', {
        period: { // 사용 기간 - 단독계산, 사업소, 자재검색, 자료실
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        preDate: { // 예비용
            type: DataTypes.DATE,
            allowNull: true,
        },
        compManage: { // 업체관리 등록횟수
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        billProject: { // 계산서 프로젝트 등록횟수
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        billSimply: { // 단독계산 사용 권한
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        organization: { // 사업소 사용 권한
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        feeProject: { // 수수료 프로젝트 등록횟수
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        statement: { // 내역서 등록횟수
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        material: { // 자재검색 사용 권한
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        document: { // 자료실 사용 권한
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        product: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        jobSearch: { // 
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        marketPrice: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);