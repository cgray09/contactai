var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class CommonRecycleDaysSQLDB {
    
    convertCommonRecycleDay(element) {
        var commonRecycleDay = {};
        commonRecycleDay.id = element['PKEY_ID'];
        commonRecycleDay.description = element['DESCRIPTION'];
        commonRecycleDay.recycleOn = element['RECYCLE_ON'];
        return commonRecycleDay;
    }

    getCommonRecycleDaysOB(rows) {
        if (Array.isArray(rows)) {
            var commonRecycleDays = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                commonRecycleDays.push(this.convertCommonRecycleDay(rowObject));
            });
            return commonRecycleDays;
        }
    }

    getCommonRecycleDays(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM COMMON_RECYCLE_DAYS';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var commonRecycleDays = this.getCommonRecycleDaysOB(rows);
                            callback(commonRecycleDays, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    createCommonRecycleDays(config, commonRecycleDays, callback) {
        if (commonRecycleDays !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating commonRecycleDays...');
                    MSSqlUtil.getSeqNextValWithoutUpdate(conn, 'COMMON_RECYCLE_DAYS_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            const options = { keepNulls: true };
                            const bulkLoad = conn.newBulkLoad ('COMMON_RECYCLE_DAYS', options, (error, rowCount) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    conn.close();
                                    callback(null, error);
                                } else {
                                    //when bulkLoad is successful, update the sequence value to latest.
                                   var seqVal = pkey;
                                    MSSqlUtil.updateSeqCurrVal(conn, 'COMMON_RECYCLE_DAYS_SEQ', seqVal, (error) => {
                                        if (error) {
                                            log.error('Failed updating sequence currVal for COMMON_RECYCLE_DAYS_SEQ :' + error);
                                            callback(null, error);
                                        } else {
                                            //everything is successful here
                                            callback(commonRecycleDays, null);
                                        }
                                        conn.close();
                                    });
                                }                                
                            });
                            bulkLoad.addColumn('PKEY_ID', TYPES.Int, { nullable: false });
                            bulkLoad.addColumn('DESCRIPTION', TYPES.VarChar, { length: 150, nullable: true });
                            bulkLoad.addColumn('RECYCLE_ON', TYPES.VarChar, { length: 8, nullable: true });
                            
                            const dataBinds = [];
                            commonRecycleDays.forEach( x => {
                                x.id = pkey;
                                dataBinds.push({PKEY_ID: x.id, DESCRIPTION: x.description, RECYCLE_ON: x.recycleOn });
                                pkey++;
                            });

                            conn.execBulkLoad(bulkLoad, dataBinds);
                        }
                    });
                }
            });
        }
    }

    deleteCommonRecycleDays(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting commonRecycleDays... ');
                var sqlStr = 'DELETE FROM COMMON_RECYCLE_DAYS';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }
}

const commonRecycleDaysSQLDB = new CommonRecycleDaysSQLDB();
module.exports = commonRecycleDaysSQLDB;