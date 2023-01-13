var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class CallResultSQLDB {

    convertVariable(element) {
        var variable = {};
        variable.id = element['PKEY_ID'];
        variable.lineNum = element['LINE_NUM'];
        variable.name = element['REF_NAME'];
        variable.generateName = element['NAME'];
        variable.description = element['DESCRIPTION'];
        return variable;
    }

    getVariablesOB(rows) {
        if (Array.isArray(rows)) {
            var variables = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                variables.push(this.convertVariable(rowObject));
            });
            return variables;
        }
    }

    getVariables(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM GENERATE ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var variables = this.getVariablesOB(rows);
                            callback(variables, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getVariable(config, variableId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM GENERATE WHERE PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var variables = this.getVariablesOB(rows);
                            callback(variables[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, variableId);
                conn.execSql(request);
            }
        });
    }

    createVariable(config, variable, callback) {
        if (variable !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating call result variable...');
                    var sqlStr = `UPDATE GENERATE SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @index;
                            INSERT INTO GENERATE (PKEY_ID, LINE_NUM, REF_NAME, NAME, DESCRIPTION)
                            VALUES ( (SELECT CURRVAL + INCR FROM ALLSEQUENCES WHERE SEQNAME = 'generate_seq') , @index, @name, @generateName, @desc);
                            UPDATE ALLSEQUENCES SET CURRVAL = CURRVAL + INCR WHERE SEQNAME = 'generate_seq'`;

                    log.info("creating entry "+variable.name);
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(variable, null);
                        }
                        conn.close();
                    });
                    request.addParameter('index', TYPES.Int, variable.index);
                    request.addParameter('name', TYPES.VarChar, variable.name);
                    request.addParameter('generateName', TYPES.VarChar, variable.generateName);
                    request.addParameter('desc', TYPES.VarChar, variable.description);
                    conn.execSql(request);
                }
            });
        }
    }

    updateVariable(config, variable, callback) {
        if (variable !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating variable with id:' + variable.id);
                    var sqlStr = 'UPDATE GENERATE SET REF_NAME = @name, NAME = @generateName, DESCRIPTION = @desc WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, variable.id);
                    request.addParameter('name', TYPES.VarChar, variable.name);
                    request.addParameter('generateName', TYPES.VarChar, variable.generateName);
                    request.addParameter('desc', TYPES.VarChar, variable.description);
                    conn.execSql(request);
                }
            });
        }
    }

    deleteVariable(config, variable, callback) {
        if (variable !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting variable with id:' + variable.id);
                    var sqlStr = 'DELETE FROM GENERATE WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, variable.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, variable, callback) {
        if (variable !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating variables lineNum...');

                    var sqlStr = 'UPDATE GENERATE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, variable.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    resetOrder(config, variable, order, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting variables order...');
                if (variable !== null) {
                    var sqlStr = 'UPDATE GENERATE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE GENERATE SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE GENERATE SET LINE_NUM = @order WHERE PKEY_ID = @variableId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            variable.lineNum = order;
                                            callback(variable, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('variableId', TYPES.Int, variable.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, variable.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const callResultSQLDB = new CallResultSQLDB();
module.exports = callResultSQLDB;