var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class DiscretizeSQLDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "HISTORY_DISCRETIZE";
            case "DOWNLOAD": return "DL_DISCRETIZE";
            default: return "";
        }
    }

    convertDefinition(element) {
        var def = {};
        def.id = element['PKEY_ID'];
        def.asgValue = element['ASG_VALUE'];
        def.description = element['DESCRIPTION'];
        def.lineNum = element['LINE_NUM'];
        def.operand2 = element['LOWER_BOUND'];
        def.defName = element['NAME']; //points to the parent variable name

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

    getDefinitionsByRef(config, charDefName, page, callback) {
        let table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM ' + table + ' WHERE NAME = @charDefName ORDER BY LINE_NUM';
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
                request.addParameter('charDefName', TYPES.VarChar, charDefName);
                conn.execSql(request);
            }
        });
    }

    createDefinition(config, charDefName, def, page, callback) {
        let table = this.getTable(page);
        if (def !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating definition...');
                    MSSqlUtil.getSeqNextVal(conn, table +'_SEQ', (error, pkey) => {
                        if (error) {
                            callback(null, error);
                            conn.close();
                        } else {

                            var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, ASG_VALUE, DESCRIPTION, LOWER_BOUND, NAME) ' + 
                                'VALUES (@pkey, @lineNum, @asgVal, @desc, @operand2, @name)';

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
                            request.addParameter('asgVal', TYPES.VarChar, def.asgValue);
                            request.addParameter('desc', TYPES.VarChar, def.description);
                            request.addParameter('operand2', TYPES.VarChar, def.operand2);
                            request.addParameter('name', TYPES.VarChar, charDefName);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    deleteDefinitionsByRef(config, charDefName, page, callback) {
        let table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting definitions associated with characteristic: ' + charDefName);
                var sqlStr = 'DELETE FROM ' + table + ' WHERE NAME = @charDefName';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                    conn.close();
                });
                request.addParameter('charDefName', TYPES.VarChar, charDefName);
                conn.execSql(request);
            }
        });
    }

   updateLineNumOnDel(config, charDefName, def, page, callback) {
        let table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Updating definitions lineNum...');
                if (def !== null) {
                    var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE NAME = @charDefName ' +
                        'AND LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);w2u
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('charDefName', TYPES.Int, charDefName);
                    request.addParameter('lineNum', TYPES.Int, def.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

var discretizeSQLDB = new DiscretizeSQLDB();
module.exports = discretizeSQLDB;