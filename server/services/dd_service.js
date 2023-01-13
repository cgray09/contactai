var ddPGDB = require('../db/postgres/datadict_db');
var ddSQLDB = require('../db/mssql/datadict_db');
var ddODB = require('../db/oracle/datadict_db');

class DDService {

    getDataDictionaryVariables(connection, dbConfig, table, callback) {
        if (dbConfig.dbType === 'postgres') {
            ddPGDB.getDataDictionaryVariables(connection, table, callback);
        } else if (dbConfig.dbType === 'oracle') {
            ddODB.getDataDictionaryVariables(connection, table, callback);
        } else {
            ddSQLDB.getDataDictionaryVariables(dbConfig, table, callback);
        }
    }
    
    getAnalysisCharData(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            ddPGDB.getAnalysisCharData(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            ddODB.getAnalysisCharData(connection, callback);
        } else {
            ddSQLDB.getAnalysisCharData(dbConfig, callback);
        }
    }
}

const ddServc = new DDService();
module.exports = ddServc;