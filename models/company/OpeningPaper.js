module.exports = (sequelize, DataTypes) => (
    sequelize.define('OpeningPaper', {
        receiver: { // 수신 기관
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        reference: { // 참조
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        compName: { // 고객(업체) 명
            type: DataTypes.STRING(255),
            allowNull: true,  
        }, 
        compTel: { // 고객(업체) 번호
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        compAddress: { // 고객(업체) 주소
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        openingDate: { // 개폐일시
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        open: { // 개방
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        put: { // 투입
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        safeManager: { // 안전관리자
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        managerMobile: { // 관리자 연락처
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        userCompName: { // 사용자 업체명
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ceo: { // 대표이사 명
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