const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/******************************** Initialize (Start) ********************************/
// 공통 및 기타
db.Address = require('./Address')(sequelize, Sequelize);
db.Announcement = require('./Announcement')(sequelize, Sequelize);

// User
db.User = require('./user/User')(sequelize, Sequelize);
db.Attendance = require('./user/Attendance')(sequelize, Sequelize);
db.UserPick = require('./user/UserPick')(sequelize, Sequelize);
db.UserAuth = require('./user/UserAuth')(sequelize, Sequelize);

// BillProject
db.BillProject = require('./billProject/BillProject')(sequelize, Sequelize);
db.Load = require('./billProject/Load')(sequelize, Sequelize);
db.Transformer = require('./billProject/Transformer')(sequelize, Sequelize);
db.ContractElectricity = require('./billProject/ContractElectricity')(sequelize, Sequelize);
db.SimplyForCE = require('./billProject/SimplyForCE')(sequelize, Sequelize);
db.PE_Low = require('./billProject/PE_Low')(sequelize, Sequelize);
db.MainPE_High = require('./billProject/MainPE_High')(sequelize, Sequelize);
db.BankPE_High = require('./billProject/BankPE_High')(sequelize, Sequelize);
db.Condenser = require('./billProject/Condenser')(sequelize, Sequelize);
db.Breaker = require('./billProject/Breaker')(sequelize, Sequelize);
db.Cable = require('./billProject/Cable')(sequelize, Sequelize);
db.WireCase = require('./billProject/WireCase')(sequelize, Sequelize);
db.Tray = require('./billProject/Tray')(sequelize, Sequelize);
db.Generator = require('./billProject/Generator')(sequelize, Sequelize);

// Company
db.Company = require('./company/Company')(sequelize, Sequelize);
db.SafeManageFee = require('./company/SafeManageFee')(sequelize, Sequelize);
db.TestPaper = require('./company/TestPaper')(sequelize, Sequelize);
db.RayPaper = require('./company/RayPaper')(sequelize, Sequelize);
db.PowerPaper = require('./company/PowerPaper')(sequelize, Sequelize);
db.PowerPaperElement = require('./company/PowerPaperElement')(sequelize, Sequelize);
db.EstimatePaper = require('./company/EstimatePaper')(sequelize, Sequelize);
db.EstimatePaperElement = require('./company/EstimatePaperElement')(sequelize, Sequelize);
db.OpeningPaper = require('./company/OpeningPaper')(sequelize, Sequelize);

// FeeProject
db.FeeProject = require('./feeProject/FeeProject')(sequelize, Sequelize);
db.KepcoFee = require('./feeProject/KepcoFee')(sequelize, Sequelize);
db.PreUsage = require('./feeProject/PreUsage')(sequelize, Sequelize);
db.PreReceptFee = require('./feeProject/PreUsage')(sequelize, Sequelize);
db.PrePowerFee = require('./feeProject/PrePowerFee')(sequelize, Sequelize);
db.PreWireFee = require('./feeProject/PreWireFee')(sequelize, Sequelize);
db.PeriodUsage = require('./feeProject/PeriodUsage')(sequelize, Sequelize);
db.PeriodReceptFee = require('./feeProject/PeriodReceptFee')(sequelize, Sequelize);
db.PeriodPowerFee = require('./feeProject/PeriodPowerFee')(sequelize, Sequelize);
db.PeriodWireFee = require('./feeProject/PeriodWireFee')(sequelize, Sequelize);
db.PreChange = require('./feeProject/PreChange')(sequelize, Sequelize);
db.PreChangeFee = require('./feeProject/PreChangeFee')(sequelize, Sequelize);
db.SafeManage = require('./feeProject/SafeManage')(sequelize, Sequelize);

// Statement 
db.Statement = require('./statement/Statement')(sequelize, Sequelize);
db.Process = require('./statement/Process')(sequelize, Sequelize);
db.ProcessDetail = require('./statement/ProcessDetail')(sequelize, Sequelize);
db.ProcessDetailElement = require('./statement/ProcessDetailElement')(sequelize, Sequelize);

// JobSearch
db.Hiring = require('./jobSearch/Hiring')(sequelize, Sequelize);
db.Seeking = require('./jobSearch/Seeking')(sequelize, Sequelize);
db.Labor = require('./jobSearch/Labor')(sequelize, Sequelize);

// Organization
db.Organization = require('./organization/Organization')(sequelize, Sequelize);

// Material
db.Material = require('./material/Material')(sequelize, Sequelize);

// Product
db.Product = require('./product/Product')(sequelize, Sequelize);
db.ProductOpt = require('./product/ProductOpt')(sequelize, Sequelize);
db.ProductThumb = require('./product/ProductThumb')(sequelize, Sequelize);
db.BucketProduct = require('./product/BucketProduct')(sequelize, Sequelize);
db.BucketProductOpt = require('./product/BucketProduct')(sequelize, Sequelize);
db.EstimateOfBucket = require('./product/EstimateOfBucket')(sequelize, Sequelize);

// Document
db.Document = require('./document/Document')(sequelize, Sequelize);

// MarketPrice
db.MarketPrice = require('./marketPrice/MarketPrice')(sequelize, Sequelize);
db.MarketPriceOpt = require('./marketPrice/MarketPriceOpt')(sequelize, Sequelize);
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

// Material
db.Material.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Material, { foreignKey: 'user_id', sourceKey: 'id' });

// Document
db.Document.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });
db.User.hasMany(db.Document, { foreignKey: 'user_id', sourceKey: 'id' });
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
db.Load.hasMany(db.Load, { as: 'MotorLoad', foreignKey: 'group_id' });
db.Load.hasMany(db.Load, { as: 'NormalSum', foreignKey: 'group_id' });
db.Load.hasMany(db.Load, { as: 'NormalLoad', foreignKey: 'normalSum_id' });

// Transformer
db.Transformer.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.Transformer, { foreignKey: 'load_id', sourceKey: 'id' });

// ContractElectricity
db.ContractElectricity.belongsTo(db.BillProject, { foreignKey: 'billProject_id', targetKey: 'id' });
db.BillProject.hasMany(db.ContractElectricity, { foreignKey: 'billProject_id', sourceKey: 'id' });
db.SimplyForCE.belongsTo(db.Load, { foreignKey: 'load_id', targetKey: 'id' });
db.Load.hasOne(db.SimplyForCE, { foreignKey: 'load_id', sourceKey: 'id' });

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
db.PeriodReceptFee.hasMany(db.PeriodPowerFee, { foreignKey: 'periodUsage_id', sourceKey: 'id' });

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