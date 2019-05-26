module.exports = (sequelize, DataTypes) => (
    sequelize.define('WireCase', {
        cType: { // 케이블 - 형식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        cThick: { // 케이블 - 굵기
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        cSimsu: { // 케이블 - 심수
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        cStrandNum: { // 케이블 - 가닥수 (L)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        cExternalDiameter: { // 케이블 - 외경 (mm)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        cCrossSection: { // 케이블 - 단면적 (㎟)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        gwType: { // 접지선 - 형식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        gwThick: { // 접지선 - 굵기
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        gwExternalDiameter: { // 접지선 - 외경 (mm)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        gwCrossSection: { // 접지선 - 단면적 (㎟)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        sumCS: { // 단면적 합계 (㎟)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        permCS: { // 허용 내단면적 (%)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        needCS: {// 필요 단면적 (㎟)
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        wcInnerDiameter: { // 전선관 내경 (mm)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        wcVal: { // 전선관 선정 (mm)
            type: DataTypes.INTEGER(11),
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