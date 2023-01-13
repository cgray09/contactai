var log = require('../../logger')(module);

class EnvironmentODB {

    convertEnv(element) {
        var env = {};
        env.id = element[0];
        env.lineNum = element[16];
        env.name = element[19];
        env.active = element[7];
        env.runPreSummFlag = element[23];
        env.preSummStartTime = element[14];
        env.runUploadFlag = element[26]
        env.uploadStartTime = element[33];
        env.runReSummFlag = element[24]
        env.reSummStartTime = element[17];
        env.runDownloadFlag = element[22];
        env.downloadStartTime = element[3];
        env.runScoreCardFlag = element[25]
        env.scoreCardStartTime = element[28];
        env.scheduleFreq = element[27];
        env.activityDir = element[2];
        env.doneActivityDir = element[11];
        env.downloadDir = element[13];
        env.doneDownloadDir = element[12];
        env.secondaryDownloadDir = element[30];
        env.secondaryDoneDownloadDir = element[31];
        env.fortranDir = element[15];
        env.scriptInstallDir = element[29];
        env.databaseName = element[9];
        env.ctUserAccount = element[6];
        return env;
    }

    getEnvsOB(rows) {
        if (Array.isArray(rows)) {
            var envs = [];
            rows.forEach(row => {
                envs.push(this.convertEnv(row));
            });
            return envs;
        }
    }

    getEnvs(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM BUNDLE_ENVIRONMENT ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var envs = this.getEnvsOB(results.rows);
                    callback(envs, null);
                }
            });
        });
    }

    getEnv(connection, envId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM BUNDLE_ENVIRONMENT WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [envId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var envs = this.getEnvsOB(results.rows);
                        callback(envs[0], null);
                    }
                }
            });
        });
    }

    createEnv(connection, env, callback) {
        connection.then((conn) => {
            log.info('Creating environment...');
            if (env !== null) {
                conn.execute('SELECT BUNDLE_ENVIRONMENT_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        env.id = results.rows[0][0];


                        var sqlStr = 'INSERT INTO BUNDLE_ENVIRONMENT (PKEY_ID, LINE_NUM, NAME, CURRENT_FLAG, RUN_DOWNLOAD_FLAG, ' +
                            'DOWNLOAD_START_TIME, RUN_UPLOAD_FLAG, UPLOAD_START_TIME, RUN_MIDDLELOAD_FLAG, MIDDLELOAD_START_TIME, ' +
                            'RUN_ASSIGNMENT_FLAG, ASSIGNMENT_START_TIME, RUN_SCORECARD_FLAG, SCORECARD_START_TIME, SCORECARD_BUILD_FREQ, ' +
                            'ACTIVITY_DIRECTORY, DONE_ACTIVITY_DIRECTORY, DOWNLOAD_DIRECTORY, DONE_DOWNLOAD_DIRECTORY, SECONDARY_DLOAD_DIR, ' +
                            'SECONDARY_DONE_DLOAD_DIR, FORTRAN_DIRECTORY, SCRIPT_INSTALL_DIRECTORY, DATABASE_NAME, CALLTECH_USER_NAME) ' +
                            'VALUES (:1, (SELECT COALESCE(MAX(LINE_NUM), 0)+1 FROM BUNDLE_ENVIRONMENT), :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, ' +
                            ':14, :15, :16, :17, :18, :19, :20, :21, :22, :23, :24)';

                        var bind = [env.id, env.name, env.active, env.runPreSummFlag, env.preSummStartTime, env.runUploadFlag, env.uploadStartTime, env.runReSummFlag,
                        env.reSummStartTime, env.runDownloadFlag, env.downloadStartTime, env.runScoreCardFlag, env.scoreCardStartTime, env.scheduleFreq,
                        env.activityDir, env.doneActivityDir, env.downloadDir, env.doneDownloadDir, env.secondaryDownloadDir,
                        env.secondaryDoneDownloadDir, env.fortranDir, env.scriptInstallDir, env.databaseName, env.ctUserAccount];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                if(env.active) { //deactivate other environments
                                    var sqlStr2 = 'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 0 WHERE PKEY_ID != :1';
                                    conn.execute(sqlStr2, [env.id], { autoCommit: true }, (error, results) => {
                                        if (error) {
                                            log.error("ERROR:" + JSON.stringify(error));
                                            callback(null, error);
                                        } else {
                                            callback(env, null);
                                        }
                                    });
                                } else {
                                    callback(env, null);
                                }   
                            }
                        });
                    }
                });
            }
        });
    }

    updateEnv(connection, env, callback) {
        connection.then((conn) => {
            log.info('Updating environment with id:' + env.id);
            if (env !== null) {
                var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET ' +
                    'NAME = :1, CURRENT_FLAG = :2, RUN_DOWNLOAD_FLAG = :3, DOWNLOAD_START_TIME = :4, ' +
                    'RUN_UPLOAD_FLAG = :5, UPLOAD_START_TIME = :6, RUN_MIDDLELOAD_FLAG = :7, ' +
                    'MIDDLELOAD_START_TIME = :8, RUN_ASSIGNMENT_FLAG = :9, ASSIGNMENT_START_TIME = :10, ' +
                    'RUN_SCORECARD_FLAG = :11, SCORECARD_START_TIME = :12, SCORECARD_BUILD_FREQ = :13, ' +
                    'ACTIVITY_DIRECTORY = :14, DONE_ACTIVITY_DIRECTORY = :15, DOWNLOAD_DIRECTORY = :16, ' +
                    'DONE_DOWNLOAD_DIRECTORY = :17, SECONDARY_DLOAD_DIR = :18, SECONDARY_DONE_DLOAD_DIR = :19, ' +
                    'FORTRAN_DIRECTORY = :20, SCRIPT_INSTALL_DIRECTORY = :21, DATABASE_NAME = :22, ' +
                    'CALLTECH_USER_NAME = :23' +
                    'WHERE PKEY_ID = :24';

                var bind = [env.name, env.active, env.runPreSummFlag, env.preSummStartTime, env.runUploadFlag, env.uploadStartTime, env.runReSummFlag,
                env.reSummStartTime, env.runDownloadFlag, env.downloadStartTime, env.runScoreCardFlag, env.scoreCardStartTime, env.scheduleFreq,
                env.activityDir, env.doneActivityDir, env.downloadDir, env.doneDownloadDir, env.secondaryDownloadDir,
                env.secondaryDoneDownloadDir, env.fortranDir, env.scriptInstallDir, env.databaseName, env.ctUserAccount, env.id];

                conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if(env.active) { //deactivate other environments
                            var sqlStr2 = 'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 0 WHERE PKEY_ID != :1';
                            conn.execute(sqlStr2, [env.id], { autoCommit: true }, (error, results) => {
                                if (error) {
                                    log.error("ERROR:" + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    callback(null, null);
                                }
                            });
                        } else {
                            callback(null, null);
                        }                              
                    }
                });
            }
        });
    }

    activateEnv(connection, env, callback) {
        connection.then((conn) => {
            if (env !== null) {
                var sqlStr1 = 'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 1 WHERE PKEY_ID = :1';
                var sqlStr2 = 'UPDATE BUNDLE_ENVIRONMENT SET CURRENT_FLAG = 0 WHERE PKEY_ID != :1';

                log.info('Activating environment with id:' + env.id);
                conn.execute(sqlStr1, [env.id], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        conn.execute(sqlStr2, [env.id], { autoCommit: true }, (error, results) => {
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

    deleteEnv(connection, env, callback) {
        connection.then((conn) => {
            log.info('Deleting environment with id:' + env.id);
            var sqlStr = 'DELETE FROM BUNDLE_ENVIRONMENT WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [env.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, env, callback) {
        connection.then((conn) => {
            log.info('Updating environments lineNum...');
            if (env !== null) {
                var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [env.lineNum], { autoCommit: true }, (error, results) => {
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

    resetOrder(connection, env, order, callback) {
        connection.then((conn) => {
            log.info('Resetting environment order...');
            if (env !== null) {
                var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [env.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, env.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        env.lineNum = order;
                                        callback(env, null);
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

const environmentODB = new EnvironmentODB();
module.exports = environmentODB;