module.exports = (sequelize, DataTypes) => (
    sequelize.define('WireCase', {
        cType: { // 케이블 - 형식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        cThick: { // 케이블 - 굵기
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        cSimsu: { // 케이블 - 심수
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        cStrandNum: { // 케이블 - 가닥수 (L)
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0,
        },
        cExternalDiameter: { // 케이블 - 외경 (mm)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        cCrossSection: { // 케이블 - 단면적 (㎟)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        gwType: { // 접지선 - 형식
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        gwThick: { // 접지선 - 굵기
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        gwExternalDiameter: { // 접지선 - 외경 (mm)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        gwCrossSection: { // 접지선 - 단면적 (㎟)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        sumCS: { // 단면적 합계 (㎟)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        permCS: { // 허용 내단면적 (%)
            type: DataTypes.DOUBLE(11, 3),
            allowNull: true,
            defaultValue: 0,
        },
        needCS: {// 필요 단면적 (㎟)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        wcInnerDiameter: { // 전선관 내경 (mm)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        wcVal: { // 전선관 선정 (mm)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
            defaultValue: 0,
        },
        createdAt: { // 생성 시간
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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