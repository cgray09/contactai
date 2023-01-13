var envPGDB = require('../db/postgres/env_db');
var envODB = require('../db/oracle/env_db');
var envSQLDB = require('../db/mssql/env_db');

class EnvService {

    getEnvs(connection, dbConfig, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.getEnvs(connection, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.getEnvs(connection, callback);
        } else {
            envSQLDB.getEnvs(dbConfig, callback);
        }
    }

    getEnv(connection, dbConfig, envId, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.getEnv(connection, envId, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.getEnv(connection, envId, callback);
        } else {
            envSQLDB.getEnv(dbConfig, envId, callback);
        }
    }

    createEnv(connection, dbConfig, env, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.createEnv(connection, env, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.createEnv(connection, env, callback);
        } else {
            envSQLDB.createEnv(dbConfig, env, callback);
        }
    }

    updateEnv(connection, dbConfig, env, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.updateEnv(connection, env, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.updateEnv(connection, env, callback);
        } else {
            envSQLDB.updateEnv(dbConfig, env, callback);
        }
    }

    activateEnv(connection, dbConfig, env, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.activateEnv(connection, env, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.activateEnv(connection, env, callback);
        } else {
            envSQLDB.activateEnv(dbConfig, env, callback);
        }
    }

    deleteEnv(connection, dbConfig, env, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.deleteEnv(connection, env, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.deleteEnv(connection, env, callback);
        } else {
            envSQLDB.deleteEnv(dbConfig, env, callback);
        }
    }

    updateLineNumOnDel(connection, dbConfig, env, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.updateLineNumOnDel(connection, env, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.updateLineNumOnDel(connection, env, callback);
        } else {
            envSQLDB.updateLineNumOnDel(dbConfig, env, callback);
        }
    }

    resetOrder(connection, dbConfig, env, order, callback) {
        if (dbConfig.dbType === 'postgres') {
            envPGDB.resetOrder(connection, env, order, callback);
        } else if (dbConfig.dbType === 'oracle') {
            envODB.resetOrder(connection, env, order, callback);
        } else {
            envSQLDB.resetOrder(dbConfig, env, order, callback);
        }
    }
}

const envService = new EnvService();
module.exports = envService;
