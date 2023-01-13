var analysisCharPGDB = require('../db/postgres/analysischar_db');
var analysisCharODB = require('../db/oracle/analysischar_db');
var analysisCharSQLDB = require('../db/mssql/analysischar_db');

class AnalysisCharService {

    getAnalysisChars(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.getAnalysisChars(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.getAnalysisChars(connection, callback);
        } else {
            analysisCharSQLDB.getAnalysisChars(dbConfig, callback);
        }
    }

    getAnalysisChar(connection, dbConfig, analysisCharId, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.getAnalysisChar(connection, analysisCharId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.getAnalysisChar(connection, analysisCharId, callback);
        } else {
            analysisCharSQLDB.getAnalysisChar(dbConfig, analysisCharId, callback);
        }
    }

    createAnalysisChar(connection, dbConfig, analysisChar, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.createAnalysisChar(connection, analysisChar, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.createAnalysisChar(connection, analysisChar, callback);
        } else {
            analysisCharSQLDB.createAnalysisChar(dbConfig, analysisChar, callback);
        }
    }

    updateAnalysisChar(connection, dbConfig, analysisChar, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.updateAnalysisChar(connection, analysisChar, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.updateAnalysisChar(connection, analysisChar, callback);
        } else {
            analysisCharSQLDB.updateAnalysisChar(dbConfig, analysisChar, callback);
        }
    }

    deleteAnalysisChar(connection, dbConfig, analysisChar, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.deleteAnalysisChar(connection, analysisChar, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.deleteAnalysisChar(connection, analysisChar, callback);
        } else {
            analysisCharSQLDB.deleteAnalysisChar(dbConfig, analysisChar, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, analysisChar, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.updateLineNumOnDel(connection, analysisChar, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.updateLineNumOnDel(connection, analysisChar, callback);
        } else {
            analysisCharSQLDB.updateLineNumOnDel(dbConfig, analysisChar, callback);
        }
    }

    resetOrder(connection, dbConfig, analysisChar, order, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.resetOrder(connection, analysisChar, order, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.resetOrder(connection, analysisChar, order, callback);
        } else {
            analysisCharSQLDB.resetOrder(dbConfig, analysisChar, order, callback);
        }
    }

    importAnalysisChars(connection, dbConfig, analysisChars, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.importAnalysisChars(connection, analysisChars, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.importAnalysisChars(connection, analysisChars, callback);
        } else {
            analysisCharSQLDB.importAnalysisChars(dbConfig, analysisChars, callback);
        }
    }

    deleteAnalysisChars(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            analysisCharPGDB.deleteAnalysisChars(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            analysisCharODB.deleteAnalysisChars(connection, callback);
        } else {
            analysisCharSQLDB.deleteAnalysisChars(dbConfig, callback);
        }
    }
}

const analysisCharService = new AnalysisCharService();
module.exports = analysisCharService;
