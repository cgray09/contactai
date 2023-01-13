var log = require('../../logger')(module);

class EnvironmentPGDB {

    convertEnv(element) {
        var env = {};
        env.id = element.PKEY_ID;
        env.lineNum = element.LINE_NUM;
        env.name = element.NAME;
        env.active = element.CURRENT_FLAG;
        env.runPreSummFlag = element.RUN_DOWNLOAD_FLAG;
        env.preSummStartTime = element.DOWNLOAD_START_TIME;
        env.runUploadFlag = element.RUN_UPLOAD_FLAG
        env.uploadStartTime = element.UPLOAD_START_TIME;
        env.runReSummFlag = element.RUN_MIDDLELOAD_FLAG
        env.reSummStartTime = element.MIDDLELOAD_START_TIME;
        env.runDownloadFlag = element.RUN_ASSIGNMENT_FLAG;
        env.downloadStartTime = element.ASSIGNMENT_START_TIME;
        env.runScoreCardFlag = element.RUN_SCORECARD_FLAG
        env.scoreCardStartTime = element.SCORECARD_START_TIME;
        env.scheduleFreq = element.SCORECARD_BUILD_FREQ;
        env.activityDir = element.ACTIVITY_DIRECTORY;
        env.doneActivityDir = element.DONE_ACTIVITY_DIRECTORY;
        env.downloadDir = element.DOWNLOAD_DIRECTORY;
        env.doneDownloadDir = element.DONE_DOWNLOAD_DIRECTORY;
        env.secondaryDownloadDir = element.SECONDARY_DLOAD_DIR;
        env.secondaryDoneDownloadDir = element.SECONDARY_DONE_DLOAD_DIR;
        env.fortranDir = element.FORTRAN_DIRECTORY;
        env.scriptInstallDir = element.SCRIPT_INSTALL_DIRECTORY;
        env.databaseName = element.DATABASE_NAME;
        env.ctUserAccount = element.CALLTECH_USER_NAME;
        return env;
    }

    getEnvsOB(results) {
        if (Array.isArray(results)) {
            var envs = [];
            results.forEach(element => {
                envs.push(this.convertEnv(element));
            });
            return envs;
        } else {
            return this.convertEnv(results);
        }
    }

    getEnvs(db, callback) {
        db.any('SELECT * FROM BUNDLE_ENVIRONMENT ORDER BY "LINE_NUM"')
            .then((results) => {
                var envs = this.getEnvsOB(results);
                callback(envs, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getEnv(db, envId, callback) {
        db.one('SELECT * FROM BUNDLE_ENVIRONMENT WHERE "PKEY_ID"= $1', envId)
            .then((results) => {
                var env = this.getEnvsOB(results);
                callback(env, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createEnv(db, env, callback) {
        if (env !== null) {
            var data = [env.name, env.active, env.runPreSummFlag, env.preSummStartTime, env.runUploadFlag, env.uploadStartTime, env.runReSummFlag,
            env.reSummStartTime, env.runDownloadFlag, env.downloadStartTime, env.runScoreCardFlag, env.scoreCardStartTime, env.scheduleFreq,
            env.activityDir, env.doneActivityDir, env.downloadDir, env.doneDownloadDir, env.secondaryDownloadDir,
            env.secondaryDoneDownloadDir, env.fortranDir, env.scriptInstallDir, env.databaseName, env.ctUserAccount];

            var sqlStr = 'INSERT INTO BUNDLE_ENVIRONMENT("PKEY_ID", "LINE_NUM", "NAME", "CURRENT_FLAG", "RUN_DOWNLOAD_FLAG", ' +
                '"DOWNLOAD_START_TIME", "RUN_UPLOAD_FLAG", "UPLOAD_START_TIME", "RUN_MIDDLELOAD_FLAG", "MIDDLELOAD_START_TIME", ' +
                '"RUN_ASSIGNMENT_FLAG", "ASSIGNMENT_START_TIME", "RUN_SCORECARD_FLAG", "SCORECARD_START_TIME", "SCORECARD_BUILD_FREQ", ' +
                '"ACTIVITY_DIRECTORY", "DONE_ACTIVITY_DIRECTORY", "DOWNLOAD_DIRECTORY", "DONE_DOWNLOAD_DIRECTORY", "SECONDARY_DLOAD_DIR", ' +
                '"SECONDARY_DONE_DLOAD_DIR", "FORTRAN_DIRECTORY", "SCRIPT_INSTALL_DIRECTORY", "DATABASE_NAME", "CALLTECH_USER_NAME") ' +
                'VALUES (NEXTVAL(\'"BUNDLE_ENVIRONMENT_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM BUNDLE_ENVIRONMENT), $1, $2, $3, $4, $5, $6, ' +
                '$7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) ' +
                'RETURNING *';

            db.one(sqlStr, data)
                .then((results) => {
                    var addedEnv = this.getEnvsOB(results);
                    if(env.active) {
                        db.any('UPDATE BUNDLE_ENVIRONMENT SET "CURRENT_FLAG" = 0 WHERE "PKEY_ID" != $1 RETURNING *', [addedEnv.id])
                            .then((results) => {
                                callback(addedEnv, null);
                            })
                            .catch((error) => {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            });
                    } else {
                        callback(addedEnv, null);
                    }
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateEnv(db, env, callback) {
        log.info('Updating environment with id:' + env.id);
        if (env !== null) {
            var sqlStr = 'UPDATE BUNDLE_ENVIRONMENT SET ' +
                '"NAME" = $1, "CURRENT_FLAG" = $2, "RUN_DOWNLOAD_FLAG" = $3, "DOWNLOAD_START_TIME" = $4, ' +
                '"RUN_UPLOAD_FLAG" = $5, "UPLOAD_START_TIME" = $6, "RUN_MIDDLELOAD_FLAG" = $7, ' +
                '"MIDDLELOAD_START_TIME" = $8, "RUN_ASSIGNMENT_FLAG" = $9, "ASSIGNMENT_START_TIME" = $10, ' +
                '"RUN_SCORECARD_FLAG" = $11, "SCORECARD_START_TIME" = $12, "SCORECARD_BUILD_FREQ" = $13, ' +
                '"ACTIVITY_DIRECTORY" = $14, "DONE_ACTIVITY_DIRECTORY" = $15, "DOWNLOAD_DIRECTORY" = $16, ' +
                '"DONE_DOWNLOAD_DIRECTORY" = $17, "SECONDARY_DLOAD_DIR" = $18, "SECONDARY_DONE_DLOAD_DIR" = $19, ' +
                '"FORTRAN_DIRECTORY" = $20, "SCRIPT_INSTALL_DIRECTORY" = $21, "DATABASE_NAME" = $22, ' +
                '"CALLTECH_USER_NAME" = $23 ' +
                'WHERE "PKEY_ID" = $24 RETURNING *';

            var data = [env.name, env.active, env.runPreSummFlag, env.preSummStartTime, env.runUploadFlag, env.uploadStartTime, env.runReSummFlag,
            env.reSummStartTime, env.runDownloadFlag, env.downloadStartTime, env.runScoreCardFlag, env.scoreCardStartTime, env.scheduleFreq,
            env.activityDir, env.doneActivityDir, env.downloadDir, env.doneDownloadDir, env.secondaryDownloadDir,
            env.secondaryDoneDownloadDir, env.fortranDir, env.scriptInstallDir, env.databaseName, env.ctUserAccount, env.id];

            db.one(sqlStr, data)
                .then((results) => {
                    var updatedEnv = this.getEnvsOB(results);
                    if(env.active) {
                        db.any('UPDATE BUNDLE_ENVIRONMENT SET "CURRENT_FLAG" = 0 WHERE "PKEY_ID" != $1 RETURNING *', [env.id])
                            .then((results) => {
                                callback(updatedEnv, null);
                            })
                            .catch((error) => {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            });
                    } else {
                        callback(updatedEnv, null);
                    }
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    activateEnv(db, env, callback) {
        if (env !== null) {
            log.info('Activating environment with id:' + env.id);
            var data = [env.id];
            db.any('UPDATE BUNDLE_ENVIRONMENT SET "CURRENT_FLAG" = 1 WHERE "PKEY_ID" = $1;' +
                'UPDATE BUNDLE_ENVIRONMENT SET "CURRENT_FLAG" = 0 WHERE "PKEY_ID" != $1 RETURNING *', data)
                .then((results) => {
                    callback(null, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteEnv(db, env, callback) {
        log.info('Deleting environment with id:' + env.id);
        db.one('DELETE FROM BUNDLE_ENVIRONMENT WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', env.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, env, callback) {
        log.info('Updating environments lineNum...');
        if (env !== null) {
            var data = [env.lineNum];
            db.any('UPDATE BUNDLE_ENVIRONMENT SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedEnvs = this.getEnvsOB(results);
                    callback(updatedEnvs, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    resetOrder(db, env, order, callback) {
        log.info('Resetting environment order...');
        if (env !== null) {
            db.any('UPDATE BUNDLE_ENVIRONMENT SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [env.lineNum])
                .then((results) => {

                    db.any('UPDATE BUNDLE_ENVIRONMENT SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE BUNDLE_ENVIRONMENT SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, env.id])
                                .then((results) => {
                                    var updatedEnv = this.getEnvsOB(results);
                                    callback(updatedEnv[0], null);
                                })
                                .catch((error) => {
                                    log.error("ERROR:" + JSON.stringify(error));
                                    callback(null, error);
                                });
                        })
                        .catch((error) => {
                            log.error("ERROR:" + JSON.stringify(error));
                            callback(null, error);
                        });
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }
}

const envPGDB = new EnvironmentPGDB();
module.exports = envPGDB;