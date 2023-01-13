var log = require('../../logger')(module);

class AssignSCPGDB {

    convertAssignSC(element) {
        var assignSC = {};
        assignSC.id = element.PKEY_ID;
        assignSC.description = element.DESCRIPTION;
        assignSC.lineNum = element.LINE_NUM;
        assignSC.refName1 = element.REF_NAME_1;
        assignSC.refName2 = element.REF_NAME_2;
        assignSC.refName3 = element.REF_NAME_3;
        assignSC.refName4 = element.REF_NAME_4;
        assignSC.refName5 = element.REF_NAME_5;
        assignSC.refName6 = element.REF_NAME_6;
        assignSC.refName7 = element.REF_NAME_7;
        assignSC.refName8 = element.REF_NAME_8;
        assignSC.refName9 = element.REF_NAME_9;
        assignSC.refName10 = element.REF_NAME_10;
        assignSC.scoreId = element.SCORE_ID;
        assignSC.callHistory = element.CALL_HISTORY_FLAG;
        return assignSC;
    }

    getAssignSCsOB(results) {
        if (Array.isArray(results)) {
            var assignSCs = [];
            results.forEach(element => {
                assignSCs.push(this.convertAssignSC(element));
            });
            return assignSCs;
        } else {
            return this.convertAssignSC(results);
        }
    }

    getAssignSCs(db, callback) {
        db.any('SELECT * FROM SCORE_ID_ASG ORDER BY "LINE_NUM"')
            .then((results) => {
                var assignSCs = this.getAssignSCsOB(results);
                callback(assignSCs, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getAssignSC(db, assignSCId, callback) {
        db.one('SELECT * FROM SCORE_ID_ASG WHERE "PKEY_ID"= $1', assignSCId)
            .then((results) => {
                var assignSC = this.getAssignSCsOB(results);
                callback(assignSC, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createAssignSC(db, assignSC, callback) {
        if (assignSC !== null) {
            var callHist = (assignSC.callHistory) ? 1 : 0;
            var data = [assignSC.description, assignSC.scoreId, callHist, assignSC.refName1, assignSC.refName2, assignSC.refName3, assignSC.refName4, assignSC.refName5, assignSC.refName6, assignSC.refName7, assignSC.refName8, assignSC.refName9, assignSC.refName10];
            db.one('INSERT INTO SCORE_ID_ASG("PKEY_ID", "LINE_NUM", "DESCRIPTION", "SCORE_ID", "CALL_HISTORY_FLAG", "REF_NAME_1", "REF_NAME_2", "REF_NAME_3", "REF_NAME_4", "REF_NAME_5", "REF_NAME_6", "REF_NAME_7", "REF_NAME_8", "REF_NAME_9", "REF_NAME_10") ' +
                'VALUES (NEXTVAL(\'"SCORE_ID_ASG_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM SCORE_ID_ASG), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ' +
                'RETURNING *', data)
                .then((results) => {
                    var addedAssignSC = this.getAssignSCsOB(results);
                    callback(addedAssignSC, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateAssignSC(db, assignSC, callback) {
        if (assignSC !== null) {
            log.info('Updating assignScoreCard with id:' + assignSC.id);
            var callHist = (assignSC.callHistory) ? 1 : 0;

            var data = [assignSC.description, assignSC.scoreId, assignSC.refName1, assignSC.refName2, assignSC.refName3, assignSC.refName4, assignSC.refName5,
            assignSC.refName6, assignSC.refName7, assignSC.refName8, assignSC.refName9, assignSC.refName10, callHist, assignSC.id];

            db.one('UPDATE SCORE_ID_ASG SET "DESCRIPTION" = $1, "SCORE_ID" = $2, "REF_NAME_1" = $3, "REF_NAME_2" = $4, "REF_NAME_3" = $5, ' +
                '"REF_NAME_4" = $6, "REF_NAME_5" = $7, "REF_NAME_6" = $8, "REF_NAME_7" = $9, "REF_NAME_8" = $10, "REF_NAME_9" = $11, "REF_NAME_10" = $12, "CALL_HISTORY_FLAG" = $13 ' +
                'WHERE "PKEY_ID" = $14 RETURNING *', data)
                .then((results) => {
                    var updatedAssignSC = this.getAssignSCsOB(results);
                    callback(updatedAssignSC, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteAssignSC(db, assignSC, callback) {
        log.info('Deleting assignScoreCard with id:' + assignSC.id);
        db.one('DELETE FROM SCORE_ID_ASG WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', assignSC.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, assignSC, callback) {
        log.info('Updating assignScoreCard lineNum...');
        if (assignSC !== null) {
            var data = [assignSC.lineNum];
            db.any('UPDATE SCORE_ID_ASG SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedAssignSCs = this.getAssignSCsOB(results);
                    callback(updatedAssignSCs, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateProperties(db, properties, callback) {
        if (properties != null) {
            log.info('Updating assignScoreCard properties... ');
            
            if (properties.refNameValue === null) {
                var sqlStr = 'UPDATE SCORE_ID_ASG SET "' + properties.refName + '" = $1 RETURNING *';
                var data = [properties.refNameValue];
                db.any(sqlStr, data)
                    .then((results) => {
                        callback(null, null);
                    })
                    .catch((error) => {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    });
                    
            } else {
                var data = [properties.refNameValue, properties.refNameValueId];
                var sqlStr = 'UPDATE SCORE_ID_ASG SET "' + properties.refName + '" = $1 WHERE "PKEY_ID" = $2 RETURNING *';
                db.one(sqlStr, data)
                    .then((results) => {
                        callback(null, null);
                    })
                    .catch((error) => {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    });
            }
        }
    }

    resetOrder(db, assignSC, order, callback) {
        log.info('Resetting assignScoreCard order...');
        if (assignSC !== null) {
            db.any('UPDATE SCORE_ID_ASG SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [assignSC.lineNum])
                .then((results) => {

                    db.any('UPDATE SCORE_ID_ASG SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE SCORE_ID_ASG SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, assignSC.id])
                                .then((results) => {
                                    var updatedAssignSC = this.getAssignSCsOB(results);
                                    callback(updatedAssignSC[0], null);
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

const assignSCPGDB = new AssignSCPGDB();
module.exports = assignSCPGDB;