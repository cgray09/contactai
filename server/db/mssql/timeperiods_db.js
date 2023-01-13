var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class TimePeriodSQLDB {

    convertPeriod(element) {
        var period = {};
        period.id = element['PKEY_ID'];
        period.description = element['DESCRIPTION'];
        period.day = element['DAY'];
        period.lineNum = element['LINE_NUM'];
        period.seconds = element['SECONDS'];
        period.time = element['TIME'];
        period.sc = element['SC'];        
        return period;
    }

    getPeriodsOB(rows) {
        if (Array.isArray(rows)) {
            var periods = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                periods.push(this.convertPeriod(rowObject));
            });
            return periods;
        }
    }

    getPeriods(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM TIME_ASG ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var periods = this.getPeriodsOB(rows);
                            callback(periods, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getPeriod(config, periodId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM TIME_ASG WHERE PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var periods = this.getPeriodsOB(rows);
                            callback(periods[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, periodId);
                conn.execSql(request);
            }
        });
    }

    createPeriod(config, period, callback) {
        if (period !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating time period...');
                    MSSqlUtil.getSeqNextVal(conn, 'TIME_ASG_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO TIME_ASG (PKEY_ID, LINE_NUM, DAY, DESCRIPTION, SECONDS, TIME, SC) ' +
                                'VALUES (@pkey, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM TIME_ASG), @day, @desc, @sec, @time, @sc)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    period.id = pkey;
                                    callback(period, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('day', TYPES.VarChar, period.day);
                            request.addParameter('desc', TYPES.VarChar, period.description);
                            request.addParameter('sec', TYPES.VarChar, period.seconds);
                            request.addParameter('time', TYPES.VarChar, period.time);
                            request.addParameter('sc', TYPES.VarChar, period.sc);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updatePeriod(config, period, callback) {
        if (period !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating time period with id:' + period.id);
                    var sqlStr = 'UPDATE TIME_ASG SET DAY = @day, DESCRIPTION = @desc, SECONDS = @sec, TIME = @time, SC = @sc WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, period.id);
                    request.addParameter('day', TYPES.VarChar, period.day);
                    request.addParameter('desc', TYPES.VarChar, period.description);
                    request.addParameter('sec', TYPES.VarChar, period.seconds);
                    request.addParameter('time', TYPES.VarChar, period.time);
                    request.addParameter('sc', TYPES.VarChar, period.sc);
                    conn.execSql(request);
                }
            });
        }
    }

    deletePeriod(config, period, callback) {
        if (period !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting time period with id:' + period.id);
                    var sqlStr = 'DELETE FROM TIME_ASG WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, period.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, period, callback) {
        if (period !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating time periods lineNum...');

                    var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, period.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    resetOrder(config, period, order, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting time period order...');
                if (period !== null) {
                    var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE TIME_ASG SET LINE_NUM = @order WHERE PKEY_ID = @periodId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            period.lineNum = order;
                                            callback(period, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('periodId', TYPES.Int, period.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, period.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const timePeriodSQLDB = new TimePeriodSQLDB();
module.exports = timePeriodSQLDB;