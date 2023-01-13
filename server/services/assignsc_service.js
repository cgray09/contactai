var assignscPGDB = require('../db/postgres/assignsc_db');
var assignscODB = require('../db/oracle/assignsc_db');
var assignscSQLDB = require('../db/mssql/assignsc_db');

class AssignSCService {

    getAssignSCs(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.getAssignSCs(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.getAssignSCs(connection, callback);
        } else {
            assignscSQLDB.getAssignSCs(dbConfig, callback);
        }
    }

    getAssignSC(connection, dbConfig, assignscId, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.getAssignSC(connection, assignscId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.getAssignSC(connection, assignscId, callback);
        } else {
            assignscSQLDB.getAssignSC(dbConfig, assignscId, callback);
        }
    }

    createAssignSC(connection, dbConfig, assignsc, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.createAssignSC(connection, assignsc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.createAssignSC(connection, assignsc, callback);
        } else {
            assignscSQLDB.createAssignSC(dbConfig, assignsc, callback);
        }
    }

    updateAssignSC(connection, dbConfig, assignsc, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.updateAssignSC(connection, assignsc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.updateAssignSC(connection, assignsc, callback);
        } else {
            assignscSQLDB.updateAssignSC(dbConfig, assignsc, callback);
        }
    }

    deleteAssignSC(connection, dbConfig, assignsc, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.deleteAssignSC(connection, assignsc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.deleteAssignSC(connection, assignsc, callback);
        } else {
            assignscSQLDB.deleteAssignSC(dbConfig, assignsc, callback);
        }
    }

    updateProperties(connection, dbConfig, properties, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.updateProperties(connection, properties, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.updateProperties(connection, properties, callback);
        } else {
            assignscSQLDB.updateProperties(dbConfig, properties, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, assignsc, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.updateLineNumOnDel(connection, assignsc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.updateLineNumOnDel(connection, assignsc, callback);
        } else {
            assignscSQLDB.updateLineNumOnDel(dbConfig, assignsc, callback);
        }
    }

    resetOrder(connection, dbConfig, assignsc, order, callback) {
        if (dbConfig.dbType === 'postgres') {
            assignscPGDB.resetOrder(connection, assignsc, order, callback);
        } else if (dbConfig.dbType === 'oracle') {
            assignscODB.resetOrder(connection, assignsc, order, callback);
        } else {
            assignscSQLDB.resetOrder(dbConfig, assignsc, order, callback);
        }
    }
}

const assignscService = new AssignSCService();
module.exports = assignscService;
