module.exports = (sequelize, DataTypes) => (
    sequelize.define('Address', {
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
        siName: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        sggName: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        emdName: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        liName: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        roadName: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        bunji: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        ho: {
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