var log = require('../../logger')(module);

class DialerPGDB {

    convertDialer(element) {
        var dialer = {};
        dialer.id = element.PKEY_ID;
        dialer.description = element.DESCRIPTION;
        dialer.name = element.DIALER_NAME;
        dialer.timezone = element.SITE_TIME_ZONE;
        dialer.sunday = element.SUNDAY;
        dialer.monday = element.MONDAY;
        dialer.tuesday = element.TUESDAY;
        dialer.wednesday = element.WEDNESDAY;
        dialer.thursday = element.THURSDAY;
        dialer.friday = element.FRIDAY;
        dialer.saturday = element.SATURDAY;
        dialer.city = element.DIALER_CITY;
        dialer.dst = element.DST_FLAG;
        dialer.dialerId = element.DIALER_ID; // pkey_id from DIALER table
        return dialer;
    }

    getDialersOB(results) {
        if (Array.isArray(results)) {
            var dialers = [];
            results.forEach(element => {
                dialers.push(this.convertDialer(element));
            });
            return dialers;
        } else {
            return this.convertDialer(results);
        }
    }

    getDialers(db, callback) {
        var sqlStr = 'SELECT I.*, D."PKEY_ID" AS "DIALER_ID" FROM DIALER_INFO I ' + 
        'RIGHT OUTER JOIN DIALER D ON I."DIALER_NAME" = D."NAME" ORDER BY I."DIALER_NAME"';
    
        db.any(sqlStr)
            .then((results) => {
                var dialers = this.getDialersOB(results);
                callback(dialers, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getDialer(db, dialerId, callback) {
        var sqlStr = 'SELECT I.*, D."PKEY_ID" AS "DIALER_ID" FROM DIALER_INFO I, DIALER D ' + 
                    'WHERE I."DIALER_NAME" = D."NAME" AND I."PKEY_ID" = $1';
                
        db.one(sqlStr, dialerId)
            .then((results) => {
                var dialer = this.getDialersOB(results);
                callback(dialer, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createDialer(db, dialer, callback) {
        log.info('Creating dialer...');
        if (dialer !== null) {
            var sqlStr = 'INSERT INTO DIALER_INFO ("PKEY_ID", "DESCRIPTION", "DIALER_NAME", "SITE_TIME_ZONE", "SUNDAY", "MONDAY", "TUESDAY", ' + 
                '"WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "DIALER_CITY", "DST_FLAG") ' +
                'VALUES (NEXTVAL(\'"DIALER_INFO_SEQ"\'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';

            var data = [dialer.description, dialer.name, dialer.timezone, dialer.sunday, dialer.monday, dialer.tuesday,
                dialer.wednesday, dialer.thursday, dialer.friday, dialer.saturday, dialer.city, dialer.dst];
            
                db.one(sqlStr, data)
                .then((results) => {
                    
                    var addedDialer = this.getDialersOB(results);
                    sqlStr = 'INSERT INTO DIALER ("PKEY_ID", "DIALER_DESCRIPTION", "NAME") VALUES (NEXTVAL(\'"DIALER_SEQ"\'), $1, $2) RETURNING "PKEY_ID"';
                    data = [dialer.description, dialer.name];
    
                    db.one(sqlStr, data)
                    .then((results) => {
                        console.log('RESULTS: ' + JSON.stringify(results));
                        addedDialer.dialerId = results.PKEY_ID;
                        callback(addedDialer, null);
                    })
                    .catch((error) => {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    });
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateDialer(db, dialer, callback) {
        log.info('Updating dialer with id:' + dialer.id);
       
        if (dialer !== null) {
            var sqlStr = 'UPDATE DIALER_INFO SET "DESCRIPTION" = $1, "DIALER_NAME" = $2, "SITE_TIME_ZONE" = $3, "SUNDAY" = $4, "MONDAY" = $5, ' +
            '"TUESDAY" = $6, "WEDNESDAY" = $7, "THURSDAY" = $8, "FRIDAY" = $9, "SATURDAY" = $10, "DIALER_CITY" = $11, "DST_FLAG"  = $12 WHERE "PKEY_ID" = $13 RETURNING *';

            var data = [dialer.description, dialer.name, dialer.timezone, dialer.sunday, dialer.monday, dialer.tuesday,
                dialer.wednesday, dialer.thursday, dialer.friday, dialer.saturday, dialer.city, dialer.dst, dialer.id];

                db.one(sqlStr, data)
                .then((results) => {
                    var updatedDialer = this.getDialersOB(results);
                   
                    sqlStr = 'UPDATE DIALER SET  "DIALER_DESCRIPTION" = $1, "NAME" = $2 WHERE "PKEY_ID" = $3 RETURNING "PKEY_ID"';
                    data = [dialer.description, dialer.name, dialer.dialerId];
    
                    db.one(sqlStr, data)
                    .then((results) => {
                        callback(updatedDialer, null);
                    })
                    .catch((error) => {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    });
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteDialer(db, dialer, callback) {
        log.info('Deleting dialer with id:' + dialer.id);
 
        var sqlStr = 'DELETE FROM DIALER_INFO WHERE "PKEY_ID" = $1; ' + 
                'DELETE FROM DIALER WHERE "PKEY_ID" = $2 RETURNING "PKEY_ID"';

        db.one(sqlStr, [dialer.id, dialer.dialerId])
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }
}

const dialerPGDB = new DialerPGDB();
module.exports = dialerPGDB;