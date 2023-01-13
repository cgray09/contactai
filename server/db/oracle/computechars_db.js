var log = require('../../logger')(module);

class ComputeCharODB {

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
        characteristic.id = element[0];
        characteristic.description = element[1];
        characteristic.inputChar = element[2];
        characteristic.lineNum = element[3];
        characteristic.name = element[6];
        characteristic.defName = element[6]  + "-" + element[4];
        characteristic.type = element[7];        
        return characteristic;
    }

    getCharacteristicsOB(rows) {
        if (Array.isArray(rows)) {
            var characteristics = [];
            rows.forEach(row => {
                characteristics.push(this.convertCharacteristic(row));
            });
            return characteristics;
        }
    }

    getCharacteristics(connection, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            conn.execute('SELECT * FROM ' + table + ' WHERE LINE_NUM > 0 ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var characteristics = this.getCharacteristicsOB(results.rows);
                    callback(characteristics, null);
                }
            });
        });
    }

    getCharacteristic(connection, characteristicId, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM ' + table + ' WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [characteristicId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if(results.rows.length === 0) { callback(null, null) }
                    else {
                        var characteristics = this.getCharacteristicsOB(results.rows);
                        callback(characteristics[0], null);
                    }
                }
            });
        });
    }

    createCharacteristic(connection, characteristic, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Creating characteristic...');
            if (characteristic !== null) {
                conn.execute('SELECT ' + table + '_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        characteristic.id = results.rows[0][0];
                        characteristic.defName = this.createDefName(page);

                        var sqlStr = `BEGIN
                            UPDATE ` + table + ` SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1;
                            INSERT INTO ` + table + ` (PKEY_ID, LINE_NUM, REF_NAME, NAME, DESCRIPTION, SUBPROC)
                            VALUES (:2, :3, :4, :5, :6, :7);
                        END;`;

                        var bind = [characteristic.index, characteristic.id, characteristic.index, characteristic.name, characteristic.defName, characteristic.description, characteristic.type];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(characteristic, null);
                            }
                        });
                    }
                });
            }
        });
    }

    /** create characteristic to end of list (last linenum + 1) in the DB */
    createCharacteristicEOL(connection, characteristic, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Creating characteristic...');
            if (characteristic !== null) {
                conn.execute('SELECT ' + table + '_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        characteristic.id = results.rows[0][0];
                        characteristic.defName = this.createDefName(page);
                        
                        var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, REF_NAME, NAME, DESCRIPTION, SUBPROC) ' +
                        'VALUES (:1, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM ' + table + ' WHERE LINE_NUM > 0), :2, :3, :4, :5)';

                        var bind = [characteristic.id, characteristic.name, characteristic.defName, characteristic.description, characteristic.type];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(characteristic, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateCharacteristic(connection, characteristic, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating characteristic with id:' + characteristic.id);
            if (characteristic !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET REF_NAME = :1, NAME = :2, DESCRIPTION = :3 , SUBPROC = :4 WHERE PKEY_ID = :5';

                var bind = [characteristic.name, this.createDefName(page), characteristic.description,  characteristic.type, characteristic.id];

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

    updateInputChar(connection, characteristic, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating characteristic with id:' + characteristic.id);
            if (characteristic !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET INPUT_CHAR = :1 WHERE PKEY_ID = :2';

                var bind = [characteristic.inputChar, characteristic.id];

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

    deleteCharacteristic(connection, characteristic, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting characteristic with id:' + characteristic.id);
            var sqlStr = 'DELETE FROM ' + table + ' WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [characteristic.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, characteristic, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating characteristics lineNum...');
            if (characteristic !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [characteristic.lineNum], { autoCommit: true }, (error, results) => {
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

    resetOrder(connection, characteristic, order, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Resetting characteristic order...');
            if (characteristic !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [characteristic.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, characteristic.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        characteristic.lineNum = order;
                                        callback(characteristic, null);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

const computeCharODB = new ComputeCharODB();
module.exports = computeCharODB;