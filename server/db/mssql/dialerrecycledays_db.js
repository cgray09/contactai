var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class DialerRecycleDaysSQLDB {
    
    convertDialerRecycleDay(element) {
        var dialerRecycleDay = {};
        dialerRecycleDay.id = element['PKEY_ID'];
        dialerRecycleDay.description = element['DESCRIPTION'];
        dialerRecycleDay.dialerName = element['DIALER_NAME'];
        dialerRecycleDay.recycleOn = element['RECYCLE_ON'];
        return dialerRecycleDay;
    }

    getDialerRecycleDaysOB(rows) {
        if (Array.isArray(rows)) {
            var dialerRecycleDays = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                dialerRecycleDays.push(this.convertDialerRecycleDay(rowObject));
            });
            return dialerRecycleDays;
        }
    }

    getDialerRecycleDays(config, dialer, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM DIALER_RECYCLE_DAYS WHERE DIALER_NAME = @name';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var dialerRecycleDays = this.getDialerRecycleDaysOB(rows);
                            callback(dialerRecycleDays, null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('name', TYPES.VarChar, dialer.name);
                conn.execSql(request);
            }
        });
    }

    createDialerRecycleDays(config, dialerRecycleDays, dialer, callback) {
        if (dialerRecycleDays !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating dialerRecycleDays...');
                    MSSqlUtil.getSeqNextValWithoutUpdate(conn, 'DIALER_RECYCLE_DAYS_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            const options = { keepNulls: true };
                            const bulkLoad = conn.newBulkLoad ('DIALER_RECYCLE_DAYS', options, (error, rowCount) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    conn.close();
                                    callback(null, error);
                                } else {
                                    //when bulkLoad is successful, update the sequence value to latest.
                                    var seqVal = pkey;
                                    MSSqlUtil.updateSeqCurrVal(conn, 'DIALER_RECYCLE_DAYS_SEQ', seqVal, (error) => {
                                        if (error) {
                                            log.error('Failed updating sequence currVal for DIALER_RECYCLE_DAYS_SEQ :' + error);
                                            callback(null, error);                                            
                                        } else {
                                            //everything is successful here
                                            callback(dialerRecycleDays, null);
                                        }
                                        conn.close();
                                    });
                                }
                            });
                            bulkLoad.addColumn('PKEY_ID', TYPES.Int, { nullable: false });
                            bulkLoad.addColumn('DESCRIPTION', TYPES.VarChar, { length: 150, nullable: true });
                            bulkLoad.addColumn('DIALER_NAME', TYPES.VarChar, { length: 20, nullable: true });
                            bulkLoad.addColumn('RECYCLE_ON', TYPES.VarChar, { length: 8, nullable: true });
                            
                            const dataBinds = [];
                            dialerRecycleDays.forEach( x => {
                                x.id = pkey;
                                x.dialerName = dialer.name;
                                dataBinds.push({PKEY_ID: x.id, DESCRIPTION: x.description, DIALER_NAME: x.dialerName, RECYCLE_ON: x.recycleOn });
                                pkey++;
                            });

                            conn.execBulkLoad(bulkLoad, dataBinds);
                        }
                    });
                }
            });
        }
    }

    deleteDialerRecycleDays(config, dialer, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting dialer recycleDays...');
                var sqlStr = 'DELETE FROM DIALER_RECYCLE_DAYS WHERE DIALER_NAME = @name; ';
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

const dialerRecycleDaysSQLDB = new DialerRecycleDaysSQLDB();
module.exports = dialerRecycleDaysSQLDB;