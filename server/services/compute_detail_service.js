var detailPGDB = require('../db/postgres/compute_detail_db');
var detailODB = require('../db/oracle/compute_detail_db');
var detailSQLDB = require('../db/mssql/compute_detail_db');

class DetailService {
    
    getDefinitionsByRef(connection, dbConfig, charDefName, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            detailPGDB.getDefinitionsByRef(connection, charDefName, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            detailODB.getDefinitionsByRef(connection, charDefName, page, callback);
        } else {
            detailSQLDB.getDefinitionsByRef(dbConfig, charDefName, page, callback);
        }
    }

    createDefinitionPromise(connection, dbConfig, charDefName, def, page) {
        if (dbConfig.dbType === 'postgres') {
            return new Promise((resolve, reject) => {
                detailPGDB.createDefinition(connection, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else if (dbConfig.dbType === 'oracle') {
            return new Promise((resolve, reject) => {
                detailODB.createDefinition(connection, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                detailSQLDB.createDefinition(dbConfig, charDefName, def, page, (createdDef, error) => {
                    if (error) { console.log('Error occured:' + error); reject(error); } 
                    else { console.log('Created def:' + createdDef); resolve(createdDef); }
                });
            });
        }
    }

    createDefinition(connection, dbConfig, charDefName, def, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            detailPGDB.createDefinition(connection, charDefName, def, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            detailODB.createDefinition(connection, charDefName, def, page, callback);
        } else {
            detailSQLDB.createDefinition(dbConfig, charDefName, def, page, callback);
        }
    }

    createDefinitions(connection, dbConfig, defs, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            detailPGDB.createDefinitions(connection, defs, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            detailODB.createDefinitions(connection, defs, page, callback);
        } else {
            detailSQLDB.createDefinitions(dbConfig, defs, page, callback);
        }
    }

    deleteDefinitionsByRef(connection, dbConfig, charDefName, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            detailPGDB.deleteDefinitionsByRef(connection, charDefName, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            detailODB.deleteDefinitionsByRef(connection, charDefName, page, callback);
        } else {
            detailSQLDB.deleteDefinitionsByRef(dbConfig, charDefName, page, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, charDefName, def, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            detailPGDB.updateLineNumOnDel(connection, charDefName, def, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            detailODB.updateLineNumOnDel(connection, charDefName, def, page, callback);
        } else {
            detailSQLDB.updateLineNumOnDel(dbConfig, charDefName, def, page, callback);
        }
    }
}

const detailService = new DetailService();
module.exports = detailService;
