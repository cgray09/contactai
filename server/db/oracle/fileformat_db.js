const OracleDB = require('oracledb');
const { fileformat } = require('../../routes/validator');

var log = require('../../logger')(module);

class FileFormatODB {

    getTableSequence(tableName) {
        switch (tableName.toUpperCase()) {
            case "FAN_OUT": return "FAN_OUT_SEQ";
            case "FAN_OUT_1": return "FAN_OUT_1_SEQ";
            case "FAN_OUT_2": return "FAN_OUT_2_SEQ";
            case "FAN_IN": return "FAN_IN_SEQ";
            default: return "";
        }
    }

    getTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "FAN_OUT";
            case "DLFILEFORMAT": return "FAN_OUT_1";
            case "DLSUPPFILEFORMAT": return "FAN_OUT_2";
            case "ASSIGNMENT": return "FAN_IN";
            default: return "";
        }
    }

    convertFileFormat(element, table) {
        var fileFormat = {};
        if(table === "FAN_OUT_2") {
            fileFormat.id = element[0];
            fileFormat.description = element[5];
            fileFormat.dialerId = element[3];
            fileFormat.endPos = element[6];
            fileFormat.type = element[7];
            fileFormat.fieldLength = element[8];
            fileFormat.lineNum = element[9];
            fileFormat.specialInfo = element[10];
            fileFormat.name = element[13];
            fileFormat.startPos = element[14];
            fileFormat.formatter = element[15];

        } else {
            fileFormat.id = element[0];
            fileFormat.description = element[1];
            fileFormat.dialerId = element[3];
            fileFormat.endPos = element[5];
            fileFormat.type = element[6];
            fileFormat.fieldLength = element[7];
            fileFormat.lineNum = element[8];
            if (table === "FAN_IN") {
                fileFormat.name = element[11];
                fileFormat.startPos = element[12];
                fileFormat.formatter = element[13];
            } else {
                fileFormat.specialInfo = element[9];
                fileFormat.name = element[12];
                fileFormat.startPos = element[13];
                fileFormat.formatter = element[14];
            }
        }
        return fileFormat;
    }

    constructDataBind(formatList, dialerId, table) {
        var dataBinds = [];
        let lineNum = 1; //can start with value 1, as import drops all existing and creates new records.
        formatList.forEach(fileFormat => {
            var data = [lineNum++, dialerId, fileFormat.name, fileFormat.startPos, fileFormat.endPos, fileFormat.fieldLength,
                fileFormat.type, fileFormat.formatter, fileFormat.specialInfo, fileFormat.description];

            if (table === "FAN_IN") {
                data = [lineNum++, dialerId, fileFormat.name, fileFormat.startPos, fileFormat.endPos, fileFormat.fieldLength,
                    fileFormat.type, fileFormat.formatter, fileFormat.description];
            }
            dataBinds.push(data);
        });
        return dataBinds;
    }

    getFileFormatsOB(rows, table) {
        if (Array.isArray(rows)) {
            var fileFormats = [];
            rows.forEach(row => {
                fileFormats.push(this.convertFileFormat(row, table));
            });
            return fileFormats;
        }
    }

    getFileFormats(connection, dialerId, page, callback) {
        var table = this.getTable(page);
        let sqlStr = 'SELECT * FROM ' + table + ' WHERE DIALER_ROWID = ' + dialerId + ' AND LINE_NUM > -2'
            + ' ORDER BY LINE_NUM';
        connection.then((conn) => {
            conn.execute(sqlStr, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var fileFormats = this.getFileFormatsOB(results.rows, table);
                    callback(fileFormats, null);
                }
            });
        });
    }

    getFileFormat(connection, fileFormatId, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM ' + table + ' WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [fileFormatId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var fileFormats = this.getFileFormatsOB(results.rows, table);
                        callback(fileFormats[0], null);
                    }
                }
            });
        });
    }

    createFileFormat(connection, fileFormat, dialerId, page, callback) {
        connection.then((conn) => {
            if (fileFormat !== null) {
                var table = this.getTable(page);
                conn.execute('SELECT ' + table + '_SEQ.nextval FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        fileFormat.id = results.rows[0][0];
                        var insertCols = [ "PKEY_ID", "LINE_NUM", "DIALER_ROWID", "REF_NAME", "START_POS", "END_POS",
                            "FIELD_LENGTH", "FIELD_FORMAT", "STD_PROC", "DESCRIPTION"];
                        var bind = [ fileFormat.dialerId, fileFormat.index, fileFormat.id, fileFormat.index, fileFormat.dialerId,
                            fileFormat.name, fileFormat.startPos, fileFormat.endPos, fileFormat.fieldLength, fileFormat.type,
                            fileFormat.formatter, fileFormat.description ];
                        if ( table !== "FAN_IN" ) {
                            insertCols.push("ML_KEY");
                            bind.push(fileFormat.specialInfo);
                        }

                        var sqlStr = `BEGIN
                            UPDATE ` + table + ` SET LINE_NUM = LINE_NUM + 1 WHERE DIALER_ROWID = :1 AND LINE_NUM >= :2;
                            INSERT INTO ` + table + `(`+insertCols.join(", ")+`) VALUES (:`+insertCols.join(", :")+`);
                        END;`;

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(fileFormat, null);
                            }
                        });
                    }
                });
            }
        });
    }

    importFileFormats(connection, formatList, dialerId, page, callback) {
        if (formatList !== null && formatList.length > 0) {
            var table = this.getTable(page);
            connection.then((conn) => {

                var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, DIALER_ROWID, REF_NAME, START_POS, END_POS, FIELD_LENGTH, FIELD_FORMAT, STD_PROC, ML_KEY, DESCRIPTION) ' +
                    'VALUES (' + table + '_SEQ.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10)';

                if (table === 'FAN_IN') {
                    sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, DIALER_ROWID, REF_NAME, START_POS, END_POS, FIELD_LENGTH, FIELD_FORMAT, STD_PROC, DESCRIPTION) ' +
                        'VALUES (' + table + '_SEQ.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9)';
                }
                const dataBinds = this.constructDataBind(formatList, dialerId, table);

                const options = {
                    autoCommit: true,
                    batchErrors: true
                };
                
                conn.executeMany(sqlStr, dataBinds, options, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                });
            });
        }
    }

    updateFileFormat(connection, fileFormat, page, callback) {
        connection.then((conn) => {
            log.info('Updating file format with id:' + fileFormat.id);
            var table = this.getTable(page);
            if (fileFormat !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET DIALER_ROWID = :1, REF_NAME = :2, START_POS = :3, END_POS = :4, FIELD_LENGTH = :5, ' +
                    'FIELD_FORMAT = :6, STD_PROC = :7, ML_KEY = :8, DESCRIPTION = :9 WHERE PKEY_ID = :10';

                var bind = [fileFormat.dialerId, fileFormat.name, fileFormat.startPos, fileFormat.endPos, fileFormat.fieldLength,
                fileFormat.type, fileFormat.formatter, fileFormat.specialInfo, fileFormat.description, fileFormat.id];

                if (table === "FAN_IN") {
                    sqlStr = 'UPDATE ' + table + ' SET DIALER_ROWID = :1, REF_NAME = :2, START_POS = :3, END_POS = :4, FIELD_LENGTH = :5, ' +
                        'FIELD_FORMAT = :6, STD_PROC = :7, DESCRIPTION = :8 WHERE PKEY_ID = :9';

                    bind = [fileFormat.dialerId, fileFormat.name, fileFormat.startPos, fileFormat.endPos, fileFormat.fieldLength,
                    fileFormat.type, fileFormat.formatter, fileFormat.description, fileFormat.id];

                }

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

    deleteFileFormat(connection, fileFormat, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting file format with id:' + fileFormat.id);
            var sqlStr = 'DELETE FROM ' + table + ' WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [fileFormat.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    deleteFileFormats(connection, dialerId, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting file formats for dialer with id ' + dialerId + ' page '  + page);
            var sqlStr = 'DELETE FROM ' + table + ' WHERE DIALER_ROWID = :dialerId' ;
            conn.execute(sqlStr, [dialerId], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    getProperties(connection, dialerId, propIds, page, callback) {
        if (dialerId !== null && propIds.length === 2) {
            connection.then((conn) => {
                const table = this.getTable(page);
                var bind = [dialerId, propIds[0], propIds[1]];
                var sqlStr = 'SELECT * FROM ' + table + ' WHERE DIALER_ROWID = :1 AND PKEY_ID IN (:2, :3)';
                
                conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (results.rows.length === 2) {
                            log.info('Properties exists for dialerId: ' + dialerId);
                            callback(true, null);
                        } else {
                            log.info('Properties do not exist for dialerId: ' + dialerId);
                            callback(false, null);
                        }
                    }
                });   
            });
        }
    }
    
    createProperties(connection, dialerId, properties, page, callback) {
        connection.then((conn) => {
            const table = this.getTable(page);
            const useDelim = properties.useDelimiter ? 1 : 0;

            if (dialerId !== null && properties !== null) {
                var data1 = [dialerId, properties.delimiter, useDelim];
                var data2 = [dialerId, properties.recordLength];

                var sqlStr1 = 'INSERT INTO ' + table + ' (PKEY_ID, DIALER_ROWID, REF_NAME, END_POS, LINE_NUM) VALUES (' + table + '_SEQ.nextval, :1, :2, :3, -1)';
                var sqlStr2 = 'INSERT INTO ' + table + ' (PKEY_ID, DIALER_ROWID, START_POS, LINE_NUM) VALUES (' + table + '_SEQ.nextval, :1, :2, 0)';

                log.info('Creating delim file format property for dialer:' + dialerId);
                conn.execute(sqlStr1, data1, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        log.info('Creating record length file format property for dialer:' + dialerId);
                        conn.execute(sqlStr2, data2, { autoCommit: true }, (error, results) => {
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

    updateProperties(connection, properties, page, callback) {
        connection.then((conn) => {
            var table = this.getTable(page);
            var useDelim = properties.useDelimiter ? 1 : 0;

            if (properties !== null) {
                var data1 = [properties.delimiter, useDelim, properties.delimId];
                var data2 = [properties.recordLength, properties.recordLengthId];

                var sqlStr1 = 'UPDATE ' + table + ' SET REF_NAME = :1, END_POS = :2 WHERE PKEY_ID = :3';
                var sqlStr2 = 'UPDATE ' + table + ' SET START_POS = :1 WHERE PKEY_ID = :2';

                log.info('Updating delim file format property with id:' + properties.delimId);
                conn.execute(sqlStr1, data1, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        log.info('Updating record length file format property with id:' + properties.recordLengthId);
                        conn.execute(sqlStr2, data2, { autoCommit: true }, (error, results) => {
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

    updateLineNumOnDel(connection, fileFormat, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating file formats lineNum...');
            if (fileFormat !== null) {
                let bind = [fileFormat.dialerId, fileFormat.lineNum];
                let sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE DIALER_ROWID = :1 AND LINE_NUM >= :2';
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

    resetOrder(connection, fileFormat, order, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Resetting fileFormat order...');
            if (fileFormat !== null) {
                var bind = [fileFormat.lineNum, fileFormat.dialerId];
                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1 AND DIALER_ROWID = :2';
                conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var bind = [order, fileFormat.dialerId];
                        var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1 AND DIALER_ROWID = :2';
                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, fileFormat.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        fileFormat.lineNum = order;
                                        callback(fileFormat, null);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    deleteAllDialerFileFormats(connection, dialerId, callback) {
        connection.then((conn) => {
            if (dialerId !== null) {
                log.info('Deleting all dialer specific fileFormats (callresult, assginment, download, download suppliment) ...');
                var sqlStr = 'DELETE FROM FAN_OUT WHERE DIALER_ROWID = :1';
                conn.execute(sqlStr, [dialerId], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'DELETE FROM FAN_OUT_1 WHERE DIALER_ROWID = :1';
                        conn.execute(sqlStr, [dialerId], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'DELETE FROM FAN_OUT_2 WHERE DIALER_ROWID = :1';
                                conn.execute(sqlStr, [dialerId], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        var sqlStr = 'DELETE FROM FAN_IN WHERE DIALER_ROWID = :1';
                                        conn.execute(sqlStr, [dialerId], { autoCommit: true }, (error, results) => {
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
                });
            }
        });
    }
}

const fileFormatODB = new FileFormatODB();
module.exports = fileFormatODB;