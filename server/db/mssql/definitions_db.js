var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class DefinitionsSQLDB {

    //--------------------------------------------------------- CALL RESULT -> STANDARDIZE DATA -> DEFINITIONS -------------------------------------------------------------
    
    convertDefinition(element) {
        var def = {};
        def.id = element['PKEY_ID'];
        def.lineNum = element['LINE_NUM'];
        def.description = element['DESCRIPTION'];
        def.operand1 = element['REF_NAME_1'];
        def.operator = element['DELIMITER'];
        def.compare = element['COMPARE'];
        def.refName2 = element['REF_NAME_2'];
        def.connector = element['CONNECTOR'];
        def.equals = element['CVALUE'];
        def.generateName = element['NAME']; //points to the parent variable name

        return def;
    }

    getDefinitionsOB(rows) {
        if (Array.isArray(rows)) {
            var definitions = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                definitions.push(this.convertDefinition(rowObject));
            });
            return definitions;
        }
    }

    getDefinitionsByRef(config, generateName, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM GENERATE_DETAIL WHERE NAME = @generateName ORDER BY LINE_NUM';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null); }
                        else {
                            var definitions = this.getDefinitionsOB(rows);
                            callback(definitions, null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('generateName', TYPES.VarChar, generateName);
                conn.execSql(request);
            }
        });
    }

    createDefinition(config, def, callback) {
        if (def !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating definition...');
                    MSSqlUtil.getSeqNextVal(conn, 'GENERATE_DETAIL_SEQ', (error, pkey) => {
                        if (error) {
                            callback(null, error);
                            conn.close();
                        } else {

                            var sqlStr = 'INSERT INTO GENERATE_DETAIL (PKEY_ID, LINE_NUM, ' +
                                'REF_NAME_1, DELIMITER, COMPARE, REF_NAME_2, CONNECTOR, CVALUE, ' +
                                'NAME, DESCRIPTION) VALUES (@pkey, @lineNum, @op1, @oper, @compare, @refName2, ' +
                                '@connector, @equals, @name, @desc)';

                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    def.id = pkey;
                                    callback(def, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('lineNum', TYPES.Int, def.lineNum);
                            request.addParameter('op1', TYPES.VarChar, def.operand1);
                            request.addParameter('oper', TYPES.VarChar, def.operator);
                            request.addParameter('compare', TYPES.VarChar, def.compare);
                            request.addParameter('refName2', TYPES.VarChar, def.refName2);
                            request.addParameter('connector', TYPES.VarChar, def.connector);
                            request.addParameter('equals', TYPES.VarChar, def.equals);
                            request.addParameter('name', TYPES.VarChar, def.generateName);
                            request.addParameter('desc', TYPES.VarChar, def.description);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    deleteDefinitionsByRef(config, generateName, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting definitions associated with variable: ' + generateName);
                var sqlStr = 'DELETE FROM GENERATE_DETAIL WHERE NAME = @ref';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                    conn.close();
                });
                request.addParameter('ref', TYPES.VarChar, generateName);
                conn.execSql(request);
            }
        });
    }
}

var definitionsSQLDB = new DefinitionsSQLDB();
module.exports = definitionsSQLDB;