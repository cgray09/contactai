var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class ExclusionsSQLDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "CALLRESULT": return "ACTIVITY_INCLUDE";
            case "DOWNLOAD": return "DL_INCLUDE";
            case "SCORECARDS": return "DEV_SAMPLE2";
            default: return "";
        }
    }
    
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
        def.equals = element['INCVALUE'];

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

    getDefinitions(config, page, callback) {
        var conn = dbUtil.getConnection(config);
        var table = this.getTable(page);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM ' + table + ' ORDER BY LINE_NUM';
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
                conn.execSql(request);
            }
        });
    }

    createDefinition(config, def, page, callback) {
        var table = this.getTable(page);
        if (def !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating exclusion definitions for ' + page);
                    MSSqlUtil.getSeqNextVal(conn, table + '_SEQ', (error, pkey) => {
                        if (error) {
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, ' +
                                'REF_NAME_1, DELIMITER, COMPARE, REF_NAME_2, CONNECTOR, INCVALUE,' +
                                'DESCRIPTION) VALUES (@pkey, @lineNum, @op1, @oper, @compare, @refName2, ' +
                                '@connector, @equals, @desc)';

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
                            request.addParameter('desc', TYPES.VarChar, def.description);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    deleteDefinitions(config, page, callback) {
        var conn = dbUtil.getConnection(config);
        var table = this.getTable(page);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting exclusion definitions for ' + page);
                var sqlStr = 'TRUNCATE TABLE ' + table;
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
var exclusionsSQLDB = new ExclusionsSQLDB();
module.exports = exclusionsSQLDB;