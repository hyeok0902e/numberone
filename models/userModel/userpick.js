module.exports = (sequelize, DataTypes) => (
    sequelize.define('UserPick', {
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
        }
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);