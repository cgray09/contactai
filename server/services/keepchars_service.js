var keepCharPGDB = require('../db/postgres/keepchars_db');
var keepCharODB = require('../db/oracle/keepchars_db');
var keepCharSQLDB = require('../db/mssql/keepchars_db');

class KeepCharService {

    getKeepChars(connection, dbConfig, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            keepCharPGDB.getKeepChars(connection, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            keepCharODB.getKeepChars(connection, page, callback);
        } else {
            keepCharSQLDB.getKeepChars(dbConfig, page, callback);
        }
    }

    getKeepChar(connection, dbConfig, keepCharId, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            keepCharPGDB.getKeepChar(connection, keepCharId, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            keepCharODB.getKeepChar(connection, keepCharId, page, callback);
        } else {
            keepCharSQLDB.getKeepChar(dbConfig, keepCharId, page, callback);
        }
    }

    createKeepChar(connection, dbConfig, keepChar, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            keepCharPGDB.createKeepChar(connection, keepChar, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            keepCharODB.createKeepChar(connection, keepChar, page, callback);
        } else {
            keepCharSQLDB.createKeepChar(dbConfig, keepChar, page, callback);
        }
    }

    updateKeepChar(connection, dbConfig, keepChar, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            keepCharPGDB.updateKeepChar(connection, keepChar, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            keepCharODB.updateKeepChar(connection, keepChar, page, callback);
        } else {
            keepCharSQLDB.updateKeepChar(dbConfig, keepChar, page, callback);
        }
    }

    deleteKeepChar(connection, dbConfig, keepChar, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            keepCharPGDB.deleteKeepChar(connection, keepChar, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            keepCharODB.deleteKeepChar(connection, keepChar, page, callback);
        } else {
            keepCharSQLDB.deleteKeepChar(dbConfig, keepChar, page, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, keepChar, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            keepCharPGDB.updateLineNumOnDel(connection, keepChar, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            keepCharODB.updateLineNumOnDel(connection, keepChar, page, callback);
        } else {
            keepCharSQLDB.updateLineNumOnDel(dbConfig, keepChar, page, callback);
        }
    }

    resetOrder(connection, dbConfig, keepChar, order, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            keepCharPGDB.resetOrder(connection, keepChar, order, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            keepCharODB.resetOrder(connection, keepChar, order, page, callback);
        } else {
            keepCharSQLDB.resetOrder(dbConfig, keepChar, order, page, callback);
        }
    }
}

const keepCharService = new KeepCharService();
module.exports = keepCharService;
