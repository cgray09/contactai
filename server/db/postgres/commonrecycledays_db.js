var log = require('../../logger')(module);

class CommonRecycleDayPGDB {

    convertCommonRecycleDay(element) {
        var commonRecycleDay = {};
        commonRecycleDay.id = element.PKEY_ID;
        commonRecycleDay.description = element.DESCRIPTION;
        commonRecycleDay.recycleOn = element.RECYCLE_ON;
        return commonRecycleDay;
    }

    getCommonRecycleDaysOB(results) {
        if (Array.isArray(results)) {
            var commonRecycleDays = [];
            results.forEach(element => {
                commonRecycleDays.push(this.convertCommonRecycleDay(element));
            });
            return commonRecycleDays;
        } else {
            return this.convertCommonRecycleDay(results);
        }
    }

    getCommonRecycleDays(db, callback) {
        db.any('SELECT * FROM COMMON_RECYCLE_DAYS')
            .then((results) => {
                var commonRecycleDays = this.getCommonRecycleDaysOB(results);
                callback(commonRecycleDays, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createCommonRecycleDays(db, commonRecycleDays, callback) {
        if (commonRecycleDays !== null) {
            var sqlStr = 'INSERT INTO COMMON_RECYCLE_DAYS ("PKEY_ID", "DESCRIPTION", "RECYCLE_ON") ' +
                'VALUES (NEXTVAL(\'"COMMON_RECYCLE_DAYS_SEQ"\'), $1, $2)';
            db.tx(t => {
                const queries = commonRecycleDays.map(x => {
                    var data = [x.description, x.recycleOn];
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

    deleteCommonRecycleDays(db, callback) {
        log.info('Deleting commonRecycleDays... ');
        db.any('DELETE FROM COMMON_RECYCLE_DAYS RETURNING *')
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

}

const commonRecycleDayPGDB = new CommonRecycleDayPGDB();
module.exports = commonRecycleDayPGDB;