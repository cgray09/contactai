var fileFormatPGDB = require('../db/postgres/fileformat_db');
var fileFormatODB = require('../db/oracle/fileformat_db');
var fileFormatSQLDB = require('../db/mssql/fileformat_db');

class FileFormatService {

    getFileFormats(connection, dbConfig, dialerId, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.getFileFormats(connection, dialerId, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.getFileFormats(connection, dialerId, page, callback);
        } else {
            fileFormatSQLDB.getFileFormats(dbConfig, dialerId, page, callback);
        }
    }

    getFileFormat(connection, dbConfig, fileFormatId, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.getFileFormat(connection, fileFormatId, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.getFileFormat(connection, fileFormatId, page, callback);
        } else {
            fileFormatSQLDB.getFileFormat(dbConfig, fileFormatId, page, callback);
        }
    }

    createFileFormat(connection, dbConfig, fileFormat, dialerId, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.createFileFormat(connection, fileFormat, dialerId, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.createFileFormat(connection, fileFormat, dialerId, page, callback);
        } else {
            fileFormatSQLDB.createFileFormat(dbConfig, fileFormat, dialerId, page, callback);
        }
    }

    updateFileFormat(connection, dbConfig, fileFormat, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.updateFileFormat(connection, fileFormat, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.updateFileFormat(connection, fileFormat, page, callback);
        } else {
            fileFormatSQLDB.updateFileFormat(dbConfig, fileFormat, page, callback);
        }
    }

    deleteFileFormat(connection, dbConfig, fileFormat, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.deleteFileFormat(connection, fileFormat, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.deleteFileFormat(connection, fileFormat, page, callback);
        } else {
            fileFormatSQLDB.deleteFileFormat(dbConfig, fileFormat, page, callback);
        }
    }

    deleteFileFormats(connection, dbConfig, dialerId, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.deleteFileFormats(connection, dialerId, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.deleteFileFormats(connection, dialerId, page, callback);
        } else {
            fileFormatSQLDB.deleteFileFormats(dbConfig, dialerId, page, callback);
        }
    }

    importFileFormats(connection, dbConfig, fileFormats, dialerId, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.importFileFormats(connection, fileFormats, dialerId, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.importFileFormats(connection, fileFormats, dialerId, page, callback);
        } else {
            fileFormatSQLDB.importFileFormats(dbConfig, fileFormats, dialerId, page, callback);
        }
    }

    getProperties(connection, dbConfig, dialerId, propIds, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.getProperties(connection, dialerId, propIds, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.getProperties(connection, dialerId, propIds, page, callback);
        } else {
            fileFormatSQLDB.getProperties(dbConfig, dialerId, propIds, page, callback);
        }
    }

    createProperties(connection, dbConfig, dialerId, properties, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.createProperties(connection, dialerId, properties, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.createProperties(connection, dialerId, properties, page, callback);
        } else {
            fileFormatSQLDB.createProperties(dbConfig, dialerId, properties, page, callback);
        }
    }
    
    updateProperties(connection, dbConfig, properties, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.updateProperties(connection, properties, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.updateProperties(connection, properties, page, callback);
        } else {
            fileFormatSQLDB.updateProperties(dbConfig, properties, page, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, fileFormat, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.updateLineNumOnDel(connection, fileFormat, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.updateLineNumOnDel(connection, fileFormat, page, callback);
        } else {
            fileFormatSQLDB.updateLineNumOnDel(dbConfig, fileFormat, page, callback);
        }
    }

    resetOrder(connection, dbConfig, fileFormat, order, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.resetOrder(connection, fileFormat, order, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.resetOrder(connection, fileFormat, order, page, callback);
        } else {
            fileFormatSQLDB.resetOrder(dbConfig, fileFormat, order, page, callback);
        }
    }

    deleteAllDialerFileFormats(connection, dbConfig, dialerId, callback) {
        if (dbConfig.dbType === 'postgres') {
            fileFormatPGDB.deleteAllDialerFileFormats(connection, dialerId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            fileFormatODB.deleteAllDialerFileFormats(connection, dialerId, callback);
        } else {
            fileFormatSQLDB.deleteAllDialerFileFormats(dbConfig, dialerId, callback);
        }
    }
}

const fileFormatService = new FileFormatService();
module.exports = fileFormatService;
