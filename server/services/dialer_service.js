var dialerPGDB = require('../db/postgres/dialers_db');
var dialerODB = require('../db/oracle/dialers_db');
var dialerSQLDB = require('../db/mssql/dialers_db');

class DialerService {

    getDialers(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerPGDB.getDialers(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerODB.getDialers(connection, callback);
        } else {
            dialerSQLDB.getDialers(dbConfig, callback);
        }
    }

    getDialer(connection, dbConfig, dialerId, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerPGDB.getDialer(connection, dialerId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerODB.getDialer(connection, dialerId, callback);
        } else {
            dialerSQLDB.getDialer(dbConfig, dialerId, callback);
        }
    }

    createDialer(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerPGDB.createDialer(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerODB.createDialer(connection, dialer, callback);
        } else {
            dialerSQLDB.createDialer(dbConfig, dialer, callback);
        }
    }

    updateDialer(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerPGDB.updateDialer(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerODB.updateDialer(connection, dialer, callback);
        } else {
            dialerSQLDB.updateDialer(dbConfig, dialer, callback);
        }
    }

    deleteDialer(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerPGDB.deleteDialer(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerODB.deleteDialer(connection, dialer, callback);
        } else {
            dialerSQLDB.deleteDialer(dbConfig, dialer, callback);
        }
    }
}

const dialerService = new DialerService();
module.exports = dialerService;
