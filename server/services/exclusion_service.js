var exclusionPGDB = require('../db/postgres/exclusions_db');
var exclusionODB = require('../db/oracle/exclusions_db');
var exclusionSQLDB = require('../db/mssql/exclusions_db');
const { log } = require('winston');

class ExclusionService {

    getDefinitions(connection, dbConfig, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            exclusionPGDB.getDefinitions(connection, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            exclusionODB.getDefinitions(connection, page, callback);
        } else {
            exclusionSQLDB.getDefinitions(dbConfig, page, callback);
        }
    }

    createDefinitionPromise(connection, dbConfig, def, page) {
        if (dbConfig.dbType === 'postgres') {
            return new Promise((resolve, reject) => {
                exclusionPGDB.createDefinition(connection, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else if (dbConfig.dbType === 'oracle') {
            return new Promise((resolve, reject) => {
                exclusionODB.createDefinition(connection, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                exclusionSQLDB.createDefinition(dbConfig, def, page, (createdDef, error) => {
                    if (error) { reject(error); } 
                    else { resolve(createdDef); }
                });
            });
        }
    }

    createDefinition(connection, dbConfig, def, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            exclusionPGDB.createDefinition(connection, def, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            exclusionODB.createDefinition(connection, def, page, callback);
        } else {
            exclusionSQLDB.createDefinition(dbConfig, def, page, callback);
        }
    }

    deleteDefinitions(connection, dbConfig, page, callback) {
        if (dbConfig.dbType === 'postgres') {
            exclusionPGDB.deleteDefinitions(connection, page, callback);
        } else if (dbConfig.dbType === 'oracle') {
            exclusionODB.deleteDefinitions(connection, page, callback);
        } else {
            exclusionSQLDB.deleteDefinitions(dbConfig, page, callback);
        }
    }
}

const exclusionService = new ExclusionService();
module.exports = exclusionService;
