var log = require('../../logger')(module);

class TrackUserPGDB {

    create(db, userName, message, ipAddress, callback) {
        var data = [
            userName, 1, message, new Date(), ipAddress
        ];
        db.one('INSERT INTO TRACK_USER_LOGINS (USER_ID, CLIENT, MESSAGE, TIMESTAMP, IP_ADDR) ' +
            'VALUES ((SELECT ID FROM USER_DB_BEAN WHERE USER_NAME = $1), $2, $3, $4, $5 ' +
            ') RETURNING *', data)
            .then((results) => {
                callback(true, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(false, error);
            });

    }
}

const trackUserPGDB = new TrackUserPGDB();
module.exports = trackUserPGDB;