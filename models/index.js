const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/******************************** Initialize (Start) ********************************/
// 공통 및 기타
db.Address = require('./address')(sequelize, Sequelize);
db.Announcement = require('./announcement')(sequelize, Sequelize);

// User
db.User = require('./user/user')(sequelize, Sequelize);
db.Attendance = require('./user/attendance')(sequelize, Sequelize);
db.UserPick = require('./user/userpick')(sequelize, Sequelize);
db.UserAuth = require('./user/userauth')(sequelize, Sequelize);

// BillProject
db.BillProject = require('./billProject/billProject')(sequelize, Sequelize);
db.Load = require('./billProject/Load')(sequelize, Sequelize);
db.Transformer = require('./billProject/transformer')(sequelize, Sequelize);
db.ContractElectricity = require('./billProject/contractElectricity')(sequelize, Sequelize);
db.PE_Low = require('./billProject/peLow')(sequelize, Sequelize);
db.MainPE_High = require('./billProject/mainPeHigh')(sequelize, Sequelize);
db.BankPE_High = require('./billProject/bankPeHigh')(sequelize, Sequelize);
db.Condenser = require('./billProject/condenser')(sequelize, Sequelize);
db.Breaker = require('./billProject/breaker')(sequelize, Sequelize);
db.Cable = require('./billProject/cable')(sequelize, Sequelize);
db.WireCase = require('./billProject/wireCase')(sequelize, Sequelize);
db.Tray = require('./billProject/tray')(sequelize, Sequelize);
db.Generator = require('./billProject/generator')(sequelize, Sequelize);

// Company
db.Company = require('./company/company')(sequelize, Sequelize);
db.SafeManageFee = require('./company/safeManageFee')(sequelize, Sequelize);
db.TestPaper = require('./company/testPaper')(sequelize, Sequelize);
db.RayPaper = require('./company/rayPaper')(sequelize, Sequelize);
db.PowerPaper = require('./company/powerPaper')(sequelize, Sequelize);
db.PowerPaperElement = require('./company/powerPaperElement')(sequelize, Sequelize);
db.EstimatePaper = require('./company/estimatePaper')(sequelize, Sequelize);
db.EstimatePaperElement = require('./company/estimatePaperElement')(sequelize, Sequelize);
db.OpeningPaper = require('./company/openingPaper')(sequelize, Sequelize);

// FeeProject
db.FeeProject = require('./feeProject/feeProject')(sequelize, Sequelize);
db.KepcoFee = require('./feeProject/kepcoFee')(sequelize, Sequelize);
db.PreUsage = require('./feeProject/preUsage')(sequelize, Sequelize);
db.PreReceptFee = require('./feeProject/preReceptFee')(sequelize, Sequelize);
db.PrePowerFee = require('./feeProject/prePowerFee')(sequelize, Sequelize);
db.PreWireFee = require('./feeProject/preWireFee')(sequelize, Sequelize);
db.PeriodUsage = require('./feeProject/periodUsage')(sequelize, Sequelize);
db.PeriodReceptFee = require('./feeProject/periodReceptFee')(sequelize, Sequelize);
db.PeriodPowerFee = require('./feeProject/periodPowerFee')(sequelize, Sequelize);
db.PeriodWireFee = require('./feeProject/periodWireFee')(sequelize, Sequelize);
db.PreChange = require('./feeProject/preChange')(sequelize, Sequelize);
db.PreChangeFee = require('./feeProject/preChangeFee')(sequelize, Sequelize);
db.SafeManage = require('./feeProject/safeManage')(sequelize, Sequelize);

// Statement 
db.Statement = require('./statement/statement')(sequelize, Sequelize);
db.Process = require('./statement/process')(sequelize, Sequelize);
db.ProcessDetail = require('./statement/processDetail')(sequelize, Sequelize);
db.ProcessDetailElement = require('./statement/processDetailElement')(sequelize, Sequelize);

// JobSearch
db.Hiring = require('./jobSearch/hiring')(sequelize, Sequelize);
db.Seeking = require('./jobSearch/seeking')(sequelize, Sequelize);
db.Labor = require('./jobSearch/labor')(sequelize, Sequelize);

// Organization
db.Organization = require('./organization/organization')(sequelize, Sequelize);

// Material
db.Material = require('./material/material')(sequelize, Sequelize);

// Product
db.Product = require('./product/product')(sequelize, Sequelize);
db.ProductOpt = require('./product/productOpt')(sequelize, Sequelize);
db.ProductThumb = require('./product/productThumb')(sequelize, Sequelize);
db.BucketProduct = require('./product/bucketProduct')(sequelize, Sequelize);
db.BucketProductOpt = require('./product/bucketProductOpt')(sequelize, Sequelize);
db.EstimateOfBucket = require('./product/estimateOfBucket')(sequelize, Sequelize);

// Document
db.Document = require('./document/document')(sequelize, Sequelize);

// MarketPrice
db.MarketPrice = require('./marketPrice/marketPrice')(sequelize, Sequelize);
db.MarketPriceOpt = require('./marketPrice/marketPriceOpt')(sequelize, Sequelize);
/********************************* Initialize (End) *********************************/


/*************************** Relation About User (Start) ***************************/
db.Attendance.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Attendance, { foreignKey: 'user_id', sourceKey: 'id' });
db.UserPick.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.UserPick, { foreignKey: 'user_id', sourceKey: 'id' });
db.Address.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasOne(db.Address, { foreignKey: 'user_id', sourceKey: 'id' });
db.UserAuth.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasOne(db.UserAuth, { foreignKey: 'user_id', sourceKey: 'id' });

// Announcement
db.Announcement.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Announcement, { foreignKey: 'user_id', sourceKey: 'id' });


/**************************** Relation About User (End) ****************************/


/************************ Relation About BillProject (Start) ************************/
// BillProject
db.BillProject.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.BillProject, { foreignKey: 'user_id', sourceKey: 'id' });

// Load
db.Load.belongsTo(db.BillProject, { foreignKey: 'billProject_id', targetKey: 'id' });
db.BillProject.hasMany(db.Load, { foreignKey: 'billProject_id', sourceKey: 'id' });

// Internal Reference Of Load 
db.Load.hasMany(db.Load, { as: 'Group', foreignKey: 'bank_id' });
db.Load.belongsTo(db.Load, { through: 'Group', foreignKey: 'bank_id' });
db.Load.hasMany(db.Load, { as: 'MotorLoad', foreignKey: 'groupMotor_id' });
db.Load.belongsTo(db.Load, { through: 'MotorLoad', foreignKey: 'groupMotor_id' });
db.Load.hasMany(db.Load, { as: 'NormalSum', foreignKey: 'groupNormal_id' });
db.Load.belongsTo(db.Load, { through: 'NormalSum', foreignKey: 'groupNormal_id' });
db.Load.hasMany(db.Load, { as: 'NormalLoad', foreignKey: 'normalSum_id' });
db.Load.belongsTo(db.Load, { through: 'NormalLoad', foreignKey: 'normalSum_id' });


// Transformer
db.Transformer.belongsTo(db.Load, { foreignKey: 'bank_id', targetKey: 'id' });
db.Load.hasOne(db.Transformer, { foreignKey: 'bank_id', sourceKey: 'id' });

// ContractElectricity
db.ContractElectricity.belongsTo(db.BillProject, { foreignKey: 'billProject_id', targetKey: 'id' });
db.BillProject.hasMany(db.ContractElectricity, { foreignKey: 'billProject_id', sourceKey: 'id' });

// PE_Low
db.PE_Low.belongsTo(db.BillProject, { foreignKey: 'billProject_id', targetKey: 'id' });
db.BillProject.hasOne(db.PE_Low, { foreignKey: 'billProject_id', sourceKey: 'id' });

// PE_Hight
db.MainPE_High.belongsTo(db.BillProject, { foreignKey: 'billProject_id', targetKey: 'id' });
db.BillProject.hasOne(db.MainPE_High, { foreignKey: 'billProject_id', sourceKey: 'id' });
db.BankPE_High.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.BankPE_High, { foreignKey: 'load_id', sourceKey: 'id' });

// Condenser
db.Condenser.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.Condenser, { foreignKey: 'load_id', sourceKey: 'id' });

// Breaker
db.Breaker.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.Breaker, { foreignKey: 'load_id', sourceKey: 'id' });

// Cable
db.Cable.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.Cable, { foreignKey: 'load_id', sourceKey: 'id' });

// WireCase
db.WireCase.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.WireCase, { foreignKey: 'load_id', sourceKey: 'id' });

// Tray
db.Tray.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.Tray, { foreignKey: 'load_id', sourceKey: 'id' });

// Generator
db.Generator.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.Generator, { foreignKey: 'load_id', sourceKey: 'id' });
db.Generator.belongsTo(db.BillProject, { foreignKey: 'billProject_id', targetKey: 'id' })
db.BillProject.hasMany(db.Generator, { foreignKey: 'billProject_id', sourceKey: 'id' });
/************************* Relation About BillProject (End) *************************/


/************************ Relation About Company (Start) ************************/
db.Company.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Company, { foreignKey: 'user_id', sourceKey: 'id' });

db.Address.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasOne(db.Address, { foreignKey: 'company_id', sourceKey: 'id' });

db.SafeManageFee.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasOne(db.SafeManageFee, { foreignKey: 'company_id', sourceKey: 'id' });

db.TestPaper.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasMany(db.TestPaper, { foreignKey: 'company_id', sourceKey: 'id' });

db.RayPaper.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasMany(db.RayPaper, { foreignKey: 'company_id', sourceKey: 'id' });

db.PowerPaper.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasMany(db.PowerPaper, { foreignKey: 'company_id', sourceKey: 'id' });

db.PowerPaperElement.belongsTo(db.PowerPaper, { foreignKey: 'powerPapaer_id', targetKey: 'id' });
db.PowerPaper.hasMany(db.PowerPaperElement, { foreignKey: 'powerPapaer_id', targetKey: 'id' });

db.EstimatePaper.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasMany(db.EstimatePaper, { foreignKey: 'company_id', sourceKey: 'id' });

db.EstimatePaperElement.belongsTo(db.EstimatePaper, { foreignKey: 'estimatePaper_id', targetKey: 'id' });
db.EstimatePaper.hasMany(db.EstimatePaperElement, { foreignKey: 'estimatePaper_id', sourceKey: 'id' });

db.OpeningPaper.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasMany(db.OpeningPaper, { foreignKey: 'company_id', sourceKey: 'id' });
/************************* Relation About Company (End) *************************/


/************************ Relation About FeeProject (Start) ************************/
db.FeeProject.belongsTo(db.Company, { foreignKey: 'company_id', targetKey: 'id' });
db.Company.hasMany(db.FeeProject, { foreignKey: 'company_id', sourceKey: 'id' });
db.FeeProject.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.FeeProject, { foreignKey: 'user_id', sourceKey: 'id' })

db.KepcoFee.belongsTo(db.FeeProject, { foreignKey: 'feeProject_id', targetKey: 'id' });
db.FeeProject.hasOne(db.KepcoFee, { foreignKey: 'feeProject_id', sourceKey: 'id' });

db.PreUsage.belongsTo(db.FeeProject, { foreignKey: 'feeProject_id', targetKey: 'id' });
db.FeeProject.hasOne(db.PreUsage, { foreignKey: 'feeProject_id', sourceKey: 'id' });

db.PreReceptFee.belongsTo(db.PreUsage, { foreignKey: 'preUsage_id', targetKey: 'id' });
db.PreUsage.hasOne(db.PreReceptFee, { foreignKey: 'preUsage_id', sourceKey: 'id' });

db.PrePowerFee.belongsTo(db.PreUsage, { foreignKey: 'preUsage_id', targetKey: 'id' });
db.PreUsage.hasMany(db.PrePowerFee, { foreignKey: 'preUsage_id', sourceKey: 'id' });

db.PreWireFee.belongsTo(db.PreUsage, { foreignKey: 'preUsage_id', targetKey: 'id' });
db.PreUsage.hasMany(db.PreWireFee, { foreignKey: 'preUsage_id', sourceKey: 'id' });

db.PeriodUsage.belongsTo(db.FeeProject, { foreignKey: 'feeProject_id', targetKey: 'id' });
db.FeeProject.hasOne(db.PeriodUsage, { foreignKey: 'feeProject_id', sourceKey: 'id' });

db.PeriodReceptFee.belongsTo(db.PeriodUsage, { foreignKey: 'periodUsage_id', targetKey: 'id' });
db.PeriodUsage.hasOne(db.PeriodReceptFee, { foreignKey: 'periodUsage_id', sourceKey: 'id' });

db.PeriodPowerFee.belongsTo(db.PeriodUsage, { foreignKey: 'periodUsage_id', targetKey: 'id' });
db.PeriodUsage.hasMany(db.PeriodPowerFee, { foreignKey: 'periodUsage_id', sourceKey: 'id' });

db.PeriodWireFee.belongsTo(db.PeriodUsage, { foreignKey: 'periodUsage_id', targetKey: 'id' });
db.PeriodUsage.hasMany(db.PeriodWireFee, { foreignKey: 'periodUsage_id', sourceKey: 'id' });

db.PreChange.belongsTo(db.FeeProject, { foreignKey: 'feeProject_id', targetKey: 'id' });
db.FeeProject.hasOne(db.PreChange, { foreignKey: 'feeProject_id', sourceKey: 'id' });

db.PreChangeFee.belongsTo(db.PreChange, { foreignKey: 'preChange_id', targetKey: 'id' });
db.PreChange.hasMany(db.PreChangeFee, { foreignKey: 'preChange_id', sourceKey: 'id' });

db.SafeManage.belongsTo(db.FeeProject, { foreignKey: ' feeProject_id', targetKey: 'id' });
db.FeeProject.hasOne(db.SafeManage, { foreignKey: 'feeProject_id', sourceKey: 'id' });
/************************* Relation About FeeProject (End) *************************/


/************************ Relation About Statement (Start) ************************/
db.Statement.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Statement, { foreignKey: 'user_id', sourceKey: 'id' });

db.Process.belongsTo(db.Statement, { foreignKey: 'statement_id', targetKey: 'id' });
db.Statement.hasMany(db.Process, { foreignKey: 'statement_id', sourceKey: 'id' });

db.ProcessDetail.belongsTo(db.Process, { foreignKey: 'process_id', targetKey: 'id' });
db.Process.hasMany(db.ProcessDetail, { foreignKey: 'process_id', sourceKey: 'id' });

db.ProcessDetailElement.belongsTo(db.ProcessDetail, { foreignKey: 'processDetail_id', targetKey: 'id' });
db.ProcessDetail.hasMany(db.ProcessDetailElement, { foreignKey: 'processDetail_id', sourceKey: 'id' });
/************************* Relation About Statement (End) *************************/


/************************ Relation About JobSearch (Start) ************************/
db.Hiring.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Hiring, { foreignKey: 'user_id', sourceKey: 'id' });

db.Seeking.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Seeking, { foreignKey: 'user_id', sourceKey: 'id' });

db.Labor.belongsTo(db.Hiring, { foreignKey: 'hiring_id', targetKey: 'id' });
db.Hiring.hasMany(db.Labor, { foreignKey: 'hiring_id', sourceKey: 'id' });

db.Labor.belongsTo(db.Seeking, { foreignKey: 'seeking_id', targetKey: 'id' });
db.Seeking.hasMany(db.Labor, { foreignKey: 'seeking_id', sourceKey: 'id' });

// N:N
db.Hiring.belongsToMany(db.Hiring, { 
    foreignKey: 'applying_id', 
    as: "Applying",
    through: "ApplyHiring"
});
db.Hiring.belongsToMany(db.Hiring, { 
    foreignKey: 'applyer_id',  
    as: "Applier",
    through: "ApplyHiring" 
});
db.Seeking.belongsToMany(db.Seeking, { 
    foreignKey: 'applying_id', 
    as: "Applying",
    through: "ApplySeeking"
});
db.Seeking.belongsToMany(db.Seeking, { 
    foreignKey: 'applyer_id',  
    as: "Applier",
    through: "ApplySeeking" 
});
/************************* Relation About JobSearch (End) *************************/


/************************** Relation About Product (Start) **************************/
db.Product.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Product, { foreignKey: 'user_id', sourceKey: 'id' });

db.ProductThumb.belongsTo(db.Product, { foreignKey: 'product_id', targetKey: 'id' });
db.Product.hasMany(db.ProductThumb, { foreignKey: 'product_id', sourceKey: 'id' });

db.ProductOpt.belongsTo(db.Product, { foreignKey: 'product_id', targetKey: 'id' });
db.Product.hasMany(db.ProductOpt, { foreignKey: 'product_id', sourceKey: 'id' });

db.BucketProduct.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.BucketProduct, { foreignKey: 'user_id', sourceKey: 'id' });

db.BucketProductOpt.belongsTo(db.BucketProduct, { foreignKey: 'bucketProduct_id', targetKey: 'id' });
db.BucketProduct.hasMany(db.BucketProductOpt, { foreignKey: 'bucketProduct_id', sourceKey: 'id' });

db.EstimateOfBucket.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.EstimateOfBucket, { foreignKey: 'user_id', sourceKey: 'id' });
/*************************** Relation About Product (End) ***************************/


/************************* Relation About MarketPrice (Start) *************************/
db.MarketPrice.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.MarketPrice, { foreignKey: 'user_id', sourceKey: 'id' });

db.MarketPriceOpt.belongsTo(db.MarketPrice, { foreignKey: 'marketPrice_id', targetKey: 'id' });
db.MarketPrice.hasMany(db.MarketPriceOpt, { foreignKey: 'marketPrice_id', sourceKey: 'id' });

db.Address.belongsTo(db.MarketPrice, { foreignKey: 'marketPrice_id', targetKey: 'id' });
db.MarketPrice.hasOne(db.Address, { foreignKey: ' marketPrice_id', sourceKey: 'id' });
/************************** Relation About MarketPrice (End) **************************/


module.exports = db;