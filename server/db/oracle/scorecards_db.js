var log = require('../../logger')(module);

class ScoreCardODB {

    convertSC(element) {
        var sc = {};
        sc.id = element[0];
        sc.version = element[1];
        sc.buildDate = element[2];
        sc.activeDate = element[3];
        sc.activeVersion = element[4];
        sc.newVersion = element[5];
        sc.scDefsHTML = element[6];
        sc.tpDefsHTML = element[7];
        sc.genCharDefsHTML = element[11];
        return sc;
    }

    getSCsOB(rows) {
        if (Array.isArray(rows)) {
            var scs = [];
            rows.forEach(row => {
                scs.push(this.convertSC(row));
            });
            return scs;
        }
    }

    getSCs(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM CT_SC_VERSIONS ORDER BY VERSION', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var scs = this.getSCsOB(results.rows);
                    callback(scs, null);
                }
            });
        });
    }

    getSC(connection, scId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM CT_SC_VERSIONS WHERE PKEY = :pkey';
            conn.execute(sqlStr, [scId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var scs = this.getSCsOB(results.rows);
                        callback(scs[0], null);
                    }
                }
            });
        });
    }

    createSC(connection, sc, callback) {
        connection.then((conn) => {
            log.info('Creating scoreCard...');
            if (sc !== null) {
                conn.execute('SELECT CT_SC_VERSIONS_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        sc.id = results.rows[0][0];

                        var sqlStr = 'INSERT INTO CT_SC_VERSIONS (PKEY, VERSION, BUILD_DATE, ACTIVE_DATE, ACTIVE_VERSION, NEW_VERSION, ' +
                            'SC_DEFS_HTML, TP_DEFS_HTML, GEN_CHAR_DEFS_HTML) ' +
                            'VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)';

                        var bind = [sc.id, sc.version, sc.buildDate, sc.activeDate, sc.activeVersion, sc.newVersion,
                            sc.scDefsHTML, sc.tpDefsHTML, sc.genCharDefsHTML];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(sc, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateSC(connection, sc, callback) {
        connection.then((conn) => {
            log.info('Updating scoreCard with id:' + sc.id);
            if (sc !== null) {
                var sqlStr = 'UPDATE CT_SC_VERSIONS SET VERSION = :1, BUILD_DATE = :2, ACTIVE_DATE = :3, ACTIVE_VERSION = :4, ' +
                'NEW_VERSION = :5, SC_DEFS_HTML = :6, TP_DEFS_HTML = :7, GEN_CHAR_DEFS_HTML = :8 WHERE PKEY = :9';

                var bind = [sc.version, sc.buildDate, sc.activeDate, sc.activeVersion, sc.newVersion,
                    sc.scDefsHTML, sc.tpDefsHTML, sc.genCharDefsHTML, sc.id];

                conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                });
            }
        });
    }

    deleteSC(connection, sc, callback) {
        connection.then((conn) => {
            log.info('Deleting scoreCard with id:' + sc.id);
            var sqlStr = 'DELETE FROM CT_SC_VERSIONS WHERE PKEY = :pkey';
            conn.execute(sqlStr, [sc.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    activateSC(connection, sc, callback) {
        connection.then((conn) => {
            if (sc !== null) {
                var sqlStr1 = 'UPDATE CT_SC_VERSIONS SET ACTIVE_VERSION = 1, NEW_VERSION = 1, ACTIVE_DATE = :1 WHERE PKEY = :2';
                var sqlStr2 = 'UPDATE CT_SC_VERSIONS SET ACTIVE_VERSION = 0, NEW_VERSION = 0 WHERE PKEY != :1';

                log.info('Activating scoreCard with id:' + sc.id);
                sc.activeDate = new Date();
                conn.execute(sqlStr1, [sc.activeDate, sc.id], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        conn.execute(sqlStr2, [sc.id], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(null, null);
                            }
                        });
                    }
                });
            }
        });
    }

    /***************ScoreCard model def details ************** */
    convertDef(element) {
        var def = {};
        def.version = element[0];
        def.scoreId = element[1];
        def.timeperiod = element[2];
        def.type = element[3];
        def.modelDefHtml = element[4];
        return def;
    }
     
    getSCDefsOB(rows) {
        if (Array.isArray(rows)) {
            var defs = [];
            rows.forEach(row => {
                defs.push(this.convertDef(row));
            });
            return defs;
        }
    }

    getSCDefs(connection, sc, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM CT_SC_MODEL_DEFS WHERE VERSION = :1';
            conn.execute(sqlStr, [sc.version], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    let defs = this.getSCDefsOB(results.rows);
                    callback(defs, null);
                }
            });
        });
    }    

    getSCModelDef(connection, filters, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM CT_SC_MODEL_DEFS ' + 
                'WHERE VERSION = :1 AND SCOREID = :2 AND TIMEPERIOD = :3 AND TYPE = :4';
            var bind = [filters.version, filters.scoreId, filters.timeperiod, filters.type.toLowerCase()];
            
            conn.execute(sqlStr, bind, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback({}, null) }
                    else {
                        var defs = this.getSCDefsOB(results.rows);
                        callback(defs[0], null);
                    }
                }
            });
        });
    }
}

const scoreCardODB = new ScoreCardODB();
module.exports = scoreCardODB;