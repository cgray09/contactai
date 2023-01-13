var log = require('../../logger')(module);

class IncludeSampleODB {

    convertSample(element) {
        var sample = {};
        sample.id = element[0];
        sample.description = element[1];
        sample.include = element[2];
        sample.lineNum = element[3];
        sample.refName1 = element[6];
        sample.refName2 = element[7];
        sample.refName3 = element[8];
        sample.refName4 = element[9];
        sample.refName5 = element[10];
        sample.refName6 = element[11];
        sample.refName7 = element[12];
        sample.refName8 = element[13];
        sample.refName9 = element[14];
        sample.refName10 = element[15];
        return sample;
    }

    getSamplesOB(rows) {
        if (Array.isArray(rows)) {
            var samples = [];
            rows.forEach(row => {
                samples.push(this.convertSample(row));
            });
            return samples;
        }
    }

    getSamples(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM DEV_SAMPLE ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var samples = this.getSamplesOB(results.rows);
                    callback(samples, null);
                }
            });
        });
    }

    getSample(connection, sampleId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM DEV_SAMPLE WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [sampleId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var samples = this.getSamplesOB(results.rows);
                        callback(samples[0], null);
                    }
                }
            });
        });
    }

    createSample(connection, sample, callback) {
        connection.then((conn) => {
            log.info('Creating include sample...');
            if (sample !== null) {
                conn.execute('SELECT DEV_SAMPLE_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        sample.id = results.rows[0][0];

                        var sqlStr = 'INSERT INTO DEV_SAMPLE (PKEY_ID, LINE_NUM, DESCRIPTION, INCLUDE, REF_NAME_1, REF_NAME_2, REF_NAME_3, REF_NAME_4, ' +
                            'REF_NAME_5, REF_NAME_6, REF_NAME_7, REF_NAME_8, REF_NAME_9, REF_NAME_10) ' +
                            'VALUES (:1, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM DEV_SAMPLE), :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13)';

                        var bind = [sample.id, sample.description, sample.include, sample.refName1, sample.refName2, sample.refName3, sample.refName4,
                        sample.refName5, sample.refName6, sample.refName7, sample.refName8, sample.refName9, sample.refName10];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(sample, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateSample(connection, sample, callback) {
        connection.then((conn) => {
            log.info('Updating include sample with id:' + sample.id);
            if (sample !== null) {
                var sqlStr = 'UPDATE DEV_SAMPLE SET DESCRIPTION = :1, INCLUDE = :2, REF_NAME_1 = :3, REF_NAME_2 = :4, REF_NAME_3 = :5, ' +
                    'REF_NAME_4 = :6, REF_NAME_5 = :7, REF_NAME_6 = :8, REF_NAME_7 = :9, REF_NAME_8 = :10, REF_NAME_9 = :11, REF_NAME_10 = :12 ' +
                    'WHERE PKEY_ID = :13';
                var bind = [sample.description, sample.include, sample.refName1, sample.refName2, sample.refName3, sample.refName4, sample.refName5, 
                    sample.refName6, sample.refName7, sample.refName8, sample.refName9, sample.refName10, sample.id];

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

    deleteSample(connection, sample, callback) {
        connection.then((conn) => {
            log.info('Deleting include sample with id:' + sample.id);
            var sqlStr = 'DELETE FROM DEV_SAMPLE WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [sample.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, sample, callback) {
        connection.then((conn) => {
            log.info('Updating include samples lineNum...');
            if (sample !== null) {
                var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [sample.lineNum], { autoCommit: true }, (error, results) => {
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
                var data1 = [properties.refNameValue, properties.refNameValueId];
                var data2 = [properties.refNameLength, properties.refNameLengthId];
                
                var sqlStr1 = 'UPDATE DEV_SAMPLE SET ' + properties.refName + ' = :1 WHERE PKEY_ID = :2'; 
                var sqlStr2 = 'UPDATE DEV_SAMPLE SET ' + properties.refName + ' = :1 WHERE PKEY_ID = :2';

                if(properties.refNameValue === null) {
                    sqlStr1 = 'UPDATE DEV_SAMPLE SET ' + properties.refName + ' = :1';
                    data1 = [properties.refNameValue];
                }

                log.info('Updating include sample point properties... ');
                conn.execute(sqlStr1, data1, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (properties.refNameValue === null) { 
                            callback(null, null); // on delete column, all records including refNamelength are set to null by sqlStr1.
                        } else {
                            conn.execute(sqlStr2, data2, { autoCommit: true }, (error, results) => {
                                if (error) {
                                    log.error("ERROR:" + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    callback(null, null);
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    resetOrder(connection, sample, order, callback) {
        connection.then((conn) => {
            log.info('Resetting includeSample order...');
            if (sample !== null) {
                var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [sample.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, sample.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        sample.lineNum = order;
                                        callback(sample, null);
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

const includeSampleODB = new IncludeSampleODB();
module.exports = includeSampleODB;