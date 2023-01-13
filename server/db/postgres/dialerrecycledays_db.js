var log = require('../../logger')(module);

class DialerRecycleDayPGDB {

    convertDialerRecycleDay(element) {
        var dialerRecycleDay = {};
        dialerRecycleDay.id = element.PKEY_ID;
        dialerRecycleDay.description = element.DESCRIPTION;
        dialerRecycleDay.dialerName = element.DIALER_NAME;
        dialerRecycleDay.recycleOn = element.RECYCLE_ON;
        return dialerRecycleDay;
    }

    getDialerRecycleDaysOB(results) {
        if (Array.isArray(results)) {
            var dialerRecycleDays = [];
            results.forEach(element => {
                dialerRecycleDays.push(this.convertDialerRecycleDay(element));
            });
            return dialerRecycleDays;
        } else {
            return this.convertDialerRecycleDay(results);
        }
    }

    getDialerRecycleDays(db, dialer, callback) {
        db.any('SELECT * FROM DIALER_RECYCLE_DAYS WHERE "DIALER_NAME" = $1', dialer.name)
            .then((results) => {
                var dialerRecycleDays = this.getDialerRecycleDaysOB(results);
                callback(dialerRecycleDays, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createDialerRecycleDays(db, dialerRecycleDays, dialer, callback) {
        if (dialerRecycleDays !== null) {
            var sqlStr = 'INSERT INTO DIALER_RECYCLE_DAYS ("PKEY_ID", "DESCRIPTION", "DIALER_NAME", "RECYCLE_ON") ' +
                'VALUES (NEXTVAL(\'"DIALER_RECYCLE_DAYS_SEQ"\'), $1, $2, $3)';
            db.tx(t => {
                const queries = dialerRecycleDays.map(x => {
                    var data = [x.description, dialer.name, x.recycleOn];
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

    deleteDialerRecycleDays(db, dialer, callback) {
        log.info('Deleting dialer  recycleDays... ');
        db.any('DELETE FROM DIALER_RECYCLE_DAYS WHERE "DIALER_NAME" = $1 RETURNING *', dialer.name)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

}

const dialerRecycleDayPGDB = new DialerRecycleDayPGDB();
module.exports = dialerRecycleDayPGDB;