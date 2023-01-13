var log = require('../../logger')(module);

class TrackUserODB {

    create(connection, userName, message, ipAddress, callback) {
        connection.then((conn) => {
            var data = [
                userName, 1, message, new Date(), ipAddress
            ];
            var sqlStr = 'INSERT INTO TRACK_USER_LOGINS (USER_ID, CLIENT, MESSAGE, TIMESTAMP, IP_ADDR) ' +
                'VALUES ((SELECT ID FROM USER_DB_BEAN WHERE USER_NAME = :1), :2, :3, :4, :5 )';

            conn.execute(sqlStr, data, { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(false, error);
                } else {
                    callback(true, null);
                }
            });
        });
    }
}

const trackUserODB = new TrackUserODB();
module.exports = trackUserODB;