var log = require('../../logger')(module);

class AnalysisCharPGDB {

    convertAnalysisChar(element) {
        var analysisChar = {};
        analysisChar.id = element.PKEY;
        analysisChar.name = element.NAME;
        analysisChar.source = element.SOURCE;
        analysisChar.type = element.TYPE;
        analysisChar.description = element.DESCRIPTION;
        analysisChar.lineNum = element.LINE_NUM;
        analysisChar.active = element.ACTIVE;
        analysisChar.groupr = element.GROUPR;
        return analysisChar;
    }

    getAnalysisCharsOB(results) {
        if (Array.isArray(results)) {
            var analysisChars = [];
            results.forEach(element => {
                analysisChars.push(this.convertAnalysisChar(element));
            });
            return analysisChars;
        } else {
            return this.convertAnalysisChar(results);
        }
    }

    getAnalysisChars(db, callback) {
        db.any('SELECT * FROM CT_SC_BASE_VARS ORDER BY "LINE_NUM"')
            .then((results) => {
                var analysisChars = this.getAnalysisCharsOB(results);
                callback(analysisChars, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getAnalysisChar(db, analysisCharId, callback) {
        db.one('SELECT * FROM CT_SC_BASE_VARS WHERE "PKEY"= $1', analysisCharId)
            .then((results) => {
                var analysisChar = this.getAnalysisCharsOB(results);
                callback(analysisChar, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createAnalysisChar(db, analysisChar, callback) {
        if (analysisChar !== null) {
            var data = [analysisChar.name, analysisChar.source, analysisChar.type, analysisChar.description,
                analysisChar.active, analysisChar.groupr];
            
                db.one('INSERT INTO CT_SC_BASE_VARS ("PKEY", "LINE_NUM", "NAME", "SOURCE", "TYPE", "DESCRIPTION", "ACTIVE", "GROUPR") ' +
                'VALUES (NEXTVAL(\'"CT_SC_BASE_VARS_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM CT_SC_BASE_VARS), $1, $2, $3, $4, $5, $6) ' +
                'RETURNING *', data)
                .then((results) => {
                    var addedAnalysisChar = this.getAnalysisCharsOB(results);
                    callback(addedAnalysisChar, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateAnalysisChar(db, analysisChar, callback) {
        if (analysisChar !== null) {
            log.info('Updating analysisChar with id:' + analysisChar.id);
            
            var data = [analysisChar.name, analysisChar.source, analysisChar.type, analysisChar.description,
                analysisChar.active, analysisChar.groupr, analysisChar.id];

            db.one('UPDATE CT_SC_BASE_VARS SET "NAME" = $1, "SOURCE" = $2, "TYPE" = $3, "DESCRIPTION" = $4, ' + 
                '"ACTIVE" = $5, "GROUPR" = $6 WHERE "PKEY" = $7 RETURNING *', data)
                .then((results) => {
                    var updatedAnalysisChar = this.getAnalysisCharsOB(results);
                    callback(updatedAnalysisChar, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteAnalysisChar(db, analysisChar, callback) {
        log.info('Deleting analysisChar with id:' + analysisChar.id);
        db.one('DELETE FROM CT_SC_BASE_VARS WHERE "PKEY"= $1 RETURNING "PKEY"', analysisChar.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, analysisChar, callback) {
        log.info('Updating analysisChar lineNum...');
        if (analysisChar !== null) {
            var data = [analysisChar.lineNum];
            db.any('UPDATE CT_SC_BASE_VARS SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedAnalysisChars = this.getAnalysisCharsOB(results);
                    callback(updatedAnalysisChars, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    resetOrder(db, analysisChar, order, callback) {
        log.info('Resetting analysisChar order...');
        if (analysisChar !== null) {
            db.any('UPDATE CT_SC_BASE_VARS SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [analysisChar.lineNum])
                .then((results) => {

                    db.any('UPDATE CT_SC_BASE_VARS SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE CT_SC_BASE_VARS SET "LINE_NUM" = $1 WHERE "PKEY"= $2 RETURNING *', [order, analysisChar.id])
                                .then((results) => {
                                    var updatedAnalysisChar = this.getAnalysisCharsOB(results);
                                    callback(updatedAnalysisChar[0], null);
                                })
                                .catch((error) => {
                                    log.error("ERROR:" + JSON.stringify(error));
                                    callback(null, error);
                                });
                        })
                        .catch((error) => {
                            log.error("ERROR:" + JSON.stringify(error));
                            callback(null, error);
                        });
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    importAnalysisChars(db, analysisChars, callback) {
        if (analysisChars !== null && analysisChars.length > 0) {
            
            var sqlStr = 'INSERT INTO CT_SC_BASE_VARS ("PKEY", "LINE_NUM", "NAME", "SOURCE", "TYPE", "DESCRIPTION", "ACTIVE", "GROUPR") ' +
            'VALUES (NEXTVAL(\'"CT_SC_BASE_VARS_SEQ"\'), (SELECT COUNT(*) FROM CT_SC_BASE_VARS), $1, $2, $3, $4, $5, $6) ';
            
            db.tx(t => {
                const queries = analysisChars.map(analysisChar => {
                    var data = [analysisChar.name, analysisChar.source, analysisChar.type, analysisChar.description,
                        analysisChar.active, analysisChar.groupr];
                    return t.none(sqlStr, data);
                });
                return t.batch(queries);
            })
                .then((results) => {
                    callback(null, null);
                })
                .catch(error => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
        
    }

    deleteAnalysisChars(db,callback) {
        log.info('Deleting all analysisChars...');
        db.any('TRUNCATE TABLE CT_SC_BASE_VARS')
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }
}

const analysisCharPGDB = new AnalysisCharPGDB();
module.exports = analysisCharPGDB;