var log = require('../../logger')(module);

class KeepCharPGDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "CALLRESULT": return "HISTORY_KEEPS";
            case "SUMMARIZATION": return "ACCT_KEEPS";
            case "ASSIGNMENT": return "SCORE_ACCTS_KEEPS_PARM";
            default: return "";
        }
    }
    
    convertKeepChar(element) {
        var keepChar = {};
        keepChar.id = element.PKEY_ID;
        keepChar.name = element.REF_NAME;
        keepChar.width = element.DB_WIDTH;
        keepChar.type = element.DB_TYPE;
        keepChar.description = element.DESCRIPTION;
        keepChar.lineNum = element.LINE_NUM;
        return keepChar;
    }

    getKeepCharsOB(results) {
        if (Array.isArray(results)) {
            var keepChars = [];
            results.forEach(element => {
                    keepChars.push(this.convertKeepChar(element));
            });
            return keepChars;
        } else {
            return this.convertKeepChar(results);
        }
    }

    getKeepChars(db, page, callback) {
        var table = this.getTable(page);
        db.any('SELECT * FROM ' + table + ' WHERE "LINE_NUM" > 0 ORDER BY "LINE_NUM"')
            .then((results) => {
                var keepChars = this.getKeepCharsOB(results);
                callback(keepChars, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getKeepChar(db, keepCharId, page, callback) {
        var table = this.getTable(page);
        db.one('SELECT * FROM ' + table + ' WHERE "PKEY_ID"= $1', keepCharId)
            .then((results) => {
                var keepChar = this.getKeepCharsOB(results);
                callback(keepChar, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createKeepChar(db, keepChar, page, callback) {
        var table = this.getTable(page);
        if (keepChar !== null) {
            var data = [keepChar.index, keepChar.name, keepChar.type, keepChar.width, keepChar.description];

            var sqlLock = `LOCK TABLE ` + table + ` IN EXCLUSIVE MODE`;
            var sqlStr1 = `UPDATE ` + table + ` SET "LINE_NUM" = "LINE_NUM" + 1 where "LINE_NUM" >= $1`;
            var sqlStr2 = `INSERT INTO ` + table + ` ("PKEY_ID", "LINE_NUM", "REF_NAME", "DB_TYPE", "DB_WIDTH", "DESCRIPTION")
                VALUES (NEXTVAL(\'"` + table + `_SEQ"\'), $1, $2, $3, $4, $5)
                RETURNING *`;

            db.tx(t => {
                const sqlLock1 = t.none(sqlLock)
                .catch((error) => {
                    return error;
                });

                const sqlRet1 = t.none(sqlStr1, data)
                .catch((error) => {
                    return error;
                });
                    
                const sqlRet2 = t.one(sqlStr2, data)
                .then((results) => {
                    var addedFileFormat = this.getFileFormatsOB(results);
                    return addedFileFormat;
                })
                .catch((error) => {
                    return error;
                });
                    
                return t.batch([sqlLock1, sqlRet1, sqlRet2]);
            })
            .then((results) => {
                callback(results, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
        }
    }

    updateKeepChar(db, keepChar, page, callback) {
        log.info('Updating keep characteristic with id:' + keepChar.id);
        var table = this.getTable(page);
        if (keepChar !== null) {
            var data = [keepChar.name, keepChar.type, keepChar.width, keepChar.description, keepChar.id];
            db.one('UPDATE ' + table + ' SET "REF_NAME" = $1, "DB_TYPE" = $2, "DB_WIDTH" = $3, "DESCRIPTION" = $4 ' +
                'WHERE "PKEY_ID" = $5 RETURNING *', data)
                .then((results) => {
                    var updatedKeepChar = this.getKeepCharsOB(results);
                    callback(updatedKeepChar, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteKeepChar(db, keepChar, page, callback) {
        log.info('Deleting keep characteristic with id:' + keepChar.id);
        var table = this.getTable(page);
        db.one('DELETE FROM ' + table + ' WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', keepChar.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, keepChar, page, callback) {
        log.info('Updating keep characteristics lineNum...');
        var table = this.getTable(page);
        if (keepChar !== null) {
            var data = [keepChar.lineNum];
            db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedKeepChars = this.getKeepCharsOB(results);
                    callback(updatedKeepChars, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    resetOrder(db, keepChar, order, page, callback) {
        log.info('Resetting keepChar order...');
        var table = this.getTable(page);
        if (keepChar !== null) {
            db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [keepChar.lineNum])
                .then((results) => {

                    db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE ' + table + ' SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, keepChar.id])
                                .then((results) => {
                                    var updatedKeepChar = this.getKeepCharsOB(results);
                                    callback(updatedKeepChar[0], null);
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
}

const keepCharPGDB = new KeepCharPGDB();
module.exports = keepCharPGDB;