var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class AnalysisCharSQLDB {

    convertAnalysisChar(element) {
        var analysisChar = {};
        analysisChar.id = element['PKEY'];
        analysisChar.name = element['NAME'];
        analysisChar.source = element['SOURCE'];
        analysisChar.type = element['TYPE'];
        analysisChar.description = element['DESCRIPTION'];
        analysisChar.lineNum = element['LINE_NUM'];
        analysisChar.active = element['ACTIVE'];
        analysisChar.groupr = element['GROUPR'];
        return analysisChar;
    }

    getAnalysisCharsOB(rows) {
        if (Array.isArray(rows)) {
            var analysisChars = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                analysisChars.push(this.convertAnalysisChar(rowObject));
            });
            return analysisChars;
        }
    }

    getAnalysisChars(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM CT_SC_BASE_VARS ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var analysisChars = this.getAnalysisCharsOB(rows);
                            callback(analysisChars, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getAnalysisChar(config, analysisCharId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM CT_SC_BASE_VARS WHERE PKEY = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var analysisChars = this.getAnalysisCharsOB(rows);
                            callback(analysisChars[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, analysisCharId);
                conn.execSql(request);
            }
        });
    }

    createAnalysisChar(config, analysisChar, callback) {
        if (analysisChar !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating analysisChar...');
                    MSSqlUtil.getSeqNextVal(conn, 'CT_SC_BASE_VARS_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO CT_SC_BASE_VARS (PKEY, LINE_NUM, NAME, SOURCE, TYPE, DESCRIPTION, ACTIVE, GROUPR) ' +
                                'VALUES (@pkey, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM CT_SC_BASE_VARS), @name, @src, @type, @desc, @active, @groupr)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    analysisChar.id = pkey;
                                    callback(analysisChar, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('name', TYPES.VarChar, analysisChar.name);
                            request.addParameter('src', TYPES.VarChar, analysisChar.source);
                            request.addParameter('type', TYPES.VarChar, analysisChar.type);
                            request.addParameter('desc', TYPES.VarChar, analysisChar.description);
                            request.addParameter('active', TYPES.Int, analysisChar.active);
                            request.addParameter('groupr', TYPES.Int, analysisChar.groupr);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateAnalysisChar(config, analysisChar, callback) {
        if (analysisChar !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating analysisChar with id:' + analysisChar.id);
                    var sqlStr = 'UPDATE CT_SC_BASE_VARS SET NAME = @name, SOURCE = @src, TYPE = @type, DESCRIPTION = @desc, ' +
                        'ACTIVE = @active, GROUPR = @groupr WHERE PKEY = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('name', TYPES.VarChar, analysisChar.name);
                    request.addParameter('src', TYPES.VarChar, analysisChar.source);
                    request.addParameter('type', TYPES.VarChar, analysisChar.type);
                    request.addParameter('desc', TYPES.VarChar, analysisChar.description);
                    request.addParameter('active', TYPES.Int, analysisChar.active);
                    request.addParameter('groupr', TYPES.Int, analysisChar.groupr);
                    request.addParameter('pkey', TYPES.Int, analysisChar.id);

                    conn.execSql(request);
                }
            });
        }
    }

    deleteAnalysisChar(config, analysisChar, callback) {
        if (analysisChar !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting analysisChar with id:' + analysisChar.id);
                    var sqlStr = 'DELETE FROM CT_SC_BASE_VARS WHERE PKEY = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, analysisChar.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, analysisChar, callback) {
        if (analysisChar !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating analysisChars lineNum...');

                    var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, analysisChar.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    resetOrder(config, analysisChar, order, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting analysisChar order...');
                if (analysisChar !== null) {
                    var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = @order WHERE PKEY = @analysisCharId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            analysisChar.lineNum = order;
                                            callback(analysisChar, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('analysisCharId', TYPES.Int, analysisChar.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, analysisChar.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }

    importAnalysisChars(config, analysisChars, callback) {
        if (analysisChars !== null && analysisChars.length > 0) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    MSSqlUtil.getSeqNextValWithoutUpdate(conn, 'CT_SC_BASE_VARS_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            // get the total record count to set lineNum for analysisChar obj
                            var request = new Request('SELECT COUNT(*) FROM CT_SC_BASE_VARS', (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var lineNum = rows[0][0].value;
                                    const options = { keepNulls: true };
                                    const bulkLoad = conn.newBulkLoad('CT_SC_BASE_VARS', options, (error, rowCount) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            //when bulkLoad is successful, update the sequence value to latest.
                                            var seqVal = pkey + (analysisChars.length - 1);
                                            MSSqlUtil.updateSeqCurrVal(conn, 'CT_SC_BASE_VARS_SEQ', seqVal, (error) => {
                                                if (error) {
                                                    log.error('Failed updating sequence currVal for CT_SC_BASE_VARS_SEQ:' + error);
                                                    callback(null, error);
                                                    conn.close();
                                                } else {
                                                    //everything is successful here
                                                    callback(null, null);
                                                    conn.close();
                                                }
                                            });
                                        }
                                    });
                                    bulkLoad.addColumn('PKEY', TYPES.Int, { nullable: false });
                                    bulkLoad.addColumn('NAME', TYPES.VarChar, { length: 50, nullable: true });
                                    bulkLoad.addColumn('SOURCE', TYPES.VarChar, { length: 15, nullable: true });
                                    bulkLoad.addColumn('TYPE', TYPES.VarChar, { length: 10, nullable: true });
                                    bulkLoad.addColumn('DESCRIPTION', TYPES.VarChar, { length: 150, nullable: true });
                                    bulkLoad.addColumn('LINE_NUM', TYPES.Int, { nullable: true });
                                    bulkLoad.addColumn('ACTIVE', TYPES.Int, { nullable: true });
                                    bulkLoad.addColumn('GROUPR', TYPES.Int, { nullable: true });
                                    
                                    const dataBinds = [];
                                    analysisChars.forEach(x => {
                                            dataBinds.push({PKEY: pkey++, NAME: x.name, SOURCE: x.source, TYPE: x.type, 
                                                DESCRIPTION: x.description, LINE_NUM: lineNum++, ACTIVE: x.active, GROUPR: x.groupr});
                                    });
                                    
                                    conn.execBulkLoad(bulkLoad, dataBinds);
                                }
                            });
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    deleteAnalysisChars(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting all analysisChars...');
                var sqlStr = 'TRUNCATE TABLE CT_SC_BASE_VARS';
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

const analysisCharSQLDB = new AnalysisCharSQLDB();
module.exports = analysisCharSQLDB;