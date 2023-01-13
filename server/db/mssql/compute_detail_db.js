var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class DetailsSQLDB {

    getTableSequence(tableName) {
        switch (tableName.toUpperCase()) {
            case "HISTORY_DETAIL": return "HISTORY_DETAIL_SEQ";
            case "DL_DETAIL": return "DL_DETAIL_SEQ";
            default: return "";
        }
    }
    
    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "HISTORY_DETAIL";
            case "DOWNLOAD": return "DL_DETAIL";
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
        def.equals = element['CVALUE'];
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
                    MSSqlUtil.getSeqNextVal(conn, table +'_SEQ', (error, pkey) => {
                        if (error) {
                            callback(null, error);
                            conn.close();
                        } else {

                            var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, ' +
                                'REF_NAME_1, DELIMITER, COMPARE, REF_NAME_2, CONNECTOR, CVALUE,' +
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
                            request.addParameter('name', TYPES.VarChar, charDefName);
                            request.addParameter('desc', TYPES.VarChar, def.description);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    /* used for bulk create - createDS definitions creation */
    createDefinitions(config, defs, page, callback) {
       if (defs !== null && defs.length > 0) {
            let table = this.getTable(page);
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
                            const options = { keepNulls: true };
                            
                            const bulkLoad = conn.newBulkLoad(table, options, (error, rowCount) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    //when bulkLoad is successful, update the sequence value to latest.
                                    var seqVal = pkey + (defs.length - 1);
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
                            bulkLoad.addColumn('REF_NAME_1', TYPES.VarChar, { length: 50, nullable: true });
                            bulkLoad.addColumn('DELIMITER', TYPES.VarChar, { length: 10, nullable: true });
                            bulkLoad.addColumn('COMPARE', TYPES.VarChar, { length: 40, nullable: true });
                            bulkLoad.addColumn('REF_NAME_2', TYPES.VarChar, { length: 50, nullable: true });
                            bulkLoad.addColumn('CONNECTOR', TYPES.VarChar, { length: 10, nullable: true });
                            bulkLoad.addColumn('CVALUE', TYPES.VarChar, { length: 40, nullable: true });
                            bulkLoad.addColumn('NAME', TYPES.VarChar, { length: 70, nullable: true });
                            bulkLoad.addColumn('DESCRIPTION', TYPES.VarChar, { length: 150, nullable: true });
                            
                            const dataBinds = [];
                            defs.map( def => {
                                dataBinds.push({
                                    PKEY_ID: pkey++, LINE_NUM: def.lineNum, REF_NAME_1: def.operand1, 
                                    DELIMITER: def.operator, COMPARE: def.compare, REF_NAME_2: def.refName2,
                                    CONNECTOR: def.connector, CVALUE: def.equals, NAME: def.defName, DESCRIPTION: def.description
                                });
                            });

                            conn.execBulkLoad(bulkLoad, dataBinds);
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

var detailsSQLDB = new DetailsSQLDB();
module.exports = detailsSQLDB;