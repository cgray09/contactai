var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class ScoreCardSQLDB {

    convertSC(element) {
        var sc = {};
        sc.id = element['PKEY'];
        sc.version = element['VERSION'];
        sc.buildDate = element['BUILD_DATE'];
        sc.activeDate = element['ACTIVE_DATE'];
        sc.activeVersion = element['ACTIVE_VERSION'];
        sc.newVersion = element['NEW_VERSION'];
        sc.scDefsHTML = element['SC_DEFS_HTML'];
        sc.tpDefsHTML = element['TP_DEFS_HTML'];
        sc.genCharDefsHTML = element['GEN_CHAR_DEFS_HTML'];
        return sc;
    }

    getSCsOB(rows) {
        if (Array.isArray(rows)) {
            var scs = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                scs.push(this.convertSC(rowObject));
            });
            return scs;
        }
    }

    getSCs(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM CT_SC_VERSIONS ORDER BY VERSION', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var scs = this.getSCsOB(rows);
                            callback(scs, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getSC(config, scId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM CT_SC_VERSIONS WHERE PKEY = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var scs = this.getSCsOB(rows);
                            callback(scs[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, scId);
                conn.execSql(request);
            }
        });
    }

    createSC(config, sc, callback) {
        if (sc !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating scoreCard...');
                    MSSqlUtil.getSeqNextVal(conn, 'CT_SC_VERSIONS_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO CT_SC_VERSIONS (PKEY, VERSION, BUILD_DATE, ACTIVE_DATE, ACTIVE_VERSION, NEW_VERSION, ' +
                                'SC_DEFS_HTML, TP_DEFS_HTML, GEN_CHAR_DEFS_HTML) ' +
                                'VALUES (@pkey, @version, @buildDt, @activeDt, @activeVer, @newVer, @scDefs, @tpDefs, @genCharDefs)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    sc.id = pkey;
                                    callback(sc, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('version', TYPES.Int, sc.version);
                            request.addParameter('buildDt', TYPES.DateTime, sc.buildDate);
                            request.addParameter('activeDt', TYPES.DateTime, sc.activeDate);
                            request.addParameter('activeVer', TYPES.Int, sc.activeVersion);
                            request.addParameter('newVer', TYPES.Int, sc.newVersion);
                            request.addParameter('scDefs', TYPES.Text, sc.scDefsHTML);
                            request.addParameter('tpDefs', TYPES.Text, sc.tpDefsHTML);
                            request.addParameter('genCharDefs', TYPES.Text, sc.genCharDefsHTML);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateSC(config, sc, callback) {
        if (sc !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating scoreCard with id:' + sc.id);
                    var sqlStr = 'UPDATE CT_SC_VERSIONS SET VERSION = @version, BUILD_DATE = @buildDt, ACTIVE_DATE = @activeDt, ' +
                        'ACTIVE_VERSION = @activeVer, NEW_VERSION = @newVer, SC_DEFS_HTML = @scDefs, TP_DEFS_HTML = @tpDefs, GEN_CHAR_DEFS_HTML = @genCharDefs ' +
                        'WHERE PKEY = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, sc.id);
                    request.addParameter('version', TYPES.Int, sc.version);
                    request.addParameter('buildDt', TYPES.DateTime, sc.buildDate);
                    request.addParameter('activeDt', TYPES.DateTime, sc.activeDate);
                    request.addParameter('activeVer', TYPES.Int, sc.activeVersion);
                    request.addParameter('newVer', TYPES.Int, sc.newVersion);
                    request.addParameter('scDefs', TYPES.Text, sc.scDefsHTML);
                    request.addParameter('tpDefs', TYPES.Text, sc.tpDefsHTML);
                    request.addParameter('genCharDefs', TYPES.Text, sc.genCharDefsHTML);
                    conn.execSql(request);
                }
            });
        }
    }

    deleteSC(config, sc, callback) {
        if (sc !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting scoreCard with id:' + sc.id);
                    var sqlStr = 'DELETE FROM CT_SC_VERSIONS WHERE PKEY = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, sc.id);
                    conn.execSql(request);
                }
            });
        }
    }

    activateSC(config, sc, callback) {
        if (sc !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Activating scoreCard with id:' + sc.id);
                    var sqlStr = 'UPDATE CT_SC_VERSIONS SET ACTIVE_VERSION = 1, NEW_VERSION = 1, ACTIVE_DATE = @dt WHERE PKEY = @pkey; ' +
                        'UPDATE CT_SC_VERSIONS SET ACTIVE_VERSION = 0, NEW_VERSION = 0 WHERE PKEY != @pkey;';
                        
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('dt', TYPES.DateTime, new Date());
                    request.addParameter('pkey', TYPES.Int, sc.id);
                    conn.execSql(request);
                }
            });
        }
    }

    /***************ScoreCard model def details ************** */
    convertDef(element) {
        var def = {};
        def.version = element['version'];
        def.scoreId = element['scoreid'];
        def.timeperiod = element['timeperiod'];
        def.type = element['type'];
        def.modelDefHtml = element['model_def_html'];
        return def;
    }

    getSCDefsOB(rows) {
        if (Array.isArray(rows)) {
            var defs = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                defs.push(this.convertDef(rowObject));
            });
            return defs;
        }        
    }

    getSCDefs(config, sc, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM CT_SC_MODEL_DEFS WHERE VERSION = @version', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var defs = this.getSCDefsOB(rows);
                            callback(defs, null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('version', TYPES.Int, sc.version);
                conn.execSql(request);
            }
        });
    }    

    getSCModelDef(config, filters, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM CT_SC_MODEL_DEFS ' + 
                'WHERE VERSION = @version AND SCOREID = @scoreId AND TIMEPERIOD = @period AND TYPE = @type';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback({}, null) }
                        else {
                            var defs = this.getSCDefsOB(rows);
                            callback(defs[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('version', TYPES.Int, filters.version);
                request.addParameter('scoreId', TYPES.Int, filters.scoreId);
                request.addParameter('period', TYPES.Int, filters.timeperiod);
                request.addParameter('type', TYPES.VarChar, filters.type.toLowerCase());
                conn.execSql(request);
            }
        });
    }
}

const scoreCardSQLDB = new ScoreCardSQLDB();
module.exports = scoreCardSQLDB;