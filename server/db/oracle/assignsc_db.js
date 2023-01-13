var log = require('../../logger')(module);

class AssignSCODB {

    convertAssignSC(element) {
        var assignSC = {};
        assignSC.id = element[0];
        assignSC.description = element[1];
        assignSC.lineNum = element[2];
        assignSC.refName1 = element[5];
        assignSC.refName2 = element[6];
        assignSC.refName3 = element[7];
        assignSC.refName4 = element[8];
        assignSC.refName5 = element[9];
        assignSC.refName6 = element[10];
        assignSC.refName7 = element[11];
        assignSC.refName8 = element[12];
        assignSC.refName9 = element[13];
        assignSC.refName10 = element[14];
        assignSC.scoreId = element[15];
        assignSC.callHistory = element[16];
        return assignSC;
    }

    getAssignSCsOB(rows) {
        if (Array.isArray(rows)) {
            var assignSCs = [];
            rows.forEach(row => {
                assignSCs.push(this.convertAssignSC(row));
            });
            return assignSCs;
        }
    }

    getAssignSCs(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM SCORE_ID_ASG ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var assignSCs = this.getAssignSCsOB(results.rows);
                    callback(assignSCs, null);
                }
            });
        });
    }

    getAssignSC(connection, assignSCId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM SCORE_ID_ASG WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [assignSCId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var assignSCs = this.getAssignSCsOB(results.rows);
                        callback(assignSCs[0], null);
                    }
                }
            });
        });
    }

    createAssignSC(connection, assignSC, callback) {
        connection.then((conn) => {
            log.info('Creating assignScoreCard...');
            if (assignSC !== null) {
                conn.execute('SELECT SCORE_ID_ASG_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        assignSC.id = results.rows[0][0];
                        var callHist = (assignSC.callHistory) ? 1: 0;
                        var sqlStr = 'INSERT INTO SCORE_ID_ASG (PKEY_ID, LINE_NUM, DESCRIPTION, SCORE_ID, CALL_HISTORY_FLAG, REF_NAME_1, REF_NAME_2, REF_NAME_3, REF_NAME_4, ' +
                            'REF_NAME_5, REF_NAME_6, REF_NAME_7, REF_NAME_8, REF_NAME_9, REF_NAME_10) ' +
                            'VALUES (:1, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM SCORE_ID_ASG), :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14)';

                        var bind = [assignSC.id, assignSC.description, assignSC.scoreId, callHist, assignSC.refName1, assignSC.refName2, assignSC.refName3, assignSC.refName4,
                        assignSC.refName5, assignSC.refName6, assignSC.refName7, assignSC.refName8, assignSC.refName9, assignSC.refName10];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(assignSC, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateAssignSC(connection, assignSC, callback) {
        connection.then((conn) => {
            log.info('Updating assignScoreCard with id:' + assignSC.id);
            if (assignSC !== null) {
                var callHist = (assignSC.callHistory) ? 1 : 0;
                var sqlStr = 'UPDATE SCORE_ID_ASG SET DESCRIPTION = :1, SCORE_ID = :2, REF_NAME_1 = :3, REF_NAME_2 = :4, REF_NAME_3 = :5, ' +
                    'REF_NAME_4 = :6, REF_NAME_5 = :7, REF_NAME_6 = :8, REF_NAME_7 = :9, REF_NAME_8 = :10, REF_NAME_9 = :11, REF_NAME_10 = :12, CALL_HISTORY_FLAG = :13 ' +
                    'WHERE PKEY_ID = :14';
                var bind = [assignSC.description, assignSC.scoreId, assignSC.refName1, assignSC.refName2, assignSC.refName3, assignSC.refName4, assignSC.refName5, 
                    assignSC.refName6, assignSC.refName7, assignSC.refName8, assignSC.refName9, assignSC.refName10, callHist, assignSC.id];

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

    deleteAssignSC(connection, assignSC, callback) {
        connection.then((conn) => {
            log.info('Deleting assignScoreCard with id:' + assignSC.id);
            var sqlStr = 'DELETE FROM SCORE_ID_ASG WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [assignSC.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, assignSC, callback) {
        connection.then((conn) => {
            log.info('Updating assignScoreCards lineNum...');
            if (assignSC !== null) {
                var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [assignSC.lineNum], { autoCommit: true }, (error, results) => {
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

    updateProperties(connection, properties, callback) {
        connection.then((conn) => {
            if (properties !== null) {
                var data = [properties.refNameValue, properties.refNameValueId];
                
                var sqlStr = 'UPDATE SCORE_ID_ASG SET ' + properties.refName + ' = :1 WHERE PKEY_ID = :2'; 
               
                if(properties.refNameValue === null) {
                    sqlStr = 'UPDATE SCORE_ID_ASG SET ' + properties.refName + ' = :1';
                    data = [properties.refNameValue];
                }
                
                log.info('Updating assignScoreCard properties... ');
                conn.execute(sqlStr, data, { autoCommit: true }, (error, results) => {
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

    resetOrder(connection, assignSC, order, callback) {
        connection.then((conn) => {
            log.info('Resetting assignSC order...');
            if (assignSC !== null) {
                var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [assignSC.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE SCORE_ID_ASG SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, assignSC.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        assignSC.lineNum = order;
                                        callback(assignSC, null);
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

const assignSCODB = new AssignSCODB();
module.exports = assignSCODB;