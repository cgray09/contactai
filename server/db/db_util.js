const postgresDB = 'postgres';
const mssqlDB = 'sqlserver';
const oracleDB = 'oracle';

var log = require('../logger')(module);
var moment = require('moment');
const { externalAuth } = require('oracledb');
var pgp = require('pg-promise')();
var types = pgp.pg.types;
types.setTypeParser(1114, str => moment.utc(str).format());

var TDConnection = require('tedious').Connection;
var oracledb = require('oracledb');

var connection = null;
var mssqlConfig = null;

class DbUtil {

    getConnection(dbConfig) {
        if (dbConfig.dbType === postgresDB) {
            var config = 'postgres://' + dbConfig.dbUser + ':' + dbConfig.dbPass + '@' + dbConfig.dbHost +
                ':' + dbConfig.dbPort + '/' + dbConfig.dbName;
            connection = pgp(config);
        }

        if (dbConfig.dbType === mssqlDB) {
            var authentication = null;
            if (dbConfig.dbDomain) {
                authentication = {
                    type: 'ntlm',
                    options: {
                        userName: dbConfig.dbUser,
                        password: dbConfig.dbPass,
                        domain: dbConfig.dbDomain
                    }
                }
            } else {
                authentication = {
                    type: 'default',
                    options: {
                        userName: dbConfig.dbUser,
                        password: dbConfig.dbPass
                    }
                }
            }
            mssqlConfig = {
                server: dbConfig.dbHost,
                authentication: authentication,
                options: {
                    database: dbConfig.dbName,
                    port: parseInt(dbConfig.dbPort),
                    trustedConnection: true,
                    rowCollectionOnRequestCompletion: true,
                    encrypt: true,
                    trustServerCertificate: true,
                    validateBulkLoadParameters: false
                }
            }
            connection = new TDConnection(mssqlConfig);
        }

        if (dbConfig.dbType == oracleDB) {
            var config = {};
            if(dbConfig.realmName) {
                config = {
                    connectString: dbConfig.dbHost + ':' + dbConfig.dbPort + '/' + dbConfig.dbSid,
                    externalAuth: true
                };
            
            } else {
                config = {
                    user: dbConfig.dbUser,
                    password: dbConfig.dbPass,
                    connectString: dbConfig.dbHost + ':' + dbConfig.dbPort + '/' + dbConfig.dbSid
                }
            }
            oracledb.fetchAsString = [ oracledb.CLOB ];
            connection = oracledb.getConnection(config);
        }
        return connection;
    }

    closeConnection(dbConfig, connection) {
        if (dbConfig.dbType === postgresDB) {
            pgp.end();
        }
        if (dbConfig.dbType === oracleDB || dbConfig.dbType == mssqlDB) {
            connection.close();
        }
        log.info('DB connection closed successfully');
    }

    getMssqlConfig () {
        return mssqlConfig;
    }

}

const dbUtil = new DbUtil();
module.exports = dbUtil;
