var scPGDB = require('../db/postgres/scorecards_db');
var scODB = require('../db/oracle/scorecards_db');
var scSQLDB = require('../db/mssql/scorecards_db');

class ScoreCardService {

    getSCs(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.getSCs(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.getSCs(connection, callback);
        } else {
            scSQLDB.getSCs(dbConfig, callback);
        }
    }

    getSC(connection, dbConfig, scId, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.getSC(connection, scId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.getSC(connection, scId, callback);
        } else {
            scSQLDB.getSC(dbConfig, scId, callback);
        }
    }

    createSC(connection, dbConfig, sc, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.createSC(connection, sc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.createSC(connection, sc, callback);
        } else {
            scSQLDB.createSC(dbConfig, sc, callback);
        }
    }

    updateSC(connection, dbConfig, sc, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.updateSC(connection, sc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.updateSC(connection, sc, callback);
        } else {
            scSQLDB.updateSC(dbConfig, sc, callback);
        }
    }

    deleteSC(connection, dbConfig, sc, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.deleteSC(connection, sc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.deleteSC(connection, sc, callback);
        } else {
            scSQLDB.deleteSC(dbConfig, sc, callback);
        }
    }

    activateSC(connection, dbConfig, sc, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.activateSC(connection, sc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.activateSC(connection, sc, callback);
        } else {
            scSQLDB.activateSC(dbConfig, sc, callback);
        }
    }
    
    getSCModelDef(connection, dbConfig, filters, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.getSCModelDef(connection, filters, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.getSCModelDef(connection, filters, callback);
        } else {
            scSQLDB.getSCModelDef(dbConfig, filters, callback);
        }
    }

    getSCDefs(connection, dbConfig, sc, callback) {
        if (dbConfig.dbType === 'postgres') {
            scPGDB.getSCDefs(connection, sc, callback);
        } else if (dbConfig.dbType === 'oracle') {
            scODB.getSCDefs(connection, sc, callback);
        } else {
            scSQLDB.getSCDefs(dbConfig, sc, callback);
        }
    }
}

const scoreCardService = new ScoreCardService();
module.exports = scoreCardService;
