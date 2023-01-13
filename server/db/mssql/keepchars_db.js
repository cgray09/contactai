var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class KeepCharSQLDB {
    
    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "CALLRESULT": return "HISTORY_KEEPS";
            case "SUMMARIZATION": return "ACCT_KEEPS";
            case "ASSIGNMENT": return "SCORE_ACCTS_KEEPS_PARM";
            default: return "";
        }
    }

    convertKeepChar(element) {
        var keepChar = {};
        keepChar.id = element['PKEY_ID'];
        keepChar.type = element['DB_TYPE'];
        keepChar.width = element['DB_WIDTH'];
        keepChar.description = element['DESCRIPTION'];
        keepChar.lineNum = element['LINE_NUM'];
        keepChar.name = element['REF_NAME'];
        return keepChar;
    }

    getKeepCharsOB(rows) {
        if (Array.isArray(rows)) {
            var keepChars = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                keepChars.push(this.convertKeepChar(rowObject));
            });
            return keepChars;
        }
    }

    getKeepChars(config, page, callback) {
        var table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM ' + table + ' WHERE LINE_NUM > 0 ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var keepChars = this.getKeepCharsOB(rows);
                            callback(keepChars, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getKeepChar(config, keepCharId, page, callback) {
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
                            var keepChars = this.getKeepCharsOB(rows);
                            callback(keepChars[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, keepCharId);
                conn.execSql(request);
            }
        });
    }

    createKeepChar(config, keepChar, page, callback) {
        if (keepChar !== null) {
            var table = this.getTable(page);
            var sequenceName = table + '_SEQ';
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating keep characteristic...');
                    var sqlStr = `UPDATE ` + table + ` SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @lineNum;
                            INSERT INTO ` + table + ` (PKEY_ID, LINE_NUM, REF_NAME, DB_TYPE, DB_WIDTH, DESCRIPTION)
                            VALUES ( (SELECT CURRVAL + INCR FROM ALLSEQUENCES WHERE SEQNAME = @seqName) , @lineNum, @name, @type, @width, @desc);
                            UPDATE ALLSEQUENCES SET CURRVAL = CURRVAL + INCR WHERE SEQNAME = @seqName`;
                                
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            //keepChar.id = pkey;
                            callback(keepChar, null);
                        }
                        conn.close();
                    });
                    //request.addParameter('pkey', TYPES.Int, pkey);
                    request.addParameter('seqName', TYPES.VarChar, sequenceName);
                    request.addParameter('name', TYPES.VarChar, keepChar.name);
                    request.addParameter('type', TYPES.VarChar, keepChar.type);
                    request.addParameter('width', TYPES.VarChar, String(keepChar.width));
                    request.addParameter('desc', TYPES.VarChar, keepChar.description);
                    request.addParameter('lineNum', TYPES.Int, keepChar.index);
                    conn.execSql(request);
                }
            });
        }
    }

    updateKeepChar(config, keepChar, page, callback) {
        if (keepChar !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating keep characteristic with id:' + keepChar.id);
                    var sqlStr = 'UPDATE ' + table + ' SET REF_NAME = @name, DB_TYPE = @type, DB_WIDTH = @width, DESCRIPTION = @desc WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, keepChar.id);
                    request.addParameter('name', TYPES.VarChar, keepChar.name);
                    request.addParameter('type', TYPES.VarChar, keepChar.type);
                    request.addParameter('width', TYPES.VarChar, String(keepChar.width));
                    request.addParameter('desc', TYPES.VarChar, keepChar.description);
                    conn.execSql(request);
                }
            });
        }
    }

    deleteKeepChar(config, keepChar, page, callback) {
        if (keepChar !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting keep characteristic with id:' + keepChar.id);
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
                    request.addParameter('pkey', TYPES.Int, keepChar.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, keepChar, page, callback) {
        if (keepChar !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating keep characteristics lineNum...');

                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, keepChar.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    resetOrder(config, keepChar, order, page, callback) {
        var conn = dbUtil.getConnection(config);
        var table = this.getTable(page);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting keepChar order...');
                if (keepChar !== null) {
                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = @order WHERE PKEY_ID = @keepCharId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            keepChar.lineNum = order;
                                            callback(keepChar, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('keepCharId', TYPES.Int, keepChar.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, keepChar.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const keepCharSQLDB = new KeepCharSQLDB();
module.exports = keepCharSQLDB;