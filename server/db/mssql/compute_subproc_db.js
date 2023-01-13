var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class SubprocSQLDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "HISTORY_SUBPROC";
            case "DOWNLOAD": return "DL_SUBPROC";
            default: return "";
        }
    }

    convertDefinition(element) {
        var def = {};
        def.id = element['PKEY_ID'];
        def.actChar = element['ACT_CHAR'];
        def.anchor = element['ANCHOR'];
        def.connector = element['BOOL_CONN'];
        def.delim1 = element['DELIM_1'];
        def.delim2 = element['DELIM_2'];
        def.event1 = element['EVENT_1'];
        def.event2 = element['EVENT_2'];
        def.range = element['RANGE'];
        def.value1 = element['VALUE_1'];
        def.value2 = element['VALUE_2'];
        def.defName = element['NAME']; //points to the parent name
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

    getDefinitionByRef(config, charDefName, page, callback) {
        let table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM ' + table + ' WHERE NAME = @charDefName';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null); }
                        else {
                            var definitions = this.getDefinitionsOB(rows);
                            callback(definitions[0], null);
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
                    MSSqlUtil.getSeqNextVal(conn,  table + '_SEQ', (error, pkey) => {
                        if (error) {
                            callback(null, error);
                            conn.close();
                        } else {                            
                            var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, ACT_CHAR, ANCHOR, BOOL_CONN, ' +
                                'DELIM_1, DELIM_2, EVENT_1, EVENT_2, RANGE, VALUE_1, VALUE_2, NAME) ' +
                                'VALUES (@pkey, @actChar, @anchor, @connector, @delim1, @delim2, ' +
                                '@event1, @event2, @range, @val1, @val2, @name)';

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
                            request.addParameter('actChar', TYPES.VarChar, def.actChar);
                            request.addParameter('anchor', TYPES.VarChar, def.anchor);
                            request.addParameter('connector', TYPES.VarChar, def.connector);
                            request.addParameter('delim1', TYPES.VarChar, def.delim1);
                            request.addParameter('delim2', TYPES.VarChar, def.delim2);
                            request.addParameter('event1', TYPES.VarChar, def.event1);
                            request.addParameter('event2', TYPES.VarChar, def.event2);
                            request.addParameter('range', TYPES.VarChar, def.range);
                            request.addParameter('val1', TYPES.VarChar, def.value1);
                            request.addParameter('val2', TYPES.VarChar, def.value2);
                            request.addParameter('name', TYPES.VarChar, charDefName);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateDefinition(config, def, page, callback) {
        let table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Updating definition with id: ' + def.id);
                if (def !== null) {
                    var sqlStr = 'UPDATE ' + table + ' SET ACT_CHAR = @actChar, ANCHOR = @anchor, ' +
                    'BOOL_CONN = @connector, DELIM_1 = @delim1, DELIM_2 = @delim2, EVENT_1 = @event1, EVENT_2 = @event2, ' +
                    'RANGE = @range, VALUE_1 = @val1, VALUE_2 = @val2 WHERE PKEY_ID = @pkey';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, def.id);
                    request.addParameter('actChar', TYPES.VarChar, def.actChar);
                    request.addParameter('anchor', TYPES.VarChar, def.anchor);
                    request.addParameter('connector', TYPES.VarChar, def.connector);
                    request.addParameter('delim1', TYPES.VarChar, def.delim1);
                    request.addParameter('delim2', TYPES.VarChar, def.delim2);
                    request.addParameter('event1', TYPES.VarChar, def.event1);
                    request.addParameter('event2', TYPES.VarChar, def.event2);
                    request.addParameter('range', TYPES.VarChar, def.range);
                    request.addParameter('val1', TYPES.VarChar, def.value1);
                    request.addParameter('val2', TYPES.VarChar, def.value2);
                    conn.execSql(request);
                }
            }
        });
    }

    deleteDefinition(config, def, page, callback) {
        let table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting definition with id: ' + def.id);
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
                request.addParameter('pkey', TYPES.Int, def.id);
                conn.execSql(request);
            }
        });
    }

    deleteDefinitionByRef(config, charDefName, page, callback) {
        let table = this.getTable(page);
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Deleting definitions associated with variable: ' + charDefName);
                var sqlStr = 'DELETE FROM ' + table + ' WHERE NAME = @ref'; 
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                    conn.close();
                });
                request.addParameter('ref', TYPES.VarChar, charDefName);
                conn.execSql(request);
            }
        });
    }
   
}

var subprocSQLDB = new SubprocSQLDB();
module.exports = subprocSQLDB;