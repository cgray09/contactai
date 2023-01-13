const request = require("request");

var trackUserPGDB = require('../db/postgres/trackuser_db');
var trackUserODB = require('../db/oracle/trackuser_db');
var trackUserSQLDB = require('../db/mssql/trackuser_db');

class TrackUserService {

    create(connection, dbConfig, userName, message, ipAddr, callback) {
        if (dbConfig.dbType === 'postgres') {
            trackUserPGDB.create(connection, userName, message, ipAddr, callback);
        } else if (dbConfig.dbType === 'oracle') {
            trackUserODB.create(connection, userName, message, ipAddr, callback);
        } else {
            trackUserSQLDB.create(dbConfig, userName, message, ipAddr, callback);
        }
    }

}

const trackUserSrvc = new TrackUserService();
module.exports = trackUserSrvc;