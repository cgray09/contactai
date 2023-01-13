var subprocPGDB = require('../db/postgres/compute_subproc_db');
var subprocODB = require('../db/oracle/compute_subproc_db');
var subprocSQLDB = require('../db/mssql/compute_subproc_db');

class SubProcService {
    
    getDefinitionsByRef(connection, dbConfig, charDefName, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            subprocPGDB.getDefinitionByRef(connection, charDefName, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            subprocODB.getDefinitionByRef(connection, charDefName, page, callback);
        } else {
            subprocSQLDB.getDefinitionByRef(dbConfig, charDefName, page, callback);
        }
    }

    createDefinitionPromise(connection, dbConfig, charDefName, def, page) {
        if (dbConfig.dbType === 'postgres') {
            return new Promise((resolve, reject) => {
                subprocPGDB.createDefinition(connection, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else if (dbConfig.dbType === 'oracle') {
            return new Promise((resolve, reject) => {
                subprocODB.createDefinition(connection, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                subprocSQLDB.createDefinition(dbConfig, charDefName, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        }
    }

    createDefinition(connection, dbConfig, charDefName, def, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            subprocPGDB.createDefinition(connection, charDefName, def, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            subprocODB.createDefinition(connection, charDefName, def, page, callback);
        } else {
            subprocSQLDB.createDefinition(dbConfig, charDefName, def, page, callback);
        }
    }

    updateDefinition(connection, dbConfig, def, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            subprocPGDB.updateDefinition(connection, def, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            subprocODB.updateDefinition(connection, def, page, callback);
        } else {
            subprocSQLDB.updateDefinition(dbConfig, def, page, callback);
        }
    }

    deleteDefinitionsByRef(connection, dbConfig, charDefName, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            subprocPGDB.deleteDefinitionByRef(connection, charDefName, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            subprocODB.deleteDefinitionByRef(connection, charDefName, page, callback);
        } else {
            subprocSQLDB.deleteDefinitionByRef(dbConfig, charDefName, page, callback);
        }
    }    
}

const subprocService = new SubProcService();
module.exports = subprocService;
