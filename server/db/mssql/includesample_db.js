var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class IncludeSampleSQLDB {

    convertSample(element) {
        var sample = {};
        sample.id = element['PKEY_ID'];
        sample.description = element['DESCRIPTION'];
        sample.include = element['INCLUDE'];
        sample.lineNum = element['LINE_NUM'];
        sample.refName1 = element['REF_NAME_1'];
        sample.refName2 = element['REF_NAME_2'];
        sample.refName3 = element['REF_NAME_3'];
        sample.refName4 = element['REF_NAME_4'];
        sample.refName5 = element['REF_NAME_5'];
        sample.refName6 = element['REF_NAME_6'];
        sample.refName7 = element['REF_NAME_7'];
        sample.refName8 = element['REF_NAME_8'];
        sample.refName9 = element['REF_NAME_9'];
        sample.refName10 = element['REF_NAME_10'];
        return sample;
    }

    getSamplesOB(rows) {
        if (Array.isArray(rows)) {
            var samples = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                samples.push(this.convertSample(rowObject));
            });
            return samples;
        }
    }

    getSamples(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM DEV_SAMPLE ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var samples = this.getSamplesOB(rows);
                            callback(samples, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getSample(config, sampleId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM DEV_SAMPLE WHERE PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var samples = this.getSamplesOB(rows);
                            callback(samples[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, sampleId);
                conn.execSql(request);
            }
        });
    }

    createSample(config, sample, callback) {
        if (sample !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating include sample point...');
                    MSSqlUtil.getSeqNextVal(conn, 'DEV_SAMPLE_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO DEV_SAMPLE (PKEY_ID, LINE_NUM, DESCRIPTION, INCLUDE, REF_NAME_1, REF_NAME_2, REF_NAME_3, REF_NAME_4, REF_NAME_5, REF_NAME_6, REF_NAME_7, REF_NAME_8, REF_NAME_9, REF_NAME_10) ' +
                                'VALUES (@pkey, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM DEV_SAMPLE), @desc, @include, @ref1, @ref2, @ref3, @ref4, @ref5, @ref6, @ref7, @ref8, @ref9, @ref10)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    sample.id = pkey;
                                    callback(sample, null);
                                }
                                conn.close();
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('desc', TYPES.VarChar, sample.description);
                            request.addParameter('include', TYPES.VarChar, sample.include);
                            request.addParameter('ref1', TYPES.VarChar, sample.refName1);
                            request.addParameter('ref2', TYPES.VarChar, sample.refName2);
                            request.addParameter('ref3', TYPES.VarChar, sample.refName3);
                            request.addParameter('ref4', TYPES.VarChar, sample.refName4);
                            request.addParameter('ref5', TYPES.VarChar, sample.refName5);
                            request.addParameter('ref6', TYPES.VarChar, sample.refName6);
                            request.addParameter('ref7', TYPES.VarChar, sample.refName7);
                            request.addParameter('ref8', TYPES.VarChar, sample.refName8);
                            request.addParameter('ref9', TYPES.VarChar, sample.refName9);
                            request.addParameter('ref10', TYPES.VarChar, sample.refName10);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateSample(config, sample, callback) {
        if (sample !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating include sample with id:' + sample.id);
                    var sqlStr = 'UPDATE DEV_SAMPLE SET DESCRIPTION = @desc, INCLUDE = @include, REF_NAME_1 = @ref1, REF_NAME_2 = @ref2, REF_NAME_3 = @ref3, ' +
                        'REF_NAME_4 = @ref4, REF_NAME_5 = @ref5, REF_NAME_6 = @ref6, REF_NAME_7 = @ref7, REF_NAME_8 = @ref8, REF_NAME_9 = @ref9, REF_NAME_10 = @ref10 WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('desc', TYPES.VarChar, sample.description);
                    request.addParameter('include', TYPES.VarChar, sample.include);
                    request.addParameter('ref1', TYPES.VarChar, sample.refName1);
                    request.addParameter('ref2', TYPES.VarChar, sample.refName2);
                    request.addParameter('ref3', TYPES.VarChar, sample.refName3);
                    request.addParameter('ref4', TYPES.VarChar, sample.refName4);
                    request.addParameter('ref5', TYPES.VarChar, sample.refName5);
                    request.addParameter('ref6', TYPES.VarChar, sample.refName6);
                    request.addParameter('ref7', TYPES.VarChar, sample.refName7);
                    request.addParameter('ref8', TYPES.VarChar, sample.refName8);
                    request.addParameter('ref9', TYPES.VarChar, sample.refName9);
                    request.addParameter('ref10', TYPES.VarChar, sample.refName10);
                    request.addParameter('pkey', TYPES.Int, sample.id);
                    
                    conn.execSql(request);
                }
            });
        }
    }

    deleteSample(config, sample, callback) {
        if (sample !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting include sample with id:' + sample.id);
                    var sqlStr = 'DELETE FROM DEV_SAMPLE WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, sample.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, sample, callback) {
        if (sample !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating include samples lineNum...');

                    var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, sample.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    updateProperties(config, properties, callback) {
        if(properties != null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating include sample point properties... ');

                    var sqlStr = 'UPDATE DEV_SAMPLE SET ' + properties.refName + ' = @refNameValue WHERE PKEY_ID = @refNameValueId; ' +
                        'UPDATE DEV_SAMPLE SET ' + properties.refName + ' = @refNameLength WHERE PKEY_ID = @refNameLengthId';
                    
                    if(properties.refNameValue === null) {
                        sqlStr = 'UPDATE DEV_SAMPLE SET ' + properties.refName + ' = null';
                    }
                    
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    if(properties.refNameValue !== null) {
                        request.addParameter('refNameValue', TYPES.VarChar, properties.refNameValue);
                        request.addParameter('refNameValueId', TYPES.Int, properties.refNameValueId);
                        request.addParameter('refNameLength', TYPES.VarChar, properties.refNameLength);
                        request.addParameter('refNameLengthId', TYPES.Int, properties.refNameLengthId);
                    }
                    conn.execSql(request);
                }
            });
        }        
    }

    resetOrder(config, sample, order, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting includeSample order...');
                if (sample !== null) {
                    var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE DEV_SAMPLE SET LINE_NUM = @order WHERE PKEY_ID = @sampleId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            sample.lineNum = order;
                                            callback(sample, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('sampleId', TYPES.Int, sample.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, sample.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const includeSampleSQLDB = new IncludeSampleSQLDB();
module.exports = includeSampleSQLDB;