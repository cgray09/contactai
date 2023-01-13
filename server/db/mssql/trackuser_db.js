var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class TrackUserSQLDB {

    create(config, userName, message, ipAddress, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'INSERT INTO TRACK_USER_LOGINS (USER_ID, CLIENT, MESSAGE, TIMESTAMP, IP_ADDR) ' +
                    'VALUES ((SELECT ID FROM USER_DB_BEAN WHERE USER_NAME = @name), @client, @msg, @time, @ipAddr)';

                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(false, error);
                    } else {
                        callback(true, null);
                    }
                    conn.close();
                });

                request.addParameter('name', TYPES.VarChar, userName);
                request.addParameter('client', TYPES.Int, 1);
                request.addParameter('msg', TYPES.VarChar, message);
                request.addParameter('time', TYPES.DateTime, new Date());
                request.addParameter('ipAddr', TYPES.VarChar, ipAddress);

                conn.execSql(request);
            }
        });
    }
}

const trackSQLDB = new TrackUserSQLDB();
module.exports = trackSQLDB;