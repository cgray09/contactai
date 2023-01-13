var dialerRecycleDaysPGDB = require('../db/postgres/dialerrecycledays_db');
var dialerRecycleDaysODB = require('../db/oracle/dialerrecycledays_db');
var dialerRecycleDaysSQLDB = require('../db/mssql/dialerrecycledays_db');

var commonRecycleDaysPGDB = require('../db/postgres/commonrecycledays_db');
var commonRecycleDaysODB = require('../db/oracle/commonrecycledays_db');
var commonRecycleDaysSQLDB = require('../db/mssql/commonrecycledays_db');

class RecycleDaysService {

    getDialerRecycleDays(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerRecycleDaysPGDB.getDialerRecycleDays(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerRecycleDaysODB.getDialerRecycleDays(connection, dialer, callback);
        } else {
            dialerRecycleDaysSQLDB.getDialerRecycleDays(dbConfig, dialer, callback);
        }
    }

    getCommonRecycleDays(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            commonRecycleDaysPGDB.getCommonRecycleDays(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            commonRecycleDaysODB.getCommonRecycleDays(connection, callback);
        } else {
            commonRecycleDaysSQLDB.getCommonRecycleDays(dbConfig, callback);
        }
    }

    createDialerRecycleDays(connection, dbConfig, recycleDays, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerRecycleDaysPGDB.createDialerRecycleDays(connection, recycleDays, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerRecycleDaysODB.createDialerRecycleDays(connection, recycleDays, dialer, callback);
        } else {
            dialerRecycleDaysSQLDB.createDialerRecycleDays(dbConfig, recycleDays, dialer, callback);
        }
    }

    createCommonRecycleDays(connection, dbConfig, recycleDays, callback) {
        if (dbConfig.dbType === 'postgres') {
            commonRecycleDaysPGDB.createCommonRecycleDays(connection, recycleDays, callback);
        } else if (dbConfig.dbType === 'oracle') {
            commonRecycleDaysODB.createCommonRecycleDays(connection, recycleDays, callback);
        } else {
            commonRecycleDaysSQLDB.createCommonRecycleDays(dbConfig, recycleDays, callback);
        }
    }

    deleteDialerRecycleDays(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            dialerRecycleDaysPGDB.deleteDialerRecycleDays(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            dialerRecycleDaysODB.deleteDialerRecycleDays(connection, dialer, callback);
        } else {
            dialerRecycleDaysSQLDB.deleteDialerRecycleDays(dbConfig, dialer, callback);
        }
    }

    deleteCommonRecycleDays(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            commonRecycleDaysPGDB.deleteCommonRecycleDays(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            commonRecycleDaysODB.deleteCommonRecycleDays(connection, callback);
        } else {
            commonRecycleDaysSQLDB.deleteCommonRecycleDays(dbConfig, callback);
        }
    }
}

const recycleDaysService = new RecycleDaysService();
module.exports = recycleDaysService;
