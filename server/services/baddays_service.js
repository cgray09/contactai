var badDaysPGDB = require('../db/postgres/baddays_db');
var badDaysODB = require('../db/oracle/baddays_db');
var badDaysSQLDB = require('../db/mssql/baddays_db');

class BadDaysService {

    getBadDays(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            badDaysPGDB.getBadDays(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            badDaysODB.getBadDays(connection, dialer, callback);
        } else {
            badDaysSQLDB.getBadDays(dbConfig, dialer, callback);
        }
    }

    getDialerBadDays(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            badDaysPGDB.getDialerBadDays(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            badDaysODB.getDialerBadDays(connection, dialer, callback);
        } else {
            badDaysSQLDB.getDialerBadDays(dbConfig, dialer, callback);
        }
    }

    createBadDays(connection, dbConfig, badDays, callback) {
        if (dbConfig.dbType === 'postgres') {
            badDaysPGDB.createBadDays(connection, badDays, callback);
        } else if (dbConfig.dbType === 'oracle') {
            badDaysODB.createBadDays(connection, badDays, callback);
        } else {
            badDaysSQLDB.createBadDays(dbConfig, badDays, callback);
        }
    }

    deleteBadDays(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            badDaysPGDB.deleteBadDays(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            badDaysODB.deleteBadDays(connection, dialer, callback);
        } else {
            badDaysSQLDB.deleteBadDays(dbConfig, dialer, callback);
        }
    }

    deleteDialerBadDays(connection, dbConfig, dialer, callback) {
        if (dbConfig.dbType === 'postgres') {
            badDaysPGDB.deleteDialerBadDays(connection, dialer, callback);
        } else if (dbConfig.dbType === 'oracle') {
            badDaysODB.deleteDialerBadDays(connection, dialer, callback);
        } else {
            badDaysSQLDB.deleteDialerBadDays(dbConfig, dialer, callback);
        }
    }
}

const badDaysService = new BadDaysService();
module.exports = badDaysService;
