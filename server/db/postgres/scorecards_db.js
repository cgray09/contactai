var log = require('../../logger')(module);

class ScoreCardPGDB {

    convertSC(element) {
        var sc = {};
        sc.id = element.PKEY;
        sc.version = element.VERSION;
        sc.buildDate = element.BUILD_DATE;
        sc.activeDate = element.ACTIVE_DATE;
        sc.activeVersion = element.ACTIVE_VERSION;
        sc.newVersion = element.NEW_VERSION;
        sc.scDefsHTML = element.SC_DEFS_HTML;
        sc.tpDefsHTML = element.TP_DEFS_HTML;
        sc.genCharDefsHTML = element.GEN_CHAR_DEFS_HTML;
        return sc;
    }

    getSCsOB(results) {
        if (Array.isArray(results)) {
            var scs = [];
            results.forEach(element => {
                scs.push(this.convertSC(element));
            });
            return scs;
        } else {
            return this.convertSC(results);
        }
    }

    getSCs(db, callback) {
        db.any('SELECT * FROM CT_SC_VERSIONS ORDER BY "VERSION"')
            .then((results) => {
                var scs = this.getSCsOB(results);
                callback(scs, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getSC(db, scId, callback) {
        db.one('SELECT * FROM CT_SC_VERSIONS WHERE "PKEY"= $1', scId)
            .then((results) => {
                var sc = this.getSCsOB(results);
                callback(sc, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createSC(db, sc, callback) {
        if (sc !== null) {
            var data = [sc.version, sc.buildDate, sc.activeDate, sc.activeVersion, sc.newVersion,
            sc.scDefsHTML, sc.tpDefsHTML, sc.genCharDefsHTML];

            db.one('INSERT INTO CT_SC_VERSIONS("PKEY", "VERSION", "BUILD_DATE", "ACTIVE_DATE", "ACTIVE_VERSION", "NEW_VERSION", ' +
                '"SC_DEFS_HTML", "TP_DEFS_HTML", "GEN_CHAR_DEFS_HTML") ' +
                'VALUES (NEXTVAL(\'"CT_SC_VERSIONS_SEQ"\'), $1, $2, $3, $4, $5, $6, $7, $8) ' +
                'RETURNING *', data)
                .then((results) => {
                    var addedSC = this.getSCsOB(results);
                    callback(addedSC, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateSC(db, sc, callback) {
        if (sc !== null) {
            log.info('Updating scorecard with id:' + sc.id);

            var data = [sc.version, sc.buildDate, sc.activeDate, sc.activeVersion, sc.newVersion,
            sc.scDefsHTML, sc.tpDefsHTML, sc.genCharDefsHTML, sc.id];

            db.one('UPDATE CT_SC_VERSIONS SET "VERSION" = $1, "BUILD_DATE" = $2, "ACTIVE_DATE" = $3, "ACTIVE_VERSION" = $4, ' +
                '"NEW_VERSION" = $5, "SC_DEFS_HTML" = $6, "TP_DEFS_HTML" = $7, "GEN_CHAR_DEFS_HTML" = $8 ' +
                'WHERE "PKEY" = $9 RETURNING *', data)
                .then((results) => {
                    var updatedSC = this.getSCsOB(results);
                    callback(updatedSC, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteSC(db, sc, callback) {
        log.info('Deleting scorecard with id:' + sc.id);
        db.one('DELETE FROM CT_SC_VERSIONS WHERE "PKEY"= $1 RETURNING "PKEY"', sc.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    activateSC(db, sc, callback) {
        if (sc !== null) {
            log.info('Activating scorecard with id:' + sc.id);
            sc.activeDate = new Date();
            var data = [sc.activeDate, sc.id];
            db.any('UPDATE CT_SC_VERSIONS SET "ACTIVE_VERSION" = 1, "NEW_VERSION" = 1, ' + 
                '"ACTIVE_DATE" = TO_TIMESTAMP($1, \'YYYY-MM-DD HH24:MI:SS \') WHERE "PKEY" = $2;' +
                'UPDATE CT_SC_VERSIONS SET "ACTIVE_VERSION" = 0, "NEW_VERSION" = 0 WHERE "PKEY" != $2 RETURNING *', data)
                .then((results) => {
                    callback(null, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    } 

    /***************ScoreCard model def details ************** */
    
    convertDef(element) {
        var def = {};
        def.version = element.VERSION;
        def.scoreId = element.SCOREID;
        def.timeperiod = element.TIMEPERIOD;
        def.type = element.TYPE;
        def.modelDefHtml = element.MODEL_DEF_HTML;
        return def;
    }

    getSCDefsOB(results) {
        if (Array.isArray(results)) {
            var defs = [];
            results.forEach(element => {
                defs.push(this.convertDef(element));
            });
            return defs;
        } else {
            return this.convertDef(results);
        }
    }

    getSCDefs(db, sc, callback) {
        var sqlStr = 'SELECT * FROM CT_SC_MODEL_DEFS WHERE "VERSION" = $1';
        db.any(sqlStr, sc.version)
            .then(results => {
                let defs = this.getSCDefsOB(results);
                callback(defs, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getSCModelDef(db, filters, callback) {
        var data = [filters.version, filters.scoreId, filters.timeperiod, filters.type.toLowerCase()];
        var sqlStr = 'SELECT * FROM CT_SC_MODEL_DEFS ' + 
            'WHERE "VERSION" = $1 AND "SCOREID" = $2 AND "TIMEPERIOD" = $3 AND "TYPE" = $4';
        
        db.any(sqlStr, data)
            .then(results => {
                let modelDef = results.length > 0 ? this.getSCDefsOB(results[0]) : {};
                callback(modelDef, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }
}

const scPGDB = new ScoreCardPGDB();
module.exports = scPGDB;