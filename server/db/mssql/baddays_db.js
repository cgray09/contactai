var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class BadDaysSQLDB {

    epochToDateString(epoch) {            
        var date = new Date(epoch * 86400 * 1000);
        var str =  (date.getFullYear() + '' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '' + ((date.getDate() > 8) ? (date.getDate() + 1) : ('0' + (date.getDate() + 1))));       
        return str;
    }

    convertBadDay(element) {
        var badDay = {};
        badDay.badDay = this.epochToDateString(element['BAD_DAY']);
        badDay.dialerName = element['DIALER_NAME'];
        return badDay;
    }

    getBadDaysOB(rows) {
        if (Array.isArray(rows)) {
            var badDays = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                badDays.push(this.convertBadDay(rowObject));
            });
            return badDays;
        }
    }

    getBadDays(config, dialer, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM BAD_DAYS WHERE DIALER_NAME IN (\'all\', @name)';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var badDays = this.getBadDaysOB(rows);
                            callback(badDays, null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('name', TYPES.VarChar, dialer.name);
                conn.execSql(request);
            }
        });
    }

    getDialerBadDays(config, dialer, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM BAD_DAYS WHERE DIALER_NAME = @name';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var badDays = this.getBadDaysOB(rows);
                            callback(badDays, null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('name', TYPES.VarChar, dialer.name);
                conn.execSql(request);
            }
        });
    }

    createBadDays(config, badDays, callback) {
        if (badDays !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating badDays...');

                    const options = { keepNulls: true };
                    const bulkLoad = conn.newBulkLoad('BAD_DAYS', options, (error, rowCount) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(badDays, null);
                        }
                        conn.close();
                    });

                    bulkLoad.addColumn('BAD_DAY', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('DIALER_NAME', TYPES.VarChar, { length: 20, nullable: true });

                    const dataBinds = [];
                    badDays.forEach(x => {
                        dataBinds.push({ BAD_DAY: x.badDay, DIALER_NAME: x.dialerName });
                    });

                    conn.execBulkLoad(bulkLoad, dataBinds);
                }
            });
        }
    }

    deleteBadDays(config, dialer, callback) {
        if (dialer !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting badDays... ');
                    var sqlStr = 'DELETE FROM BAD_DAYS WHERE DIALER_NAME IN (\'all\', @name)';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('name', TYPES.VarChar, dialer.name);
                    conn.execSql(request);
                }
            });
        }
    }

    deleteDialerBadDays(config, dialer, callback) {
        if (dialer !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting dialer badDays... ');
                    var sqlStr = 'DELETE FROM BAD_DAYS WHERE DIALER_NAME = @name';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('name', TYPES.VarChar, dialer.name);
                    conn.execSql(request);
                }
            });
        }
    }
}

const badDaysSQLDB = new BadDaysSQLDB();
module.exports = badDaysSQLDB;