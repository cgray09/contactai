var log = require('../../logger')(module);

class TimePeriodODB {

    convertPeriod(element) {
        var period = {};
        period.id = element[0];
        period.day = element[1];
        period.description = element[2];
        period.lineNum = element[3];
        period.seconds = element[6];
        period.time = element[7];
        period.sc = element[8];        
        return period;
    }

    getPeriodsOB(rows) {
        if (Array.isArray(rows)) {
            var periods = [];
            rows.forEach(row => {
                periods.push(this.convertPeriod(row));
            });
            return periods;
        }
    }

    getPeriods(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM TIME_ASG ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var periods = this.getPeriodsOB(results.rows);
                    callback(periods, null);
                }
            });
        });
    }

    getPeriod(connection, periodId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM TIME_ASG WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [periodId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if(results.rows.length === 0) { callback(null, null) }
                    else {
                        var periods = this.getPeriodsOB(results.rows);
                        callback(periods[0], null);
                    }
                }
            });
        });
    }

    createPeriod(connection, period, callback) {
        connection.then((conn) => {
            log.info('Creating time period...');
            if (period !== null) {
                conn.execute('SELECT TIME_ASG_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        period.id = results.rows[0][0];

                        var sqlStr = 'INSERT INTO TIME_ASG (PKEY_ID, LINE_NUM, DAY, DESCRIPTION, SECONDS, TIME, SC) ' +
                                'VALUES (:1, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM TIME_ASG), :2, :3, :4, :5, :6)';

                        var bind = [period.id, period.day, period.description, period.seconds, period.time, period.sc];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(period, null);
                            }
                        });                
                    }
                });        
            }
        });
    }

    updatePeriod(connection, period, callback) {
        connection.then((conn) => {
            log.info('Updating time period with id:' + period.id);
            if (period !== null) {
                var sqlStr = 'UPDATE TIME_ASG SET DAY = :1, DESCRIPTION = :2, SECONDS = :3, TIME = :4, SC = :5 WHERE PKEY_ID = :6';

                var bind = [period.day, period.description, period.seconds, period.time, period.sc, period.id];

                conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                });
            }
        });
    }

    deletePeriod(connection, period, callback) {
        connection.then((conn) => {
            log.info('Deleting time period with id:' + period.id);
            var sqlStr = 'DELETE FROM TIME_ASG WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [period.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, period, callback) {
        connection.then((conn) => {
            log.info('Updating time periods lineNum...');
            if (period !== null) {
                var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [period.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                });
            }
        });
    }

    resetOrder(connection, period, order, callback) {
        connection.then((conn) => {
            log.info('Resetting timePeriod order...');
            if (period !== null) {
                var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [period.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, period.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        period.lineNum = order;
                                        callback(period, null);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

const timePeriodODB = new TimePeriodODB();
module.exports = timePeriodODB;