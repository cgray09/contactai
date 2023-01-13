var samplePGDB = require('../db/postgres/includesample_db');
var sampleODB = require('../db/oracle/includesample_db');
var sampleSQLDB = require('../db/mssql/includesample_db');

class IncludeSampleService {

    getSamples(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.getSamples(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.getSamples(connection, callback);
        } else {
            sampleSQLDB.getSamples(dbConfig, callback);
        }
    }

    getSample(connection, dbConfig, sampleId, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.getSample(connection, sampleId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.getSample(connection, sampleId, callback);
        } else {
            sampleSQLDB.getSample(dbConfig, sampleId, callback);
        }
    }

    createSample(connection, dbConfig, sample, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.createSample(connection, sample, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.createSample(connection, sample, callback);
        } else {
            sampleSQLDB.createSample(dbConfig, sample, callback);
        }
    }

    updateSample(connection, dbConfig, sample, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.updateSample(connection, sample, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.updateSample(connection, sample, callback);
        } else {
            sampleSQLDB.updateSample(dbConfig, sample, callback);
        }
    }

    deleteSample(connection, dbConfig, sample, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.deleteSample(connection, sample, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.deleteSample(connection, sample, callback);
        } else {
            sampleSQLDB.deleteSample(dbConfig, sample, callback);
        }
    }

    updateProperties(connection, dbConfig, properties, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.updateProperties(connection, properties, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.updateProperties(connection, properties, callback);
        } else {
            sampleSQLDB.updateProperties(dbConfig, properties, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, sample, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.updateLineNumOnDel(connection, sample, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.updateLineNumOnDel(connection, sample, callback);
        } else {
            sampleSQLDB.updateLineNumOnDel(dbConfig, sample, callback);
        }
    }

    resetOrder(connection, dbConfig, sample, order, callback) {
        if (dbConfig.dbType === 'postgres') {
            samplePGDB.resetOrder(connection, sample, order, callback);
        } else if (dbConfig.dbType === 'oracle') {
            sampleODB.resetOrder(connection, sample, order, callback);
        } else {
            sampleSQLDB.resetOrder(dbConfig, sample, order, callback);
        }
    }
}

const sampleService = new IncludeSampleService();
module.exports = sampleService;
