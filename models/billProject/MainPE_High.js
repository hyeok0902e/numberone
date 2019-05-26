module.exports = (sequelize, DataTypes) => (
    sequelize.define('MainPE_High', {
        output: { // 설비용량(각 뱅크의 합계) (kVA)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        volt: { // 전압 (V)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        assSangAmpe: { // ASS - 상 전류 
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        assJiracAmpe: { // ASS - 지락전류
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        firstAmpe: { // 1차 전류 (A)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        }, 
        firstCT125: { // 1차 CT - 1.25배
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        firstCT15: { // 1차 CT - 1.5배
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        mofCT: { // MOF - CT
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        mofMagni: { // MOF - 배율
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        pfTrans: { // PF - 한류형
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        pfNonTrans: { // PF - 비한류형
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: { // 업데이트 시간
            type: DataTypes.DATE,
            allowNull: true, 
        }
    }, {
        timestamps: false,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);