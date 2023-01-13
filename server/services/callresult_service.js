var callResultPGDB = require('../db/postgres/callresults_db');
var callResultODB = require('../db/oracle/callresults_db');
var callResultSQLDB = require('../db/mssql/callresults_db');

class CallResultService {

    //--------------------------------- Call Result Standardize Data Variables -------------------------------------------------

    getVariables(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            callResultPGDB.getVariables(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            callResultODB.getVariables(connection, callback);
        } else {
            callResultSQLDB.getVariables(dbConfig, callback);
        }
    }

    getVariable(connection, dbConfig, gvId, callback) {
        if (dbConfig.dbType === 'postgres') {
            callResultPGDB.getVariable(connection, gvId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            callResultODB.getVariable(connection, gvId, callback);
        } else {
            callResultSQLDB.getVariable(dbConfig, gvId, callback);
        }
    }

    createVariable(connection, dbConfig, gv, callback) {
        if (dbConfig.dbType === 'postgres') {
            callResultPGDB.createVariable(connection, gv, callback);
        } else if (dbConfig.dbType === 'oracle') {
            callResultODB.createVariable(connection, gv, callback);
        } else {
            callResultSQLDB.createVariable(dbConfig, gv, callback);
        }
    }

    updateVariable(connection, dbConfig, gv, callback) {
        if (dbConfig.dbType === 'postgres') {
            callResultPGDB.updateVariable(connection, gv, callback);
        } else if (dbConfig.dbType === 'oracle') {
            callResultODB.updateVariable(connection, gv, callback);
        } else {
            callResultSQLDB.updateVariable(dbConfig, gv, callback);
        }
    }

    deleteVariable(connection, dbConfig, gv, callback) {
        if (dbConfig.dbType === 'postgres') {
            callResultPGDB.deleteVariable(connection, gv, callback);
        } else if (dbConfig.dbType === 'oracle') {
            callResultODB.deleteVariable(connection, gv, callback);
        } else {
            callResultSQLDB.deleteVariable(dbConfig, gv, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, gv, callback) {
        if (dbConfig.dbType === 'postgres') {
            callResultPGDB.updateLineNumOnDel(connection, gv, callback);
        } else if (dbConfig.dbType === 'oracle') {
            callResultODB.updateLineNumOnDel(connection, gv, callback);
        } else {
            callResultSQLDB.updateLineNumOnDel(dbConfig, gv, callback);
        }
    }

    resetOrder(connection, dbConfig, variable, order, callback) {
        if (dbConfig.dbType === 'postgres') {
            callResultPGDB.resetOrder(connection, variable, order, callback);
        } else if (dbConfig.dbType === 'oracle') {
            callResultODB.resetOrder(connection, variable, order, callback);
        } else {
            callResultSQLDB.resetOrder(dbConfig, variable, order, callback);
        }
    }
}

const callResultService = new CallResultService();
module.exports = callResultService;
