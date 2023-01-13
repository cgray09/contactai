var log = require('../../logger')(module);

class SegmentPopODB {

    convertSegmentPop(element) {
        var segmentPop = {};
        segmentPop.id = element[0];
        segmentPop.description = element[1];
        segmentPop.lineNum = element[2];
        segmentPop.refName1 = element[5];
        segmentPop.refName2 = element[6];
        segmentPop.refName3 = element[7];
        segmentPop.refName4 = element[8];
        segmentPop.refName5 = element[9];
        segmentPop.refName6 = element[10];
        segmentPop.refName7 = element[11];
        segmentPop.refName8 = element[12];
        segmentPop.refName9 = element[13];
        segmentPop.refName10 = element[14];
        segmentPop.spId = element[16];
        return segmentPop;
    }

    getSegmentPopsOB(rows) {
        if (Array.isArray(rows)) {
            var segmentPops = [];
            rows.forEach(row => {
                segmentPops.push(this.convertSegmentPop(row));
            });
            return segmentPops;
        }
    }

    getSegmentPops(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM SPID_ASG ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var segmentPops = this.getSegmentPopsOB(results.rows);
                    callback(segmentPops, null);
                }
            });
        });
    }

    getSegmentPop(connection, segmentPopId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM SPID_ASG WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [segmentPopId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var segmentPops = this.getSegmentPopsOB(results.rows);
                        callback(segmentPops[0], null);
                    }
                }
            });
        });
    }

    createSegmentPop(connection, segmentPop, callback) {
        connection.then((conn) => {
            log.info('Creating segmentPopulation...');
            if (segmentPop !== null) {
                conn.execute('SELECT SPID_ASG_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        segmentPop.id = results.rows[0][0];
                        var sqlStr = 'INSERT INTO SPID_ASG (PKEY_ID, LINE_NUM, DESCRIPTION, SPID, REF_NAME_1, REF_NAME_2, REF_NAME_3, REF_NAME_4, ' +
                            'REF_NAME_5, REF_NAME_6, REF_NAME_7, REF_NAME_8, REF_NAME_9, REF_NAME_10) ' +
                            'VALUES (:1, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM SPID_ASG), :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13)';

                        var bind = [segmentPop.id, segmentPop.description, segmentPop.spId, segmentPop.refName1, segmentPop.refName2, segmentPop.refName3, segmentPop.refName4,
                        segmentPop.refName5, segmentPop.refName6, segmentPop.refName7, segmentPop.refName8, segmentPop.refName9, segmentPop.refName10];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(segmentPop, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateSegmentPop(connection, segmentPop, callback) {
        connection.then((conn) => {
            log.info('Updating segmentPopulation with id:' + segmentPop.id);
            if (segmentPop !== null) {
                var sqlStr = 'UPDATE SPID_ASG SET DESCRIPTION = :1, SPID = :2, REF_NAME_1 = :3, REF_NAME_2 = :4, REF_NAME_3 = :5, ' +
                    'REF_NAME_4 = :6, REF_NAME_5 = :7, REF_NAME_6 = :8, REF_NAME_7 = :9, REF_NAME_8 = :10, REF_NAME_9 = :11, REF_NAME_10 = :12 ' +
                    'WHERE PKEY_ID = :13';
                var bind = [segmentPop.description, segmentPop.spId, segmentPop.refName1, segmentPop.refName2, segmentPop.refName3, segmentPop.refName4, segmentPop.refName5, 
                    segmentPop.refName6, segmentPop.refName7, segmentPop.refName8, segmentPop.refName9, segmentPop.refName10, segmentPop.id];

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

    deleteSegmentPop(connection, segmentPop, callback) {
        connection.then((conn) => {
            log.info('Deleting segmentPopulation with id:' + segmentPop.id);
            var sqlStr = 'DELETE FROM SPID_ASG WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [segmentPop.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, segmentPop, callback) {
        connection.then((conn) => {
            log.info('Updating segmentPopulations lineNum...');
            if (segmentPop !== null) {
                var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [segmentPop.lineNum], { autoCommit: true }, (error, results) => {
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
                
                var sqlStr = 'UPDATE SPID_ASG SET ' + properties.refName + ' = :1 WHERE PKEY_ID = :2'; 
               
                if(properties.refNameValue === null) {
                    sqlStr = 'UPDATE SPID_ASG SET ' + properties.refName + ' = :1';
                    data = [properties.refNameValue];
                }
                
                log.info('Updating segmentPopulation properties... ');
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

    resetOrder(connection, segmentPop, order, callback) {
        connection.then((conn) => {
            log.info('Resetting segmentPop order...');
            if (segmentPop !== null) {
                var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [segmentPop.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE SPID_ASG SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, segmentPop.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        segmentPop.lineNum = order;
                                        callback(segmentPop, null);
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

const segmentPopODB = new SegmentPopODB();
module.exports = segmentPopODB;