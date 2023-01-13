var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class EnvironmentSQLDB {

    convertEnv(element) {
        var env = {};
        env.id = element['PKEY_ID'];
        env.lineNum = element['LINE_NUM'];
        env.name = element['NAME'];
        env.active = element['CURRENT_FLAG'];
        env.runPreSummFlag = element['RUN_DOWNLOAD_FLAG'];
        env.preSummStartTime = element['DOWNLOAD_START_TIME'];
        env.runUploadFlag = element['RUN_UPLOAD_FLAG']
        env.uploadStartTime = element['UPLOAD_START_TIME'];
        env.runReSummFlag = element['RUN_MIDDLELOAD_FLAG']
        env.reSummStartTime = element['MIDDLELOAD_START_TIME'];
        env.runDownloadFlag = element['RUN_ASSIGNMENT_FLAG'];
        env.downloadStartTime = element['ASSIGNMENT_START_TIME'];
        env.runScoreCardFlag = element['RUN_SCORECARD_FLAG']
        env.scoreCardStartTime = element['SCORECARD_START_TIME'];
        env.scheduleFreq = element['SCORECARD_BUILD_FREQ'];
        env.activityDir = element['ACTIVITY_DIRECTORY'];
        env.doneActivityDir = element['DONE_ACTIVITY_DIRECTORY'];
        env.downloadDir = element['DOWNLOAD_DIRECTORY'];
        env.doneDownloadDir = element['DONE_DOWNLOAD_DIRECTORY'];
        env.secondaryDownloadDir = element['SECONDARY_DLOAD_DIR'];
        env.secondaryDoneDownloadDir = element['SECONDARY_DONE_DLOAD_DIR'];
        env.fortranDir = element['FORTRAN_DIRECTORY'];
        env.scriptInstallDir = element['SCRIPT_INSTALL_DIRECTORY'];
        env.databaseName = element['DATABASE_NAME'];
        env.ctUserAccount = element['CALLTECH_USER_NAME'];        

        return env;
    }

    getEnvsOB(rows) {
        if (Array.isArray(rows)) {
            var envs = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                envs.push(this.convertEnv(rowObject));
            });
            return envs;
        }
    }

    getEnvs(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var request = new Request('SELECT * FROM BUNDLE_ENVIRONMENT ORDER BY LINE_NUM', (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var envs = this.getEnvsOB(rows);
                            callback(envs, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getEnv(config, envId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT * FROM BUNDLE_ENVIRONMENT WHERE PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var envs = this.getEnvsOB(rows);
                            callback(envs[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, envId);
                conn.execSql(request);
            }
        });
    }

    createEnv(config, env, callback) {
        if (env !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating environment...');
                    MSSqlUtil.getSeqNextVal(conn, 'BUNDLE_ENVIRONMENT_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO BUNDLE_ENVIRONMENT (PKEY_ID, LINE_NUM, NAME, CURRENT_FLAG, RUN_DOWNLOAD_FLAG, ' +
                                'DOWNLOAD_START_TIME, RUN_UPLOAD_FLAG, UPLOAD_START_TIME, RUN_MIDDLELOAD_FLAG, MIDDLELOAD_START_TIME, ' +
                                'RUN_ASSIGNMENT_FLAG, ASSIGNMENT_START_TIME, RUN_SCORECARD_FLAG, SCORECARD_START_TIME, SCORECARD_BUILD_FREQ, ' +
                                'ACTIVITY_DIRECTORY, DONE_ACTIVITY_DIRECTORY, DOWNLOAD_DIRECTORY, DONE_DOWNLOAD_DIRECTORY, SECONDARY_DLOAD_DIR, ' +
                                'SECONDARY_DONE_DLOAD_DIR, FORTRAN_DIRECTORY, SCRIPT_INSTALL_DIRECTORY, DATABASE_NAME, CALLTECH_USER_NAME) ' +
                                'VALUES (@pkey, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM BUNDLE_ENVIRONMENT), @name, @active, @runDLFlag, @dlStTime, ' +
                                '@uploadFlag, @uploadStTime, @midloadFlag, @midLoadStTime, @assignFlag, @assignStTime, @scFlag, @scStTime, @scFreq, ' +
                                '@actDir, @doneActDir, @dlDir, @doneDlDir, @secDlDir, @secDoneDlDir, @fortranDir, @scriptInstDir, @dbName, @ctUserName)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                    conn.close();
                                } else {
                                    env.id = pkey;
                                    if(env.active) {
                                        //Deactivate other environments
                                        var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 0 WHERE PKEY_ID != @pkey;';
                                        var request = new Request(sqlStr, (error, rowCount, rows) => {
                                                            if (error) {
                                                                log.error('ERROR :' + JSON.stringify(error));
                                                                callback(null, error);
                                                            } else {
                                                                callback(env, null);
                                                            }
                                                            conn.close();
                                                        });
                                        request.addParameter('pkey', TYPES.Int, env.id);
                                        conn.execSql(request);
                                    } else {
                                        callback(env, null);
                                        conn.close();
                                    }                                    
                                }                               
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('name', TYPES.VarChar, env.name);
                            request.addParameter('active', TYPES.Int, env.active);
                            request.addParameter('runDLFlag', TYPES.Int, env.runPreSummFlag);
                            request.addParameter('dlStTime', TYPES.VarChar, env.preSummStartTime);
                            request.addParameter('uploadFlag', TYPES.Int, env.runUploadFlag);
                            request.addParameter('uploadStTime', TYPES.VarChar, env.uploadStartTime);
                            request.addParameter('midloadFlag', TYPES.Int, env.runReSummFlag);
                            request.addParameter('midLoadStTime', TYPES.VarChar, env.reSummStartTime);
                            request.addParameter('assignFlag', TYPES.Int, env.runDownloadFlag);
                            request.addParameter('assignStTime', TYPES.VarChar, env.downloadStartTime);
                            request.addParameter('scFlag', TYPES.Int, env.runScoreCardFlag);
                            request.addParameter('scStTime', TYPES.VarChar, env.scoreCardStartTime);
                            request.addParameter('scFreq', TYPES.VarChar, env.scheduleFreq);
                            request.addParameter('actDir', TYPES.VarChar, env.activityDir);
                            request.addParameter('doneActDir', TYPES.VarChar, env.doneActivityDir);
                            request.addParameter('dlDir', TYPES.VarChar, env.downloadDir);
                            request.addParameter('doneDlDir', TYPES.VarChar, env.doneDownloadDir);
                            request.addParameter('secDlDir', TYPES.VarChar, env.secondaryDownloadDir);
                            request.addParameter('secDoneDlDir', TYPES.VarChar, env.secondaryDoneDownloadDir);
                            request.addParameter('fortranDir', TYPES.VarChar, env.fortranDir);
                            request.addParameter('scriptInstDir', TYPES.VarChar, env.scriptInstallDir);
                            request.addParameter('dbName', TYPES.VarChar, env.databaseName);
                            request.addParameter('ctUserName', TYPES.VarChar, env.ctUserAccount);

                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateEnv(config, env, callback) {
        if (env !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating environment with id:' + env.id);
                    var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET ' +
                    'NAME = @name, CURRENT_FLAG = @active, RUN_DOWNLOAD_FLAG = @runDLFlag, DOWNLOAD_START_TIME = @dlStTime, ' +
                    'RUN_UPLOAD_FLAG = @uploadFlag, UPLOAD_START_TIME = @uploadStTime, RUN_MIDDLELOAD_FLAG = @midloadFlag, ' +
                    'MIDDLELOAD_START_TIME = @midLoadStTime, RUN_ASSIGNMENT_FLAG = @assignFlag, ASSIGNMENT_START_TIME = @assignStTime, ' + 
                    'RUN_SCORECARD_FLAG = @scFlag, SCORECARD_START_TIME = @scStTime, SCORECARD_BUILD_FREQ = @scFreq, ' +
                    'ACTIVITY_DIRECTORY = @actDir, DONE_ACTIVITY_DIRECTORY = @doneActDir, DOWNLOAD_DIRECTORY = @dlDir, ' +
                    'DONE_DOWNLOAD_DIRECTORY = @doneDlDir, SECONDARY_DLOAD_DIR = @secDlDir, SECONDARY_DONE_DLOAD_DIR = @secDoneDlDir, ' +
                    'FORTRAN_DIRECTORY = @fortranDir, SCRIPT_INSTALL_DIRECTORY = @scriptInstDir, DATABASE_NAME = @dbName, ' +
                    'CALLTECH_USER_NAME = @ctUserName ' +
                    'WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            if(env.active) {
                                //Deactivate other environments
                                var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 0 WHERE PKEY_ID != @pkey;';
                                var request = new Request(sqlStr, (error, rowCount, rows) => {
                                                    if (error) {
                                                        log.error('ERROR :' + JSON.stringify(error));
                                                        callback(null, error);
                                                    } else {
                                                        callback(null, null);
                                                    }
                                                    conn.close();
                                                });
                                request.addParameter('pkey', TYPES.Int, env.id);
                                conn.execSql(request);
                            } else {
                                callback(null, null);
                                conn.close();
                            }                           
                        }                        
                    });
                    request.addParameter('name', TYPES.VarChar, env.name);
                    request.addParameter('active', TYPES.Int, env.active);
                    request.addParameter('runDLFlag', TYPES.Int, env.runPreSummFlag);
                    request.addParameter('dlStTime', TYPES.VarChar, env.preSummStartTime);
                    request.addParameter('uploadFlag', TYPES.Int, env.runUploadFlag);
                    request.addParameter('uploadStTime', TYPES.VarChar, env.uploadStartTime);
                    request.addParameter('midloadFlag', TYPES.Int, env.runReSummFlag);
                    request.addParameter('midLoadStTime', TYPES.VarChar, env.reSummStartTime);
                    request.addParameter('assignFlag', TYPES.Int, env.runDownloadFlag);
                    request.addParameter('assignStTime', TYPES.VarChar, env.downloadStartTime);
                    request.addParameter('scFlag', TYPES.Int, env.runScoreCardFlag);
                    request.addParameter('scStTime', TYPES.VarChar, env.scoreCardStartTime);
                    request.addParameter('scFreq', TYPES.VarChar, env.scheduleFreq);
                    request.addParameter('actDir', TYPES.VarChar, env.activityDir);
                    request.addParameter('doneActDir', TYPES.VarChar, env.doneActivityDir);
                    request.addParameter('dlDir', TYPES.VarChar, env.downloadDir);
                    request.addParameter('doneDlDir', TYPES.VarChar, env.doneDownloadDir);
                    request.addParameter('secDlDir', TYPES.VarChar, env.secondaryDownloadDir);
                    request.addParameter('secDoneDlDir', TYPES.VarChar, env.secondaryDoneDownloadDir);
                    request.addParameter('fortranDir', TYPES.VarChar, env.fortranDir);
                    request.addParameter('scriptInstDir', TYPES.VarChar, env.scriptInstallDir);
                    request.addParameter('dbName', TYPES.VarChar, env.databaseName);
                    request.addParameter('ctUserName', TYPES.VarChar, env.ctUserAccount);
                    request.addParameter('pkey', TYPES.Int, env.id);
                    conn.execSql(request);
                }
            });
        }
    }

    activateEnv(config, env, callback) {
        if (env !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Activating environment with id:' + env.id);
                    var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 1 WHERE PKEY_ID = @pkey; ' +
                        'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 0 WHERE PKEY_ID != @pkey;';
                        
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, env.id);
                    conn.execSql(request);
                }
            });
        }
    }

    deleteEnv(config, env, callback) {
        if (env !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting environment with id:' + env.id);
                    var sqlStr = 'DELETE FROM BUNDLE_ENVIRONMENT WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, env.id);
                    conn.execSql(request);
                }
            });
        }
    }

    updateLineNumOnDel(config, env, callback) {
        if (env !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating environments lineNum...');

                    var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @lineNum';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('lineNum', TYPES.Int, env.lineNum);
                    conn.execSql(request);
                }
            });
        }
    }

    resetOrder(config, env, order, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                log.info('Resetting environment order...');
                if (env !== null) {
                    var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= @order';

                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= @order';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = @order WHERE PKEY_ID = @envId';
                                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                                        if (error) {
                                            log.error('ERROR :' + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            env.lineNum = order;
                                            callback(env, null);
                                        }
                                        conn.close();
                                    });
                                    request.addParameter('order', TYPES.Int, order);
                                    request.addParameter('envId', TYPES.Int, env.id);
                                    conn.execSql(request);
                                }
                            });
                            request.addParameter('order', TYPES.Int, order);
                            conn.execSql(request);
                        }
                    });
                    request.addParameter('order', TYPES.Int, env.lineNum);
                    conn.execSql(request);
                }
            }
        });
    }
}

const envSQLDB = new EnvironmentSQLDB();
module.exports = envSQLDB;