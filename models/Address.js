module.exports = (sequelize, DataTypes) => (
    sequelize.define('address', {
        jibunAddr: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        roadFullAddr: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        roadAddrPart1: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        roadAddrPart2: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        engAddr: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        zipNo: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        siNm: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        sggNm: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        emdNm: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        liNm: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        rn: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        lnbrMnnm: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        lnbrSlno: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        detail: {
            type: DataTypes.STRING(45),
            allowNull: true,
        }
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);