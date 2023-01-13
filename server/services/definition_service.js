var definitionPGDB = require('../db/postgres/definitions_db');
var definitionODB = require('../db/oracle/definitions_db');
var definitionSQLDB = require('../db/mssql/definitions_db');

class DefinitionService {

    //---------------------------CALL RESULT -> STANDARDIZE DATA -> DEFINITIONS -------------------------------------------------------------
    
    getDefinitionsByRef(connection, dbConfig, ref, callback) {
        if (dbConfig.dbType === 'postgres') {
            definitionPGDB.getDefinitionsByRef(connection, ref, callback);
        } else if (dbConfig.dbType === 'oracle') {
            definitionODB.getDefinitionsByRef(connection, ref, callback);
        } else {
            definitionSQLDB.getDefinitionsByRef(dbConfig, ref, callback);
        }
    }

    getDefinition(connection, dbConfig, defId, callback) {
        if (dbConfig.dbType === 'postgres') {
            definitionPGDB.getDefinition(connection, defId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            definitionODB.getDefinition(connection, defId, callback);
        } else {
            definitionSQLDB.getDefinition(dbConfig, defId, callback);
        }
    }

    createDefinitionPromise(connection, dbConfig, def) {
        if (dbConfig.dbType === 'postgres') {
            return new Promise((resolve, reject) => {
                definitionPGDB.createDefinition(connection, def, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else if (dbConfig.dbType === 'oracle') {
            return new Promise((resolve, reject) => {
                definitionODB.createDefinition(connection, def, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                definitionSQLDB.createDefinition(dbConfig, def, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        }
    }

    createDefinition(connection, dbConfig, def, callback) {
        if (dbConfig.dbType === 'postgres') {
            definitionPGDB.createDefinition(connection, def, callback);
        } else if (dbConfig.dbType === 'oracle') {
            definitionODB.createDefinition(connection, def, callback);
        } else {
            definitionSQLDB.createDefinition(dbConfig, def, callback);
        }
    }

    updateDefinition(connection, dbConfig, def, callback) {
        if (dbConfig.dbType === 'postgres') {
            definitionPGDB.updateDefinition(connection, def, callback);
        } else if (dbConfig.dbType === 'oracle') {
            definitionODB.updateDefinition(connection, def, callback);
        } else {
            definitionSQLDB.updateDefinition(dbConfig, def, callback);
        }
    }

    deleteDefinition(connection, dbConfig, def, callback) {
        if (dbConfig.dbType === 'postgres') {
            definitionPGDB.deleteDefinition(connection, def, callback);
        } else if (dbConfig.dbType === 'oracle') {
            definitionODB.deleteDefinition(connection, def, callback);
        } else {
            definitionSQLDB.deleteDefinition(dbConfig, def, callback);
        }
    }

    deleteDefinitionsByRef(connection, dbConfig, ref, callback) {
        if (dbConfig.dbType === 'postgres') {
            definitionPGDB.deleteDefinitionsByRef(connection, ref, callback);
        } else if (dbConfig.dbType === 'oracle') {
            definitionODB.deleteDefinitionsByRef(connection, ref, callback);
        } else {
            definitionSQLDB.deleteDefinitionsByRef(dbConfig, ref, callback);
        }
    }
}

const definitionService = new DefinitionService();
module.exports = definitionService;
