var log = require('../../logger')(module);

class TimePeriodPGDB {

    convertPeriod(element) {
        var period = {};
        period.id = element.PKEY_ID;
        period.description = element.DESCRIPTION;
        period.day = element.DAY;
        period.lineNum = element.LINE_NUM;
        period.seconds = element.SECONDS;
        period.time = element.TIME;
        period.sc = element.SC;
        log.debug("Newly modeled time period object:");
        log.debug(JSON.stringify(period));
        return period;
    }

    getPeriodsOB(results) {
        if (Array.isArray(results)) {
            var periods = [];
            results.forEach(element => {
                periods.push(this.convertPeriod(element));
            });
            return periods;
        } else {
            return this.convertPeriod(results);
        }
    }

    getPeriods(db, callback) {
        db.any('SELECT * FROM TIME_ASG ORDER BY "LINE_NUM"')
            .then((results) => {
                var periods = this.getPeriodsOB(results);
                callback(periods, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getPeriod(db, periodId, callback) {
        db.one('SELECT * FROM TIME_ASG WHERE "PKEY_ID"= $1', periodId)
            .then((results) => {
                var period = this.getPeriodsOB(results);
                callback(period, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createPeriod(db, period, callback) {
        if (period !== null) {
            var data = [period.day, period.description, period.seconds, period.time, period.sc];
            db.one('INSERT INTO TIME_ASG("PKEY_ID", "LINE_NUM", "DAY", "DESCRIPTION", "SECONDS", "TIME", "SC") ' +
                'VALUES (NEXTVAL(\'"TIME_ASG_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM TIME_ASG), $1, $2, $3, $4, $5) ' +
                'RETURNING *', data)
                .then((results) => {
                    var addedPeriod = this.getPeriodsOB(results);
                    callback(addedPeriod, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updatePeriod(db, period, callback) {
        console.log("tp checkpoint 3");
        log.info('Updating time period with id:' + period.id);
        console.log("tp checkpoint 4");
        if (period !== null) {
            var data = [period.day, period.description, period.seconds, period.time, period.sc, period.id];
            db.one('UPDATE TIME_ASG SET "DAY" = $1, "DESCRIPTION" = $2, "SECONDS" = $3, "TIME" = $4, "SC" = $5 ' +
                'WHERE "PKEY_ID" = $6 RETURNING *', data)
                .then((results) => {
                    var updatedPeriod = this.getPeriodsOB(results);
                    callback(updatedPeriod, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deletePeriod(db, period, callback) {
        log.info('Deleting time period with id:' + period.id);
        db.one('DELETE FROM TIME_ASG WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', period.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, period, callback) {
        log.info('Updating time periods lineNum...');
        if (period !== null) {
            var data = [period.lineNum];
            db.any('UPDATE TIME_ASG SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedPeriods = this.getPeriodsOB(results);
                    callback(updatedPeriods, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    resetOrder(db, period, order, callback) {
        log.info('Resetting timePeriod order...');
        if (period !== null) {
            db.any('UPDATE TIME_ASG SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [period.lineNum])
                .then((results) => {

                    db.any('UPDATE TIME_ASG SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE TIME_ASG SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, period.id])
                                .then((results) => {
                                    var updatedPeriod = this.getPeriodsOB(results);
                                    callback(updatedPeriod[0], null);
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
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }
}

const periodPGDB = new TimePeriodPGDB();
module.exports = periodPGDB;