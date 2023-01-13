var log = require('../../logger')(module);

class FileFormatPGDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "CALLRESULT": return "FAN_OUT";
            case "DLFILEFORMAT": return "FAN_OUT_1";
            case "DLSUPPFILEFORMAT": return "FAN_OUT_2";
            case "ASSIGNMENT": return "FAN_IN";
            default: return "";
        }
    }
    
    convertFileFormat(element) {
        var fileFormat = {};
        fileFormat.id = element.PKEY_ID;
        fileFormat.dialerId = element.DIALER_ROWID;
        fileFormat.name = element.REF_NAME;
        fileFormat.startPos = element.START_POS;
        fileFormat.endPos = element.END_POS;
        fileFormat.fieldLength = element.FIELD_LENGTH;
        fileFormat.type = element.FIELD_FORMAT;
        fileFormat.formatter = element.STD_PROC;
        fileFormat.specialInfo = element.ML_KEY;
        fileFormat.description = element.DESCRIPTION;
        fileFormat.lineNum = element.LINE_NUM;
        log.debug("Newly modeled fileFormat object:");
        log.debug(JSON.stringify(fileFormat));
        return fileFormat;
    }

    getFileFormatsOB(results) {
        if (Array.isArray(results)) {
            var fileFormats = [];
            results.forEach(element => {
                fileFormats.push(this.convertFileFormat(element));
            });
            return fileFormats;
        } else {
            return this.convertFileFormat(results);
        }
    }

    getFileFormats(db, dialerId, page, callback) {
        var table = this.getTable(page);
        db.any('SELECT * FROM ' + table + ' WHERE "DIALER_ROWID" = ' + dialerId + ' AND "LINE_NUM" > -2 ORDER BY "LINE_NUM"')
            .then((results) => {
                var fileFormats = this.getFileFormatsOB(results);
                callback(fileFormats, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getFileFormat(db, fileFormatId, page, callback) {
        var table = this.getTable(page);
        db.one('SELECT * FROM ' + table + ' WHERE "PKEY_ID"= $1', fileFormatId)
            .then((results) => {
                var fileFormat = this.getFileFormatsOB(results);
                callback(fileFormat, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createFileFormat(db, fileFormat, dialerId, page, callback) {
        if (fileFormat !== null) {
            var table = this.getTable(page);

            var insertCols = [ "PKEY_ID", "LINE_NUM", "DIALER_ROWID", "REF_NAME", "START_POS", "END_POS",
                            "FIELD_LENGTH", "FIELD_FORMAT", "STD_PROC", "DESCRIPTION"];
            var data = [ fileFormat.index, fileFormat.dialerId, fileFormat.name, fileFormat.startPos, fileFormat.endPos,
                        fileFormat.fieldLength, fileFormat.type, fileFormat.formatter, fileFormat.description];
            if ( table !== "FAN_IN" ) {
                insertCols.push("ML_KEY");
                data.push(fileFormat.specialInfo);
            }
            var valuesStr = "$1";
            for( var i = 1; i < data.length; i++ ) { valuesStr+= ", $"+(i+1); };

            var sqlLock = `LOCK TABLE ` + table + ` IN EXCLUSIVE MODE`;
            var sqlStr1 = `UPDATE ` + table + ` SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "DIALER_ROWID" = $2 AND "LINE_NUM" >= $1`;
            var sqlStr2 = `INSERT INTO ` + table + `( "` + insertCols.join('", "') + `")
            VALUES (NEXTVAL('"` + table + `_SEQ"'), ` + valuesStr + `)
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

    importFileFormats(db, formatList, dialerId, page, callback) {
        if (formatList !== null && formatList.length > 0) {
            var table = this.getTable(page);

            var sqlStr = 'INSERT INTO ' + table + '("PKEY_ID", "LINE_NUM", "DIALER_ROWID", "REF_NAME", "START_POS", "END_POS", ' +
            '"FIELD_LENGTH", "FIELD_FORMAT", "STD_PROC", "ML_KEY", "DESCRIPTION") ' +
            'VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM ' + table + ' WHERE "DIALER_ROWID" = $1 AND "LINE_NUM" > 0), ' +
            '$1, $2, $3, $4, $5, $6, $7, $8, $9) ';
            
            if(table === "FAN_IN") {
                sqlStr = 'INSERT INTO ' + table + '("PKEY_ID", "LINE_NUM", "DIALER_ROWID", "REF_NAME", "START_POS", "END_POS", ' +
                '"FIELD_LENGTH", "FIELD_FORMAT", "STD_PROC", "DESCRIPTION") ' +
                'VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM ' + table + ' WHERE "DIALER_ROWID" = $1 AND "LINE_NUM" > 0), ' +
                '$1, $2, $3, $4, $5, $6, $7, $9) ';
            }

            db.tx(t => {
                const queries = formatList.map(fileFormat => {
                    var data = [parseInt(dialerId), fileFormat.name, fileFormat.startPos, fileFormat.endPos, fileFormat.fieldLength,
                        fileFormat.type, fileFormat.formatter, fileFormat.specialInfo, fileFormat.description];
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

    updateFileFormat(db, fileFormat, page, callback) {
        log.info('Updating file format with id:' + fileFormat.id);
        var table = this.getTable(page);
        if (fileFormat !== null) {
            var data = [fileFormat.dialerId, fileFormat.name, fileFormat.startPos, fileFormat.endPos, fileFormat.fieldLength,
            fileFormat.type, fileFormat.formatter, fileFormat.specialInfo, fileFormat.description, fileFormat.id];

            var sqlStr = 'UPDATE ' + table + ' SET "DIALER_ROWID" = $1, "REF_NAME" = $2, "START_POS" = $3, "END_POS" = $4, "FIELD_LENGTH" = $5, ' +
            '"FIELD_FORMAT" = $6, "STD_PROC" = $7, "ML_KEY" = $8, "DESCRIPTION" = $9 WHERE "PKEY_ID" = $10 ' +
            'RETURNING *';
            
            if (table === "FAN_IN") {
                sqlStr = 'UPDATE ' + table + ' SET "DIALER_ROWID" = $1, "REF_NAME" = $2, "START_POS" = $3, "END_POS" = $4, "FIELD_LENGTH" = $5, ' +
                '"FIELD_FORMAT" = $6, "STD_PROC" = $7, "DESCRIPTION" = $9 WHERE "PKEY_ID" = $10 ' +
                'RETURNING *';
            }

            db.one(sqlStr, data)
                .then((results) => {
                    var updatedFileFormat = this.getFileFormatsOB(results);
                    callback(updatedFileFormat, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteFileFormat(db, fileFormat, page, callback) {
        log.info('Deleting file format with id:' + fileFormat.id);
        var table = this.getTable(page);
        db.one('DELETE FROM ' + table + ' WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', fileFormat.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    deleteFileFormats(db, dialerId, page, callback) {
        log.info('Deleting file formats for dialer with id ' + dialerId + ' page '  + page);
        var table = this.getTable(page);
        db.any('DELETE FROM ' + table + ' WHERE "DIALER_ROWID"= $1 RETURNING *', dialerId)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getProperties(db, dialerId, propIds, page, callback) {
        if (dialerId !== null && propIds.length === 2) {
            
            var table = this.getTable(page);
            var data = [dialerId, propIds[0], propIds[1]];
            var sqlStr = 'SELECT * FROM ' + table + ' WHERE "DIALER_ROWID" = $1 AND "PKEY_ID" IN ($2, $3)';

            db.any(sqlStr, data)
                .then((results) => {
                    if (results.length === 2) {
                        log.info('Properties exists for dialerId: ' + dialerId);
                        callback(true, null);
                    } else {
                        log.info('Properties do not exist for dialerId: ' + dialerId);
                        callback(false, null);
                    }
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    createProperties(db, dialerId, properties, page, callback) {
        const table = this.getTable(page);
        const useDelim = properties.useDelimiter ? 1 : 0;
        
        if (dialerId !== null && properties !== null) {
            log.info('Creating delim file format property for dialer:' + dialerId);
            log.info('Creating record length file format property for dialer:' + dialerId);
        
            var data = [dialerId, properties.delimiter, useDelim, properties.recordLength];
            var sqlStr = 'INSERT INTO ' + table + ' ("PKEY_ID", "DIALER_ROWID", "REF_NAME", "END_POS", "LINE_NUM") ' +
                'VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), $1, $2, $3, -1);' +
                'INSERT INTO ' + table + ' ("PKEY_ID", "DIALER_ROWID", "START_POS", "LINE_NUM") VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), $1, $4, 0) ' +
                'RETURNING *';
            db.one(sqlStr, data)
                .then((results) => {
                    callback(null, null) ;
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateProperties(db, properties, page, callback) {
        var table = this.getTable(page);
        var useDelim = properties.useDelimiter ? 1 : 0;
        
        if (properties !== null) {
            log.info('Updating delim file format property with id:' + properties.delimId);
            log.info('Updating record length file format property with id:' + properties.recordLengthId);
        
            var data = [properties.delimiter, useDelim, properties.delimId, properties.recordLength, properties.recordLengthId];
            db.one('UPDATE ' + table + ' SET "REF_NAME" = $1, "END_POS" = $2 WHERE "PKEY_ID" = $3;' +
                    'UPDATE ' + table + ' SET "START_POS" = $4 WHERE "PKEY_ID" = $5 RETURNING *', data)
                .then((results) => {
                    callback(null, null) ;
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateLineNumOnDel(db, fileFormat, page, callback) {
        log.info('Updating file formats lineNum...');
        var table = this.getTable(page);
        if (fileFormat !== null) {
            var data = [fileFormat.lineNum, fileFormat.dialerId];
            db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 AND "DIALER_ROWID" = $2 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedFileFormats = this.getFileFormatsOB(results);
                    callback(updatedFileFormats, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    resetOrder(db, fileFormat, order, page, callback) {
        log.info('Resetting fileFormat order...');
        var table = this.getTable(page);
        if (fileFormat !== null) {
            let data = [fileFormat.lineNum, fileFormat.dialerId];
            db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 AND "DIALER_ROWID" = $2 RETURNING *', data)
                .then((results) => {
                    let data = [order, fileFormat.dialerId];
                    db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 AND "DIALER_ROWID" = $2 RETURNING *', data)
                        .then((results) => {
                            db.any('UPDATE ' + table + ' SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, fileFormat.id])
                                .then((results) => {
                                    var updatedFileFormat = this.getFileFormatsOB(results);
                                    callback(updatedFileFormat[0], null);
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

    deleteAllDialerFileFormats(db, dialerId, callback) {
        if (dialerId !== null) {
            log.info('Deleting all dialer specific fileFormats (callresult, assginment, download, download suppliment) ...');
            db.any('DELETE FROM FAN_OUT WHERE "DIALER_ROWID" = $1 RETURNING *', [dialerId])
                .then((results) => { //callresult

                    db.any('DELETE FROM FAN_OUT_1 WHERE "DIALER_ROWID" = $1 RETURNING *', [dialerId])
                        .then((results) => { //download

                            db.any('DELETE FROM FAN_OUT_2 WHERE "DIALER_ROWID" = $1 RETURNING *', [dialerId])
                                .then((results) => { //download suppliment

                                    db.any('DELETE FROM FAN_IN WHERE "DIALER_ROWID" = $1 RETURNING *', [dialerId])
                                        .then((results) => { // assignment
                                            callback(null, null);
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
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

}

const fileFormatPGDB = new FileFormatPGDB();
module.exports = fileFormatPGDB;