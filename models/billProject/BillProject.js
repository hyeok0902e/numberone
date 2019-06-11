module.exports = (sequelize, DataTypes) => (
    sequelize.define('BillProject', {
        name: { // 프로젝트 명
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        voltType: { // 전압수전 타입 => 0: 고압수전, 1: 저압수전
            type: DataTypes.INTEGER(2),
            allowNull: false,
        },
        transformerKva: { // 변압기 전체 용량 => 변압기 계산시 저장
            type: DataTypes.DOUBLE(11, 2),
            allowNull: true,
        },
        volt: { 
            // 총 전압: 각 부하의 가장 최상의 전압 => 변압기 or 계약전력 계산시 저장
            // 계약전력 계산 시 => 프로젝트 저압수전에 따라 규칙 다름
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        elecConvertVal: { // 계약전력 환산값 합계 - 계약전력 계산시 저장 (kW)
            type: DataTypes.DOUBLE(11,2),
            allowNull: true,
            defaultValue: 0,
        },
        loadSimplyCE: { // 부하집계에 의한 계약전력 - 계약전력 계산시 저장 (kW)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: false,
            defaultValue: 0,
        },
        outputCE: { // 설비용량에 의한 계약전력 (변압기계산의 사용자입력값 합계) - 계약전력 계산시 저장 (kVA)
            type: DataTypes.DOUBLE(11, 2),
            allowNull: false,
            defaultValue: 0,
        },
        motorLoadCheck: { // 전동기부하 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        normalLoadCheck: { // 일반부하(분전반) 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        transformerCheck: { // 변압기 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        ceCheck: { // 계약전력 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        }, 
        peCheck: { // 수전설비 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        condenserCheck: { // 콘덴서 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },  
        breakerCheck: { // 차단기 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        cableCheck: { // 케이블 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        wireCaseCheck: { // 전선관 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        trayCheck: { // 트레이 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        generatorCheck: { // 발전기 계산이 완료되었는지 체크
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },  
        memo: { // 메모
            type: DataTypes.TEXT,
            allowNull: true,
        },
        stage: { // 계산 단계 (상태)
            type: DataTypes.INTEGER(2),
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