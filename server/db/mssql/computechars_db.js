var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class ComputeCharSQLDB {

    getTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "SUMMARIZATION": return "HISTORY_GENERATE_2";
            case "DOWNLOAD": return "DL_GENERATE_2";
            default: return "";
        }
    }

    //generates the name that will be used to associated a characteristic with its definitions
    createDefName(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "SUMMARIZATION": return "ML_act_summary";
            case "DOWNLOAD": return "DL_chars";
            default: return "";
        }
    }

    convertCharacteristic(element) {
        var characteristic = {};
        characteristic.id = element['PKEY_ID'];
        characteristic.lineNum = element['LINE_NUM'];
        characteristic.name = element['REF_NAME'];
        characteristic.defName = element['REF_NAME'] + "-" + element['NAME'];
        characteristic.type = element['SUBPROC'];
        characteristic.description = element['DESCRIPTION'];
        characteristic.inputChar = element['INPUT_CHAR'];
        return characteristic;
    }

    getCharacteristicsOB(rows) {
        if (Array.isArray(rows)) {
            var characteristics = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                characteristics.push(this.convertCharacteristic(rowObject));
            });
            return characteristics;
        }
    }

    getCharacteristics(config, page, callback) {
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
                            var characteristics = this.getCharacteristicsOB(rows);
                            callback(characteristics, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getCharacteristic(config, characteristicId, page, callback) {
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
                            var characteristics = this.getCharacteristicsOB(rows);
                            callback(characteristics[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, characteristicId);
                conn.execSql(request);
            }
        });
    }

    createCharacteristic(config, characteristic, page, callback) {
        if (characteristic !== null) {
            var table = this.getTable(page);
            var sequenceName = table + '_SEQ';
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating characteristic...');
                    characteristic.defName = this.createDefName(page);

                    var sqlStr = `UPDATE ` + table + ` SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @index;
                    INSERT INTO ` + table + ` (PKEY_ID, LINE_NUM, REF_NAME, NAME, DESCRIPTION, SUBPROC)
                    VALUES ( (SELECT CURRVAL + INCR FROM ALLSEQUENCES WHERE SEQNAME = @seqName) , @index, @name, @defName, @desc, @type);
                    UPDATE ALLSEQUENCES SET CURRVAL = CURRVAL + INCR WHERE SEQNAME = @seqName`;

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(characteristic, null);
                        }
                        conn.close();
                    });
                    //request.addParameter('pkey', TYPES.Int, characteristic.id);
                    request.addParameter('seqName', TYPES.VarChar, sequenceName);
                    request.addParameter('name', TYPES.VarChar, characteristic.name);
                    request.addParameter('defName', TYPES.VarChar, characteristic.defName);
                    request.addParameter('desc', TYPES.VarChar, characteristic.description);
                    request.addParameter('type', TYPES.VarChar, characteristic.type);
                    request.addParameter('index', TYPES.Int, characteristic.index);
                    conn.execSql(request);
                }
            });
        }
    }

    /** create characteristic to end of list (last linenum + 1) in the DB */
    createCharacteristicEOL(config, characteristic, page, callback) {
        if (characteristic !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating characteristic...');
                    MSSqlUtil.getSeqNextVal(conn, table + '_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            characteristic.id = pkey;
                            characteristic.defName = this.createDefName(page);
                            
                            var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, REF_NAME, NAME, DESCRIPTION, SUBPROC) ' +
                                'VALUES (@pkey, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM ' + table + 
                                ' WHERE LINE_NUM > 0), @name, @defName, @desc, @type)';
                            
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    callback(characteristic, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, characteristic.id);
                            request.addParameter('name', TYPES.VarChar, characteristic.name);
                            request.addParameter('defName', TYPES.VarChar, characteristic.defName);
                            request.addParameter('desc', TYPES.VarChar, characteristic.description);
                            request.addParameter('type', TYPES.VarChar, characteristic.type);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }
    updateCharacteristic(config, characteristic, page, callback) {
        var table = this.getTable(page);
        if (characteristic !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating characteristic with id:' + characteristic.id);
                    var sqlStr = 'UPDATE ' + table + ' SET REF_NAME = @name, NAME = @defName, DESCRIPTION = @desc, SUBPROC = @type WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, characteristic.id);
                    request.addParameter('name', TYPES.VarChar, characteristic.name);
                    request.addParameter('defName', TYPES.VarChar, this.createDefName(page));
                    request.addParameter('desc', TYPES.VarChar, characteristic.description);
                    request.addParameter('type', TYPES.VarChar, characteristic.type);
                    conn.execSql(request);
                }
            });
        }
    }

    updateInputChar(config, characteristic, page, callback) {
        var table = this.getTable(page);
        if (characteristic !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating characteristic with id:' + characteristic.id);
                    var sqlStr = 'UPDATE ' + table + ' SET INPUT_CHAR = @inputChar WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, characteristic.id);
                    request.addParameter('inputChar', TYPES.VarChar, characteristic.inputChar);
                    conn.execSql(request);
                }
            });
        }
    }
    
    deleteCharacteristic(config, characteristic, page, callback) {
        if (characteristic !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting characteristic with id:' + characteristic.id);
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
                    request.addParameter('pkey', TYPES.Int, characteristic.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, characteristic, page, callback) {
        if (characteristic !== null) {
            var table = this.getTable(page);
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating characteristics lineNum...');

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
                    request.addParameter('lineNum', TYPES.Int, characteristic.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    resetOrder(config, characteristic, order, page, callback) {
        var conn = dbUtil.getConnection(config);
        var table = this.getTable(page);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting characteristic order...');
                if (characteristic !== null) {
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
                                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = @order WHERE PKEY_ID = @characterId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            characteristic.lineNum = order;
                                            callback(characteristic, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('characterId', TYPES.Int, characteristic.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, characteristic.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const computeCharSQLDB = new ComputeCharSQLDB();
module.exports = computeCharSQLDB;