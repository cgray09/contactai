var segmentpopPGDB = require('../db/postgres/segmentpop_db');
var segmentpopODB = require('../db/oracle/segmentpop_db');
var segmentpopSQLDB = require('../db/mssql/segmentpop_db');

class SegmentPopService {

    getSegmentPops(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.getSegmentPops(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.getSegmentPops(connection, callback);
        } else {
            segmentpopSQLDB.getSegmentPops(dbConfig, callback);
        }
    }

    getSegmentPop(connection, dbConfig, segmentpopId, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.getSegmentPop(connection, segmentpopId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.getSegmentPop(connection, segmentpopId, callback);
        } else {
            segmentpopSQLDB.getSegmentPop(dbConfig, segmentpopId, callback);
        }
    }

    createSegmentPop(connection, dbConfig, segmentpop, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.createSegmentPop(connection, segmentpop, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.createSegmentPop(connection, segmentpop, callback);
        } else {
            segmentpopSQLDB.createSegmentPop(dbConfig, segmentpop, callback);
        }
    }

    updateSegmentPop(connection, dbConfig, segmentpop, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.updateSegmentPop(connection, segmentpop, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.updateSegmentPop(connection, segmentpop, callback);
        } else {
            segmentpopSQLDB.updateSegmentPop(dbConfig, segmentpop, callback);
        }
    }

    deleteSegmentPop(connection, dbConfig, segmentpop, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.deleteSegmentPop(connection, segmentpop, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.deleteSegmentPop(connection, segmentpop, callback);
        } else {
            segmentpopSQLDB.deleteSegmentPop(dbConfig, segmentpop, callback);
        }
    }

    updateProperties(connection, dbConfig, properties, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.updateProperties(connection, properties, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.updateProperties(connection, properties, callback);
        } else {
            segmentpopSQLDB.updateProperties(dbConfig, properties, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, segmentpop, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.updateLineNumOnDel(connection, segmentpop, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.updateLineNumOnDel(connection, segmentpop, callback);
        } else {
            segmentpopSQLDB.updateLineNumOnDel(dbConfig, segmentpop, callback);
        }
    }

    resetOrder(connection, dbConfig, segmentpop, order, callback) {
        if (dbConfig.dbType === 'postgres') {
            segmentpopPGDB.resetOrder(connection, segmentpop, order, callback);
        } else if (dbConfig.dbType === 'oracle') {
            segmentpopODB.resetOrder(connection, segmentpop, order, callback);
        } else {
            segmentpopSQLDB.resetOrder(dbConfig, segmentpop, order, callback);
        }
    }
}

const segmentpopService = new SegmentPopService();
module.exports = segmentpopService;
