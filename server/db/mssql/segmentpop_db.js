var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class SegmentPopSQLDB {

    convertSegmentPop(element) {
        var segmentPop = {};
        segmentPop.id = element['PKEY_ID'];
        segmentPop.description = element['DESCRIPTION'];
        segmentPop.lineNum = element['LINE_NUM'];
        segmentPop.refName1 = element['REF_NAME_1'];
        segmentPop.refName2 = element['REF_NAME_2'];
        segmentPop.refName3 = element['REF_NAME_3'];
        segmentPop.refName4 = element['REF_NAME_4'];
        segmentPop.refName5 = element['REF_NAME_5'];
        segmentPop.refName6 = element['REF_NAME_6'];
        segmentPop.refName7 = element['REF_NAME_7'];
        segmentPop.refName8 = element['REF_NAME_8'];
        segmentPop.refName9 = element['REF_NAME_9'];
        segmentPop.refName10 = element['REF_NAME_10'];
        segmentPop.spId = element['SPID'];
        return segmentPop;
    }

    getSegmentPopsOB(rows) {
        if (Array.isArray(rows)) {
            var segmentPops = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                segmentPops.push(this.convertSegmentPop(rowObject));
            });
            return segmentPops;
        }
    }

    getSegmentPops(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM SPID_ASG ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var segmentPops = this.getSegmentPopsOB(rows);
                            callback(segmentPops, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getSegmentPop(config, segmentPopId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM SPID_ASG WHERE PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var segmentPops = this.getSegmentPopsOB(rows);
                            callback(segmentPops[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, segmentPopId);
                conn.execSql(request);
            }
        });
    }

    createSegmentPop(config, segmentPop, callback) {
        if (segmentPop !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating segment population...');
                    MSSqlUtil.getSeqNextVal(conn, 'SPID_ASG_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO SPID_ASG (PKEY_ID, LINE_NUM, DESCRIPTION, REF_NAME_1, REF_NAME_2, REF_NAME_3, REF_NAME_4, REF_NAME_5, REF_NAME_6, REF_NAME_7, REF_NAME_8, REF_NAME_9, REF_NAME_10, SPID) ' +
                                'VALUES (@pkey, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM SPID_ASG), @desc, @ref1, @ref2, @ref3, @ref4, @ref5, @ref6, @ref7, @ref8, @ref9, @ref10, @spid)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    segmentPop.id = pkey;
                                    callback(segmentPop, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('desc', TYPES.VarChar, segmentPop.description);
                            request.addParameter('ref1', TYPES.VarChar, segmentPop.refName1);
                            request.addParameter('ref2', TYPES.VarChar, segmentPop.refName2);
                            request.addParameter('ref3', TYPES.VarChar, segmentPop.refName3);
                            request.addParameter('ref4', TYPES.VarChar, segmentPop.refName4);
                            request.addParameter('ref5', TYPES.VarChar, segmentPop.refName5);
                            request.addParameter('ref6', TYPES.VarChar, segmentPop.refName6);
                            request.addParameter('ref7', TYPES.VarChar, segmentPop.refName7);
                            request.addParameter('ref8', TYPES.VarChar, segmentPop.refName8);
                            request.addParameter('ref9', TYPES.VarChar, segmentPop.refName9);
                            request.addParameter('ref10', TYPES.VarChar, segmentPop.refName10);
                            request.addParameter('spid', TYPES.VarChar, segmentPop.spId);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateSegmentPop(config, segmentPop, callback) {
        if (segmentPop !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating segmentPop with id:' + segmentPop.id);
                    var sqlStr = 'UPDATE SPID_ASG SET DESCRIPTION = @desc, REF_NAME_1 = @ref1, REF_NAME_2 = @ref2, REF_NAME_3 = @ref3, REF_NAME_4 = @ref4, REF_NAME_5 = @ref5, ' +
                        'REF_NAME_6 = @ref6, REF_NAME_7 = @ref7, REF_NAME_8 = @ref8, REF_NAME_9 = @ref9, REF_NAME_10 = @ref10, SPID = @spid WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('desc', TYPES.VarChar, segmentPop.description);
                    request.addParameter('ref1', TYPES.VarChar, segmentPop.refName1);
                    request.addParameter('ref2', TYPES.VarChar, segmentPop.refName2);
                    request.addParameter('ref3', TYPES.VarChar, segmentPop.refName3);
                    request.addParameter('ref4', TYPES.VarChar, segmentPop.refName4);
                    request.addParameter('ref5', TYPES.VarChar, segmentPop.refName5);
                    request.addParameter('ref6', TYPES.VarChar, segmentPop.refName6);
                    request.addParameter('ref7', TYPES.VarChar, segmentPop.refName7);
                    request.addParameter('ref8', TYPES.VarChar, segmentPop.refName8);
                    request.addParameter('ref9', TYPES.VarChar, segmentPop.refName9);
                    request.addParameter('ref10', TYPES.VarChar, segmentPop.refName10);
                    request.addParameter('spid', TYPES.VarChar, segmentPop.spId);
                    request.addParameter('pkey', TYPES.Int, segmentPop.id);                    
                    conn.execSql(request);
                }
            });
        }
    }

    deleteSegmentPop(config, segmentPop, callback) {
        if (segmentPop !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting segmentPop with id:' + segmentPop.id);
                    var sqlStr = 'DELETE FROM SPID_ASG WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, segmentPop.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, segmentPop, callback) {
        if (segmentPop !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating segmentPops lineNum...');

                    var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, segmentPop.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    updateProperties(config, properties, callback) {
        if(properties != null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating segmentPop properties... ');

                    var sqlStr = 'UPDATE SPID_ASG SET ' + properties.refName + ' = @refNameValue WHERE PKEY_ID = @refNameValueId';
                    
                    if(properties.refNameValue === null) {
                        sqlStr = 'UPDATE SPID_ASG SET ' + properties.refName + ' = null';
                    }
                    
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    if(properties.refNameValue !== null) {
                        request.addParameter('refNameValue', TYPES.VarChar, properties.refNameValue);
                        request.addParameter('refNameValueId', TYPES.Int, properties.refNameValueId);
                    }
                    conn.execSql(request);
                }
            });
        }        
    }

    resetOrder(config, segmentPop, order, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting segmentPop order...');
                if (segmentPop !== null) {
                    var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = @order WHERE PKEY_ID = @segmentPopId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            segmentPop.lineNum = order;
                                            callback(segmentPop, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('segmentPopId', TYPES.Int, segmentPop.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, segmentPop.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const segmentPopSQLDB = new SegmentPopSQLDB();
module.exports = segmentPopSQLDB;