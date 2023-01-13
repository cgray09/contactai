var log = require('../../logger')(module);

class BadDayPGDB {

    epochToDateString(epoch) {            
        var date = new Date(epoch * 86400 * 1000);
        var str =  (date.getFullYear() + '' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '' + ((date.getDate() > 8) ? (date.getDate() + 1) : ('0' + (date.getDate() + 1))));       
        return str;
    }
    
    convertBadDay(element) {
        var badDay = {};
        badDay.badDay = this.epochToDateString(element.BAD_DAY);
        badDay.dialerName = element.DIALER_NAME;
        return badDay;
    }

    getBadDaysOB(results) {
        if (Array.isArray(results)) {
            var badDays = [];
            results.forEach(element => {
                badDays.push(this.convertBadDay(element));
            });
            return badDays;
        } else {
            return this.convertBadDay(results);
        }
    }

    getBadDays(db, dialer, callback) {
        db.any('SELECT * FROM BAD_DAYS WHERE "DIALER_NAME" IN (\'all\', $1)', dialer.name)
            .then((results) => {
                var badDays = this.getBadDaysOB(results);
                callback(badDays, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getDialerBadDays(db, dialer, callback) {
        db.any('SELECT * FROM BAD_DAYS WHERE "DIALER_NAME" = $1', dialer.name)
            .then((results) => {
                var badDays = this.getBadDaysOB(results);
                callback(badDays, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createBadDays(db, badDays, callback) {
        if (badDays !== null) {
            var sqlStr = 'INSERT INTO BAD_DAYS ("BAD_DAY", "DIALER_NAME") VALUES ($1, $2)';
            db.tx(t => {
                const queries = badDays.map(x => {
                    var data = [ x.badDay, x.dialerName];
                    return t.none(sqlStr, data);
                });
                return t.batch(queries);
            })
                .then((results) => {
                    callback(null, null);
                })
                .catch(error => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteBadDays(db, dialer, callback) {
        log.info('Deleting badDays... ');
        db.any('DELETE FROM BAD_DAYS WHERE "DIALER_NAME" IN (\'all\', $1) RETURNING *', dialer.name)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }
    
    deleteDialerBadDays(db, dialer, callback) {
        log.info('Deleting badDays... ');
        db.any('DELETE FROM BAD_DAYS WHERE "DIALER_NAME" = $1 RETURNING *', dialer.name)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }  
}

const badDayPGDB = new BadDayPGDB();
module.exports = badDayPGDB;