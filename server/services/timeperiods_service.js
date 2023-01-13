var periodPGDB = require('../db/postgres/timeperiods_db');
var periodODB = require('../db/oracle/timeperiods_db');
var periodSQLDB = require('../db/mssql/timeperiods_db');

class TimePeriodService {

    getPeriods(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            periodPGDB.getPeriods(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            periodODB.getPeriods(connection, callback);
        } else {
            periodSQLDB.getPeriods(dbConfig, callback);
        }
    }

    getPeriod(connection, dbConfig, periodId, callback) {
        if (dbConfig.dbType === 'postgres') {
            periodPGDB.getPeriod(connection, periodId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            periodODB.getPeriod(connection, periodId, callback);
        } else {
            periodSQLDB.getPeriod(dbConfig, periodId, callback);
        }
    }

    createPeriod(connection, dbConfig, period, callback) {
        if (dbConfig.dbType === 'postgres') {
            periodPGDB.createPeriod(connection, period, callback);
        } else if (dbConfig.dbType === 'oracle') {
            periodODB.createPeriod(connection, period, callback);
        } else {
            periodSQLDB.createPeriod(dbConfig, period, callback);
        }
    }

    updatePeriod(connection, dbConfig, period, callback) {
        if (dbConfig.dbType === 'postgres') {
            periodPGDB.updatePeriod(connection, period, callback);
        } else if (dbConfig.dbType === 'oracle') {
            periodODB.updatePeriod(connection, period, callback);
        } else {
            periodSQLDB.updatePeriod(dbConfig, period, callback);
        }
    }

    deletePeriod(connection, dbConfig, period, callback) {
        if (dbConfig.dbType === 'postgres') {
            periodPGDB.deletePeriod(connection, period, callback);
        } else if (dbConfig.dbType === 'oracle') {
            periodODB.deletePeriod(connection, period, callback);
        } else {
            periodSQLDB.deletePeriod(dbConfig, period, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, period, callback) {
        if (dbConfig.dbType === 'postgres') {
            periodPGDB.updateLineNumOnDel(connection, period, callback);
        } else if (dbConfig.dbType === 'oracle') {
            periodODB.updateLineNumOnDel(connection, period, callback);
        } else {
            periodSQLDB.updateLineNumOnDel(dbConfig, period, callback);
        }
    }

    resetOrder(connection, dbConfig, period, order, callback) {
        if (dbConfig.dbType === 'postgres') {
            periodPGDB.resetOrder(connection, period, order, callback);
        } else if (dbConfig.dbType === 'oracle') {
            periodODB.resetOrder(connection, period, order, callback);
        } else {
            periodSQLDB.resetOrder(dbConfig, period, order, callback);
        }
    }
}

const timePeriodService = new TimePeriodService();
module.exports = timePeriodService;
