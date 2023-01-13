var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class FileFormatSQLDB {

    getTableSequence(tableName) {
        switch (tableName.toUpperCase()) {
            case "FAN_OUT": return "FAN_OUT_SEQ";
            case "FAN_OUT_1": return "FAN_OUT_1_SEQ";
            case "FAN_OUT_2": return "FAN_OUT_2_SEQ";
            case "FAN_IN": return "FAN_IN_SEQ";
            default: return "";
        }
    }

    getTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "FAN_OUT";
            case "DLFILEFORMAT": return "FAN_OUT_1";
            case "DLSUPPFILEFORMAT": return "FAN_OUT_2";
            case "ASSIGNMENT": return "FAN_IN";
            default: return "";
        }
    }

    convertFileFormat(element) {
        var fileFormat = {};
        fileFormat.id = element['PKEY_ID'];
        fileFormat.dialerId = element['DIALER_ROWID'];
        fileFormat.name = element['REF_NAME'];
        fileFormat.startPos = element['START_POS'];
        fileFormat.endPos = element['END_POS'];
        fileFormat.fieldLength = element['FIELD_LENGTH'];
        fileFormat.type = element['FIELD_FORMAT'];
        fileFormat.formatter = element['STD_PROC'];
        fileFormat.specialInfo = element['ML_KEY'];
        fileFormat.description = element['DESCRIPTION'];
        fileFormat.lineNum = element['LINE_NUM'];
        return fileFormat;
    }

    getFileFormatsOB(rows) {
        if (Array.isArray(rows)) {
            var fileFormats = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                fileFormats.push(this.convertFileFormat(rowObject));
            });
            return fileFormats;
        }
    }

    getFileFormats(config, dialerId, page, callback) {
        var table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                let sqlStr = 'SELECT * FROM ' + table + ' WHERE DIALER_ROWID = ' + dialerId + ' AND LINE_NUM > -2' + 
                    'ORDER BY LINE_NUM';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var fileFormats = this.getFileFormatsOB(rows);
                            callback(fileFormats, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getFileFormat(config, fileFormatId, page, callback) {
        var table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM ' + table + ' WHERE PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var fileFormats = this.getFileFormatsOB(rows);
                            callback(fileFormats[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, fileFormatId);
                conn.execSql(request);
            }
        });
    }

    createFileFormat(config, fileFormat, dialerId, page, callback) {
        if (fileFormat !== null) {
            var table = this.getTable(page);
            var sequenceName = this.getTableSequence(table);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating file format...');
                    var insertCols = ["PKEY_ID", "LINE_NUM", "DIALER_ROWID", "REF_NAME", "START_POS", "END_POS",
                        "FIELD_LENGTH", "FIELD_FORMAT", "STD_PROC", "DESCRIPTION"];
                    var insertVals = ["lineNum", "dialerRowId", "refName", "startPos", "endPos",
                        "fieldLength", "fieldFormat", "stdProc", "desc"];
                    if ( table !== "FAN_IN" ) {
                        insertCols.push("ML_KEY");
                        insertVals.push("mlkey");
                    }

                    var sqlStr = `UPDATE ` + table + ` SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @lineNum AND DIALER_ROWID = @dialerRowId;
                    INSERT INTO ` + table + ` (` + insertCols.join(", ") + `)
                    VALUES ( (SELECT CURRVAL + INCR FROM ALLSEQUENCES WHERE SEQNAME = @seqName) , @` + insertVals.join(", @") + `);
                    UPDATE ALLSEQUENCES SET CURRVAL = CURRVAL + INCR WHERE SEQNAME = @seqName`;

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            //fileFormat.id = pkey;
                            callback(fileFormat, null);
                        }
                        conn.close();
                    });
                    //request.addParameter('pkey', TYPES.Int, pkey);
                    request.addParameter('seqName', TYPES.VarChar, sequenceName);
                    request.addParameter('lineNum', TYPES.Int, fileFormat.index);
                    request.addParameter('dialerRowId', TYPES.Int, dialerId);
                    request.addParameter('refName', TYPES.VarChar, fileFormat.name);
                    request.addParameter('startPos', TYPES.Int, fileFormat.startPos);
                    request.addParameter('endPos', TYPES.Int, fileFormat.endPos);
                    request.addParameter('fieldLength', TYPES.Int, fileFormat.fieldLength);
                    request.addParameter('fieldFormat', TYPES.VarChar, fileFormat.type);
                    request.addParameter('stdProc', TYPES.VarChar, fileFormat.formatter);
                    request.addParameter('desc', TYPES.VarChar, fileFormat.description);
                    if (table !== 'FAN_IN') {
                        request.addParameter('mlKey', TYPES.VarChar, fileFormat.specialInfo);
                    }

                    conn.execSql(request);
                }
            });
        }
    }

    importFileFormats(config, formatList, dialerId, page, callback) {
        if (formatList !== null && formatList.length > 0) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            var sequenceName = this.getTableSequence(table);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    MSSqlUtil.getSeqNextValWithoutUpdate(conn, sequenceName, (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            // get the total record count to set lineNum for format obj
                            var request = new Request('(SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM ' + table + ' WHERE DIALER_ROWID = @dialerRowId AND LINE_NUM > 0)', (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var lineNum = rows[0][0].value;
                                    const options = { keepNulls: true };
                                    const bulkLoad = conn.newBulkLoad(table, options, (error, rowCount) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            //when bulkLoad is successful, update the sequence value to latest.
                                            var seqVal = pkey + (formatList.length - 1);
                                            MSSqlUtil.updateSeqCurrVal(conn, sequenceName, seqVal, (error) => {
                                                if (error) {
                                                    log.error('Failed updating sequence currVal for ' + sequenceName + ':' + error);
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
                                    bulkLoad.addColumn('PKEY_ID', TYPES.Int, { nullable: false });
                                    bulkLoad.addColumn('LINE_NUM', TYPES.Int, { nullable: true });
                                    bulkLoad.addColumn('DIALER_ROWID', TYPES.Int, { nullable: true });
                                    bulkLoad.addColumn('REF_NAME', TYPES.VarChar, { length: 50, nullable: true });
                                    bulkLoad.addColumn('START_POS', TYPES.Int, { nullable: true });
                                    bulkLoad.addColumn('END_POS', TYPES.Int, { nullable: true });
                                    bulkLoad.addColumn('FIELD_LENGTH', TYPES.Int, { nullable: true });
                                    bulkLoad.addColumn('FIELD_FORMAT', TYPES.VarChar, { length: 30, nullable: true });
                                    bulkLoad.addColumn('STD_PROC', TYPES.VarChar, { length: 30, nullable: true });
                                    if (table !== "FAN_IN") {
                                        bulkLoad.addColumn('ML_KEY', TYPES.VarChar, { length: 50, nullable: true });
                                    }
                                    bulkLoad.addColumn('DESCRIPTION', TYPES.VarChar, { length: 150, nullable: true });

                                    const dataBinds = [];
                                    formatList.forEach(x => {
                                        if (table === "FAN_IN") {
                                            dataBinds.push({
                                                PKEY_ID: pkey++, LINE_NUM: lineNum++, DIALER_ROWID: dialerId, REF_NAME: x.name, START_POS: x.startPos,
                                                END_POS: x.endPos, FIELD_LENGTH: x.fieldLength, FIELD_FORMAT: x.type, STD_PROC: x.formatter, DESCRIPTION: x.description
                                            });
                                        } else {
                                            dataBinds.push({
                                                PKEY_ID: pkey++, LINE_NUM: lineNum++, DIALER_ROWID: dialerId, REF_NAME: x.name, START_POS: x.startPos,
                                                END_POS: x.endPos, FIELD_LENGTH: x.fieldLength, FIELD_FORMAT: x.type, STD_PROC: x.formatter, ML_KEY: x.specialInfo, DESCRIPTION: x.description
                                            });
                                        }
                                    });

                                    conn.execBulkLoad(bulkLoad, dataBinds);
                                }
                            });
                            request.addParameter('dialerRowId', TYPES.Int, dialerId);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }


    updateFileFormat(config, fileFormat, page, callback) {
        if (fileFormat !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating file format with id:' + fileFormat.id);

                    var sqlStr = 'UPDATE ' + table + ' SET DIALER_ROWID = @dialerRowId, REF_NAME = @refName, START_POS = @startPos, END_POS = @endPos, FIELD_LENGTH = @fieldLength, ' +
                        'FIELD_FORMAT = @fieldFormat, STD_PROC = @stdProc, ML_KEY = @mlKey, DESCRIPTION = @desc WHERE PKEY_ID = @pkey';

                    if (table === "FAN_IN") {
                        sqlStr = 'UPDATE ' + table + ' SET DIALER_ROWID = @dialerRowId, REF_NAME = @refName, START_POS = @startPos, END_POS = @endPos, FIELD_LENGTH = @fieldLength, ' +
                            'FIELD_FORMAT = @fieldFormat, STD_PROC = @stdProc, DESCRIPTION = @desc WHERE PKEY_ID = @pkey';

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
                    request.addParameter('dialerRowId', TYPES.Int, fileFormat.dialerId);
                    request.addParameter('refName', TYPES.VarChar, fileFormat.name);
                    request.addParameter('startPos', TYPES.Int, fileFormat.startPos);
                    request.addParameter('endPos', TYPES.Int, fileFormat.endPos);
                    request.addParameter('fieldLength', TYPES.Int, fileFormat.fieldLength);
                    request.addParameter('fieldFormat', TYPES.VarChar, fileFormat.type);
                    request.addParameter('stdProc', TYPES.VarChar, fileFormat.formatter);
                    if (table !== 'FAN_IN') {
                        request.addParameter('mlKey', TYPES.VarChar, fileFormat.specialInfo);
                    }
                    request.addParameter('desc', TYPES.VarChar, fileFormat.description);
                    request.addParameter('pkey', TYPES.Int, fileFormat.id);

                    conn.execSql(request);
                }
            });
        }
    }

    deleteFileFormat(config, fileFormat, page, callback) {
        if (fileFormat !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting file format with id:' + fileFormat.id);
                    var sqlStr = 'DELETE FROM ' + table + ' WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, fileFormat.id);
                    conn.execSql(request);
                }
            });
        }
    }

    deleteFileFormats(config, dialerId, page, callback) {
        if (dialerId !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting file formats for dialer with id ' + dialerId + ' page '  + page);
                    var sqlStr = 'DELETE FROM ' + table + ' WHERE DIALER_ROWID = @dialerId' ;
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('dialerId', TYPES.Int, dialerId);
                    conn.execSql(request);
                }
            });
        }
    }

    getProperties(config, dialerId, propIds, page, callback) {
        if (dialerId !== null && propIds.length === 2) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    var table = this.getTable(page);
                    var sqlStr = 'SELECT * FROM ' + table + ' WHERE DIALER_ROWID = @dialerId AND PKEY_ID IN (@id1, @id2)';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            if (rowCount === 2) {
                                log.info('Properties exists for dialerId: ' + dialerId);
                                callback(true, null);
                            } else {
                                log.info('Properties do not exist for dialerId: ' + dialerId);
                                callback(false, null);
                            }
                        }
                        conn.close();
                    });
                    request.addParameter('dialerId', TYPES.Int, dialerId);
                    request.addParameter('id1', TYPES.Int, propIds[0]);
                    request.addParameter('id2', TYPES.Int, propIds[1]);
                    conn.execSql(request);
                }
            });
        }
    }

    createProperties(config, dialerId, properties, page, callback) {
        if (dialerId !== null && properties !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    const table = this.getTable(page);
                    const sequenceName = table + '_SEQ';
                    MSSqlUtil.getSeqNextValWithoutUpdate(conn, sequenceName, (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            properties.delimId = pkey;
                            properties.recordLengthId = pkey + 1;
                            var seqVal = pkey + 1; // 2 records added , hence pkey + 1.
                            var useDelim = properties.useDelimiter ? 1 : 0;
                            log.info('Creating delim & record length fileformat property for dialer:' + dialerId);

                            var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, DIALER_ROWID, REF_NAME, END_POS, LINE_NUM) ' +
                                'VALUES (@delimId, @dialerId, @delimiter, @useDelim, @lineNum1);' +
                                'INSERT INTO ' + table + ' (PKEY_ID, DIALER_ROWID, START_POS, LINE_NUM) ' +
                                'VALUES (@recordLenId, @dialerId, @recordLen, @lineNum2)';

                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                    conn.close();
                                } else {
                                    MSSqlUtil.updateSeqCurrVal(conn, sequenceName, seqVal, (error) => {
                                        if (error) {
                                            log.error('Failed updating sequence currVal for ' + sequenceName + ':' + error);
                                            callback(null, error);
                                            conn.close();
                                        } else {
                                            //everything is successful here
                                            callback(properties, null);
                                            conn.close();
                                        }
                                    });
                                }                               
                            });
                            request.addParameter('delimId', TYPES.Int, properties.delimId);
                            request.addParameter('dialerId', TYPES.Int, dialerId);
                            request.addParameter('delimiter', TYPES.VarChar, properties.delimiter);
                            request.addParameter('useDelim', TYPES.Int, useDelim);
                            request.addParameter('lineNum1', TYPES.Int, -1);
                            request.addParameter('recordLenId', TYPES.Int, properties.recordLengthId);
                            request.addParameter('recordLen', TYPES.Int, properties.recordLength);
                            request.addParameter('lineNum2', TYPES.Int, 0);
                            conn.execSql(request);                            
                        }
                    });
                }
            });
        }
    }

    updateProperties(config, properties, page, callback) {
        if (properties !== null) {
            log.info('Updating delim file format property with id:' + properties.delimId);
            log.info('Updating record length file format property with id:' + properties.recordLengthId);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    var table = this.getTable(page);
                    var useDelim = properties.useDelimiter ? 1 : 0;

                    var sqlStr = 'UPDATE ' + table + ' SET REF_NAME = @delimiter, END_POS = @useDelim WHERE PKEY_ID = @delimId; ' +
                        'UPDATE ' + table + ' SET START_POS = @recordLength WHERE PKEY_ID = @recordLengthId';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('delimiter', TYPES.VarChar, properties.delimiter);
                    request.addParameter('useDelim', TYPES.Int, useDelim);
                    request.addParameter('delimId', TYPES.Int, properties.delimId);
                    request.addParameter('recordLength', TYPES.Int, properties.recordLength);
                    request.addParameter('recordLengthId', TYPES.Int, properties.recordLengthId);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, fileFormat, page, callback) {
        if (fileFormat !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating file formats lineNum...');

                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE DIALER_ROWID = @dialerId AND LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('dialerId', TYPES.Int, fileFormat.dialerId);
                    request.addParameter('lineNum', TYPES.Int, fileFormat.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    resetOrder(config, fileFormat, order, page, callback) {
        var conn = dbUtil.getConnection(config);
        var table = this.getTable(page);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting fileFormat order...');
                if (fileFormat !== null) {
                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order AND DIALER_ROWID = @dialerId';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order AND DIALER_ROWID = @dialerId';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = @order WHERE PKEY_ID = @fileFormatId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            fileFormat.lineNum = order;
                                            callback(fileFormat, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('fileFormatId', TYPES.Int, fileFormat.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            request.addParameter('dialerId', TYPES.Int, fileFormat.dialerId);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, fileFormat.lineNum);
                    request.addParameter('dialerId', TYPES.Int, fileFormat.dialerId);
                    conn.execSql(request);
                }
            }
        });
    }

    deleteAllDialerFileFormats(config, dialerId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                if (dialerId !== null) {
                    log.info('Deleting all dialer specific fileFormats (callresult, assginment, download, download suppliment) ...');

                    var sqlStr = 'DELETE FROM FAN_OUT WHERE DIALER_ROWID = @dialerId';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR1 :' + JSON.stringify(error));
                            callback(null, error);
                        } else {

                            var sqlStr = 'DELETE FROM FAN_OUT_1 WHERE DIALER_ROWID = @dialerId';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR2 :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {

                                    var sqlStr = 'DELETE FROM FAN_OUT_2 WHERE DIALER_ROWID = @dialerId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR3 :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {

                                            var sqlStr = 'DELETE FROM FAN_IN WHERE DIALER_ROWID = @dialerId';
                                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                                if (error) {
                                                    log.error('ERROR4 :' + JSON.stringify(error));
                                                    callback(null, error);
                                                } else {
                                                    callback(null, null);
                                                }
                                                conn.close();
                                            });
                                            request.addParameter('dialerId', TYPES.Int, dialerId);
                                            conn.execSql(request);
                                        }
                                    });
                                    request.addParameter('dialerId', TYPES.Int, dialerId);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('dialerId', TYPES.Int, dialerId);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('dialerId', TYPES.Int, dialerId);
                    conn.execSql(request);
                }
            }
        });
    }
}

const fileFormatSQLDB = new FileFormatSQLDB();
module.exports = fileFormatSQLDB;