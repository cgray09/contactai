var discretizePGDB = require('../db/postgres/compute_discretize_db');
var discretizeODB = require('../db/oracle/compute_discretize_db');
var discretizeSQLDB = require('../db/mssql/compute_discretize_db');

class DescretizeService {

    getDefinitionsByRef(connection, dbConfig, charDefName, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            discretizePGDB.getDefinitionsByRef(connection, charDefName, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            discretizeODB.getDefinitionsByRef(connection, charDefName, page, callback);
        } else {
            discretizeSQLDB.getDefinitionsByRef(dbConfig, charDefName, page, callback);
        }
    }

    createDefinitionPromise(connection, dbConfig, charDefName, def, page) {
        if (dbConfig.dbType === 'postgres') {
            return new Promise((resolve, reject) => {
                discretizePGDB.createDefinition(connection, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else if (dbConfig.dbType === 'oracle') {
            return new Promise((resolve, reject) => {
                discretizeODB.createDefinition(connection, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                discretizeSQLDB.createDefinition(dbConfig, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        }
    }

    createDefinition(connection, dbConfig, charDefName, def, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            discretizePGDB.createDefinition(connection, charDefName, def, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            discretizeODB.createDefinition(connection, charDefName, def, page, callback);
        } else {
            discretizeSQLDB.createDefinition(dbConfig, charDefName, def, page, callback);
        }
    }

    deleteDefinitionsByRef(connection, dbConfig, charDefName, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            discretizePGDB.deleteDefinitionsByRef(connection, charDefName, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            discretizeODB.deleteDefinitionsByRef(connection, charDefName, page, callback);
        } else {
            discretizeSQLDB.deleteDefinitionsByRef(dbConfig, charDefName, page, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, charDefName, def, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            discretizePGDB.updateLineNumOnDel(connection, charDefName, def, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            discretizeODB.updateLineNumOnDel(connection, charDefName, def, page, callback);
        } else {
            discretizeSQLDB.updateLineNumOnDel(dbConfig, charDefName, def, page, callback);
        }
    }
}

const descretizeService = new DescretizeService();
module.exports = descretizeService;
