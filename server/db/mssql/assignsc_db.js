var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class AssignSCSQLDB {

    convertAssignSC(element) {
        var assignSC = {};
        assignSC.id = element['PKEY_ID'];
        assignSC.description = element['DESCRIPTION'];
        assignSC.lineNum = element['LINE_NUM'];
        assignSC.refName1 = element['REF_NAME_1'];
        assignSC.refName2 = element['REF_NAME_2'];
        assignSC.refName3 = element['REF_NAME_3'];
        assignSC.refName4 = element['REF_NAME_4'];
        assignSC.refName5 = element['REF_NAME_5'];
        assignSC.refName6 = element['REF_NAME_6'];
        assignSC.refName7 = element['REF_NAME_7'];
        assignSC.refName8 = element['REF_NAME_8'];
        assignSC.refName9 = element['REF_NAME_9'];
        assignSC.refName10 = element['REF_NAME_10'];
        assignSC.scoreId = element['SCORE_ID'];
        assignSC.callHistory = element['CALL_HISTORY_FLAG'];
        return assignSC;
    }

    getAssignSCsOB(rows) {
        if (Array.isArray(rows)) {
            var assignSCs = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                assignSCs.push(this.convertAssignSC(rowObject));
            });
            return assignSCs;
        }
    }

    getAssignSCs(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM SCORE_ID_ASG ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var assignSCs = this.getAssignSCsOB(rows);
                            callback(assignSCs, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getAssignSC(config, assignSCId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM SCORE_ID_ASG WHERE PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var assignSCs = this.getAssignSCsOB(rows);
                            callback(assignSCs[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, assignSCId);
                conn.execSql(request);
            }
        });
    }

    createAssignSC(config, assignSC, callback) {
        if (assignSC !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating assignScoreCard...');
                    MSSqlUtil.getSeqNextVal(conn, 'SCORE_ID_ASG_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var callHist = (assignSC.callHistory) ? 1 : 0;
                            var sqlStr = 'INSERT INTO SCORE_ID_ASG (PKEY_ID, LINE_NUM, DESCRIPTION, SCORE_ID, CALL_HISTORY_FLAG, REF_NAME_1, REF_NAME_2, REF_NAME_3, REF_NAME_4, REF_NAME_5, REF_NAME_6, REF_NAME_7, REF_NAME_8, REF_NAME_9, REF_NAME_10) ' +
                                'VALUES (@pkey, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM SCORE_ID_ASG), @desc, @scoreId, @callHistory, @ref1, @ref2, @ref3, @ref4, @ref5, @ref6, @ref7, @ref8, @ref9, @ref10)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    assignSC.id = pkey;
                                    callback(assignSC, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('desc', TYPES.VarChar, assignSC.description);
                            request.addParameter('scoreId', TYPES.VarChar, assignSC.scoreId);
                            request.addParameter('callHistory', TYPES.Int, callHist);
                            request.addParameter('ref1', TYPES.VarChar, assignSC.refName1);
                            request.addParameter('ref2', TYPES.VarChar, assignSC.refName2);
                            request.addParameter('ref3', TYPES.VarChar, assignSC.refName3);
                            request.addParameter('ref4', TYPES.VarChar, assignSC.refName4);
                            request.addParameter('ref5', TYPES.VarChar, assignSC.refName5);
                            request.addParameter('ref6', TYPES.VarChar, assignSC.refName6);
                            request.addParameter('ref7', TYPES.VarChar, assignSC.refName7);
                            request.addParameter('ref8', TYPES.VarChar, assignSC.refName8);
                            request.addParameter('ref9', TYPES.VarChar, assignSC.refName9);
                            request.addParameter('ref10', TYPES.VarChar, assignSC.refName10);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateAssignSC(config, assignSC, callback) {
        if (assignSC !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating assignSC with id:' + assignSC.id);
                    var callHist = (assignSC.callHistory) ? 1 : 0;
                    var sqlStr = 'UPDATE SCORE_ID_ASG SET DESCRIPTION = @desc, SCORE_ID = @scoreId, CALL_HISTORY_FLAG = @callHistory, REF_NAME_1 = @ref1, REF_NAME_2 = @ref2, REF_NAME_3 = @ref3, ' +
                        'REF_NAME_4 = @ref4, REF_NAME_5 = @ref5, REF_NAME_6 = @ref6, REF_NAME_7 = @ref7, REF_NAME_8 = @ref8, REF_NAME_9 = @ref9, REF_NAME_10 = @ref10 WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('desc', TYPES.VarChar, assignSC.description);
                    request.addParameter('scoreId', TYPES.VarChar, assignSC.scoreId);
                    request.addParameter('callHistory', TYPES.Int, callHist);
                    request.addParameter('ref1', TYPES.VarChar, assignSC.refName1);
                    request.addParameter('ref2', TYPES.VarChar, assignSC.refName2);
                    request.addParameter('ref3', TYPES.VarChar, assignSC.refName3);
                    request.addParameter('ref4', TYPES.VarChar, assignSC.refName4);
                    request.addParameter('ref5', TYPES.VarChar, assignSC.refName5);
                    request.addParameter('ref6', TYPES.VarChar, assignSC.refName6);
                    request.addParameter('ref7', TYPES.VarChar, assignSC.refName7);
                    request.addParameter('ref8', TYPES.VarChar, assignSC.refName8);
                    request.addParameter('ref9', TYPES.VarChar, assignSC.refName9);
                    request.addParameter('ref10', TYPES.VarChar, assignSC.refName10);
                    request.addParameter('pkey', TYPES.Int, assignSC.id);

                    conn.execSql(request);
                }
            });
        }
    }

    deleteAssignSC(config, assignSC, callback) {
        if (assignSC !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting assignSC with id:' + assignSC.id);
                    var sqlStr = 'DELETE FROM SCORE_ID_ASG WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, assignSC.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, assignSC, callback) {
        if (assignSC !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating assignScoreCards lineNum...');

                    var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, assignSC.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    updateProperties(config, properties, callback) {
        if (properties != null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating assignScoreCards properties... ');
                    var sqlStr = 'UPDATE SCORE_ID_ASG SET ' + properties.refName + ' = @refNameValue WHERE PKEY_ID = @refNameValueId';

                    if(properties.refNameValue === null) {
                        sqlStr = 'UPDATE SCORE_ID_ASG SET ' + properties.refName + ' = null';
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

    resetOrder(config, assignSC, order, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting assignSC order...');
                if (assignSC !== null) {
                    var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = @order WHERE PKEY_ID = @assignSCId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            assignSC.lineNum = order;
                                            callback(assignSC, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('assignSCId', TYPES.Int, assignSC.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, assignSC.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const assignSCSQLDB = new AssignSCSQLDB();
module.exports = assignSCSQLDB;