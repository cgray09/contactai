var computeCharsPGDB = require('../db/postgres/computechars_db');
var computeCharsODB = require('../db/oracle/computechars_db');
var computeCharsSQLDB = require('../db/mssql/computechars_db');

class ComputeCharService {

    getCharacteristics(connection, dbConfig, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.getCharacteristics(connection, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.getCharacteristics(connection, page, callback);
        } else {
            computeCharsSQLDB.getCharacteristics(dbConfig, page, callback);
        }
    }

    getCharacteristic(connection, dbConfig, charId, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.getCharacteristic(connection, charId, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.getCharacteristic(connection, charId, page, callback);
        } else {
            computeCharsSQLDB.getCharacteristic(dbConfig, charId, page, callback);
        }
    }

    createCharacteristic(connection, dbConfig, char, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.createCharacteristic(connection, char, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.createCharacteristic(connection, char, page, callback);
        } else {
            computeCharsSQLDB.createCharacteristic(dbConfig, char, page, callback);
        }
    }

    /** used to create DS Char at the end of list (last linenum + 1) */
    createCharacteristicPromise(connection, dbConfig, char, page) {
        if (dbConfig.dbType === 'postgres') {
            return new Promise((resolve, reject) => {
                computeCharsPGDB.createCharacteristicEOL(connection, char, page, (char, error) => {
                    if (error) { reject(error); }
                    else { resolve(char); }
                });
            });
        } else if (dbConfig.dbType === 'oracle') {
            return new Promise((resolve, reject) => {
                computeCharsODB.createCharacteristicEOL(connection, char, page, (char, error) => {
                    if (error) { reject(error); }
                    else { resolve(char); }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                computeCharsSQLDB.createCharacteristicEOL(dbConfig, char, page, (char, error) => {
                    if (error) { reject(error); }
                    else { resolve(char); }
                });
            });
        }
    }

    updateCharacteristic(connection, dbConfig, char, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.updateCharacteristic(connection, char, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.updateCharacteristic(connection, char, page, callback);
        } else {
            computeCharsSQLDB.updateCharacteristic(dbConfig, char, page, callback);
        }
    }

    deleteCharacteristic(connection, dbConfig, char, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.deleteCharacteristic(connection, char, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.deleteCharacteristic(connection, char, page, callback);
        } else {
            computeCharsSQLDB.deleteCharacteristic(dbConfig, char, page, callback);
        }
    }

    updateInputChar(connection, dbConfig, char, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.updateInputChar(connection, char, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.updateInputChar(connection, char, page, callback);
        } else {
            computeCharsSQLDB.updateInputChar(dbConfig, char, page, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, char, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.updateLineNumOnDel(connection, char, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.updateLineNumOnDel(connection, char, page, callback);
        } else {
            computeCharsSQLDB.updateLineNumOnDel(dbConfig, char, page, callback);
        }
    }

    resetOrder(connection, dbConfig, char, order, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            computeCharsPGDB.resetOrder(connection, char, order, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            computeCharsODB.resetOrder(connection, char, order, page, callback);
        } else {
            computeCharsSQLDB.resetOrder(dbConfig, char, order, page, callback);
        }
    }
}

const computeCharService = new ComputeCharService();
module.exports = computeCharService;
