var log = require('../../logger')(module);

class ComputeCharPGDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "HISTORY_GENERATE_2";
            case "DOWNLOAD": return "DL_GENERATE_2";
            default: return "";
        }
    }

    //generates the name that will be used to associated a characteristic with its definitions
    createDefName(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "ML_act_summary";
            case "DOWNLOAD": return "DL_chars";
            default: return "";
        }
    }

    convertCharacteristic(element) {
        var characteristic = {};
        characteristic.id = element.PKEY_ID;
        characteristic.lineNum = element.LINE_NUM;
        characteristic.name = element.REF_NAME;
        characteristic.defName = element.REF_NAME + "-" + element.NAME;
        characteristic.type = element.SUBPROC;
        characteristic.description = element.DESCRIPTION;        
        characteristic.inputChar = element.INPUT_CHAR;
        return characteristic;
    }

    getCharacteristicsOB(results) {
        if (Array.isArray(results)) {
            var characteristics = [];
            results.forEach(element => {
                characteristics.push(this.convertCharacteristic(element));
            });
            return characteristics;
        } else {
            return this.convertCharacteristic(results);
        }
    }

    getCharacteristics(db, page, callback) {
        var table = this.getTable(page);
        db.any('SELECT * FROM ' + table + ' WHERE "LINE_NUM" > 0 ORDER BY "LINE_NUM"')
            .then((results) => {
                var characteristics = this.getCharacteristicsOB(results);
                callback(characteristics, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getCharacteristic(db, characteristicId, page, callback) {
        var table = this.getTable(page);
        db.one('SELECT * FROM ' + table + ' WHERE "PKEY_ID"= $1', characteristicId)
            .then((results) => {
                var characteristic = this.getCharacteristicsOB(results);
                callback(characteristic, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createCharacteristic(db, characteristic, page, callback) {
        var table = this.getTable(page);
        log.info('Creating characteristic...');
        if (characteristic !== null) {
            var data = [characteristic.name, this.createDefName(page), characteristic.description, characteristic.type, characteristic.index];

            var sqlLock = `LOCK TABLE ` + table + ` IN EXCLUSIVE MODE`;
            var sqlStr1 = `UPDATE ` + table + ` SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $5`;
            var sqlStr2 = `INSERT INTO ` + table + ` ("PKEY_ID", "LINE_NUM", "REF_NAME", "NAME", "DESCRIPTION", "SUBPROC")
                VALUES (NEXTVAL(\'"` + table + `_SEQ"\'), $5, $1, $2, $3, $4)
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

    /** create characteristic to end of list (last linenum + 1) in the DB */
    createCharacteristicEOL(db, characteristic, page, callback) {
        var table = this.getTable(page);
        log.info('Creating characteristic...');
        if (characteristic !== null) {
            var data = [characteristic.name, this.createDefName(page), characteristic.description, characteristic.type];
            db.one('INSERT INTO ' + table + ' ("PKEY_ID", "LINE_NUM", "REF_NAME", "NAME", "DESCRIPTION", "SUBPROC") ' +
                'VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM ' + table + 
                ' WHERE "LINE_NUM" > 0), $1, $2, $3, $4) ' +
                'RETURNING *', data)
                .then((results) => {
                    var addedCharacteristic = this.getCharacteristicsOB(results);
                    callback(addedCharacteristic, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateCharacteristic(db, characteristic, page, callback) {
        var table = this.getTable(page);
        log.info('Updating characteristic with id:' + characteristic.id);
        if (characteristic !== null) {
            var data = [characteristic.name, this.createDefName(page), characteristic.description, characteristic.type, characteristic.id];
            db.one('UPDATE ' + table + ' SET "REF_NAME" = $1, "NAME" = $2, "DESCRIPTION" = $3, "SUBPROC" = $4 WHERE "PKEY_ID" = $5 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedCharacteristic = this.getCharacteristicsOB(results);
                    callback(updatedCharacteristic, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateInputChar(db, characteristic, page, callback) {
        var table = this.getTable(page);
        log.info('Updating characteristic with id:' + characteristic.id);
        if (characteristic !== null) {
            var data = [characteristic.inputChar, characteristic.id];
            db.one('UPDATE ' + table + ' SET "INPUT_CHAR" = $1, WHERE "PKEY_ID" = $2 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedCharacteristic = this.getCharacteristicsOB(results);
                    callback(updatedCharacteristic, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteCharacteristic(db, characteristic, page, callback) {
        var table = this.getTable(page);
        log.info('Deleting characteristic with id:' + characteristic.id);
        db.one('DELETE FROM ' + table + ' WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', characteristic.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, characteristic, page, callback) {
        var table = this.getTable(page);
        log.info('Updating characteristics lineNum...');
        if (characteristic !== null) {
            var data = [characteristic.lineNum];
            db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedCharacteristics = this.getCharacteristicsOB(results);
                    callback(updatedCharacteristics, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    resetOrder(db, characteristic, order, page, callback) {
        var table = this.getTable(page);
        if (characteristic !== null) {
            log.info('Resetting characteristic order...');
            db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [characteristic.lineNum])
                .then((results) => {

                    db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE ' + table + ' SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, characteristic.id])
                                .then((results) => {
                                    var updatedChar = this.getCharacteristicsOB(results);
                                    callback(updatedChar[0], null);
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

const computeCharPGDB = new ComputeCharPGDB();
module.exports = computeCharPGDB;