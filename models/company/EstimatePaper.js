module.exports = (sequelize, DataTypes) => (
    sequelize.define('EstimatePaper', {
        launchDate: { // 발행일자
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        receiver: { // 수신 업체
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        receiverName: { // 수신 담당자
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        receiverTel: { // 수신자 번호
            type: DataTypes.STRING(45),
            allowNull: true,
        },      
        receiverFax: { // 수신자 팩스
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        receiverEmail: { // 수신자 이메일
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        sender: { // 발신 업체
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        senderName: { // 발신 담당자
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        senderTel: { // 발신자 번호
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        senderFax: { // 발신자 팩스
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        senderEmail: { // 발신자 이메일
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        totalCost: { // 합계 비용
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        vat: { // 부가세
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        lastCost: { // 총 비용
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        opinion: { // 특이 사항
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