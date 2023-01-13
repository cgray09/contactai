var log = require('../../logger')(module);

class KeepCharODB {
    
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
        keepChar.id = element[0];
        keepChar.type = element[2];
        keepChar.width = element[3];
        keepChar.description = element[4];
        keepChar.lineNum = element[5];
        keepChar.name = element[8];
        return keepChar;
    }

    getKeepCharsOB(rows) {
        if (Array.isArray(rows)) {
            var keepChars = [];
            rows.forEach(row => {
                keepChars.push(this.convertKeepChar(row));
            });
            return keepChars;
        }
    }

    getKeepChars(connection,  page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            conn.execute('SELECT * FROM ' + table + ' WHERE LINE_NUM > 0 ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var keepChars = this.getKeepCharsOB(results.rows);
                    callback(keepChars, null);
                }
            });
        });
    }

    getKeepChar(connection, keepCharId, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM ' + table + ' WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [keepCharId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if(results.rows.length === 0) { callback(null, null) }
                    else {
                        var keepChars = this.getKeepCharsOB(results.rows);
                        callback(keepChars[0], null);
                    }
                }
            });
        });
    }

    createKeepChar(connection, keepChar, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Creating keep characteristic...');
            if (keepChar !== null) {
                conn.execute('SELECT ' + table + '_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        keepChar.id = results.rows[0][0];
                        var bind = [keepChar.index, keepChar.id, keepChar.index, keepChar.name, keepChar.type, keepChar.width, keepChar.description];

                        var sqlStr = `BEGIN
                            UPDATE ` + table + ` SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1;
                            INSERT INTO ` + table + ` (PKEY_ID, LINE_NUM, REF_NAME, DB_TYPE, DB_WIDTH, DESCRIPTION)
                            VALUES (:2, :3, :4, :5, :6, :7);
                        END;`;
                        
                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(keepChar, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateKeepChar(connection, keepChar, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating keep characteristic with id:' + keepChar.id);
            if (keepChar !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET REF_NAME = :1, DB_TYPE = :2, DB_WIDTH = :3, DESCRIPTION = :4 WHERE PKEY_ID = :5';

                var bind = [keepChar.name, keepChar.type, keepChar.width, keepChar.description,  keepChar.id];

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

    deleteKeepChar(connection, keepChar, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting keep characteristic with id:' + keepChar.id);
            var sqlStr = 'DELETE FROM ' + table + ' WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [keepChar.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, keepChar, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating keep characteristics lineNum...');
            if (keepChar !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [keepChar.lineNum], { autoCommit: true }, (error, results) => {
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

    resetOrder(connection, keepChar, order, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Resetting keepChar order...');
            if (keepChar !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [keepChar.lineNum], { autoCommit: true }, (error, results) => {
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
                                conn.execute(sqlStr, [order, keepChar.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        keepChar.lineNum = order;
                                        callback(keepChar, null);
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

const keepCharODB = new KeepCharODB();
module.exports = keepCharODB;