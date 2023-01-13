var log = require('../../logger')(module);

class AnalysisCharODB {

    convertAnalysisChar(element) {
        var analysisChar = {};
        analysisChar.id = element[0];
        analysisChar.name = element[1];
        analysisChar.source = element[2];
        analysisChar.type = element[3];
        analysisChar.description = element[4];
        analysisChar.lineNum = element[5];
        analysisChar.active = element[6];
        analysisChar.groupr = element[7];
        return analysisChar;
    }

    getAnalysisCharsOB(rows) {
        if (Array.isArray(rows)) {
            var analysisChars = [];
            rows.forEach(row => {
                analysisChars.push(this.convertAnalysisChar(row));
            });
            return analysisChars;
        }
    }

    getAnalysisChars(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM CT_SC_BASE_VARS ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var analysisChars = this.getAnalysisCharsOB(results.rows);
                    callback(analysisChars, null);
                }
            });
        });
    }

    getAnalysisChar(connection, analysisCharId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM CT_SC_BASE_VARS WHERE PKEY = :pkey';
            conn.execute(sqlStr, [analysisCharId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var analysisChars = this.getAnalysisCharsOB(results.rows);
                        callback(analysisChars[0], null);
                    }
                }
            });
        });
    }

    createAnalysisChar(connection, analysisChar, callback) {
        connection.then((conn) => {
            log.info('Creating analysisChar...');
            if (analysisChar !== null) {
                conn.execute('SELECT CT_SC_BASE_VARS_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        analysisChar.id = results.rows[0][0];
                        
                        var sqlStr = 'INSERT INTO CT_SC_BASE_VARS (PKEY, LINE_NUM, NAME, SOURCE, TYPE, DESCRIPTION, ACTIVE, GROUPR) ' +
                            'VALUES (:1, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM CT_SC_BASE_VARS), :2, :3, :4, :5, :6, :7)';

                        var bind = [analysisChar.id, analysisChar.name, analysisChar.source, analysisChar.type, analysisChar.description,
                            analysisChar.active, analysisChar.groupr];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(analysisChar, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateAnalysisChar(connection, analysisChar, callback) {
        connection.then((conn) => {
            log.info('Updating analysisChar with id:' + analysisChar.id);
            if (analysisChar !== null) {
                var sqlStr = 'UPDATE CT_SC_BASE_VARS SET NAME = :1, SOURCE = :2, TYPE = :3, DESCRIPTION = :4, ACTIVE = :5, GROUPR = :6 ' +
                    'WHERE PKEY = :8';
                var bind = [analysisChar.name, analysisChar.source, analysisChar.type, analysisChar.description, analysisChar.active, 
                    analysisChar.groupr, analysisChar.id];

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

    deleteAnalysisChar(connection, analysisChar, callback) {
        connection.then((conn) => {
            log.info('Deleting analysisChar with id:' + analysisChar.id);
            var sqlStr = 'DELETE FROM CT_SC_BASE_VARS WHERE PKEY = :pkey';
            conn.execute(sqlStr, [analysisChar.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, analysisChar, callback) {
        connection.then((conn) => {
            log.info('Updating analysisChars lineNum...');
            if (analysisChar !== null) {
                var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [analysisChar.lineNum], { autoCommit: true }, (error, results) => {
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

    resetOrder(connection, analysisChar, order, callback) {
        connection.then((conn) => {
            log.info('Resetting analysisChar order...');
            if (analysisChar !== null) {
                var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [analysisChar.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE CT_SC_BASE_VARS SET LINE_NUM = :1 WHERE PKEY = :2';
                                conn.execute(sqlStr, [order, analysisChar.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        analysisChar.lineNum = order;
                                        callback(analysisChar, null);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    constructDataBind(analysisChars) {
        var dataBinds = [];
        analysisChars.forEach(analysisChar => {
            var data = [analysisChar.name, analysisChar.source, analysisChar.type, analysisChar.description,
                analysisChar.active, analysisChar.groupr];
            dataBinds.push(data);
        });
        return dataBinds;
    }

    importAnalysisChars(connection, analysisChars, callback) {
        if (analysisChars !== null && analysisChars.length > 0) {
            connection.then((conn) => {

                var sqlStr = 'INSERT INTO CT_SC_BASE_VARS (PKEY, LINE_NUM, NAME, SOURCE, TYPE, DESCRIPTION, ACTIVE, GROUPR) ' +
                    'VALUES (CT_SC_BASE_VARS_SEQ.nextval, (SELECT COUNT(*) FROM CT_SC_BASE_VARS), :1, :2, :3, :4, :5, :6)';
                
                const dataBinds = this.constructDataBind(analysisChars);

                const options = {
                    autoCommit: true,
                    batchErrors: true
                };
                console.log('SQL is :' + sqlStr);
                console.log('dataBind is :' + JSON.stringify(dataBinds));

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

    deleteAnalysisChars(connection, callback) {
        connection.then((conn) => {
            log.info('Deleting all analysisChars...');
            var sqlStr = 'TRUNCATE TABLE CT_SC_BASE_VARS';
            conn.execute(sqlStr, [], { autoCommit: true }, (error, results) => {
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

const analysisCharODB = new AnalysisCharODB();
module.exports = analysisCharODB;