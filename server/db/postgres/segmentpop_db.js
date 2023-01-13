var log = require('../../logger')(module);

class SegmentPopPGDB {

    convertSegmentPop(element) {
        var segmentPop = {};
        segmentPop.id = element.PKEY_ID;
        segmentPop.description = element.DESCRIPTION;
        segmentPop.lineNum = element.LINE_NUM;
        segmentPop.refName1 = element.REF_NAME_1;
        segmentPop.refName2 = element.REF_NAME_2;
        segmentPop.refName3 = element.REF_NAME_3;
        segmentPop.refName4 = element.REF_NAME_4;
        segmentPop.refName5 = element.REF_NAME_5;
        segmentPop.refName6 = element.REF_NAME_6;
        segmentPop.refName7 = element.REF_NAME_7;
        segmentPop.refName8 = element.REF_NAME_8;
        segmentPop.refName9 = element.REF_NAME_9;
        segmentPop.refName10 = element.REF_NAME_10;
        segmentPop.spId = element.SPID;
        return segmentPop;
    }

    getSegmentPopsOB(results) {
        if (Array.isArray(results)) {
            var segmentPops = [];
            results.forEach(element => {
                segmentPops.push(this.convertSegmentPop(element));
            });
            return segmentPops;
        } else {
            return this.convertSegmentPop(results);
        }
    }

    getSegmentPops(db, callback) {
        db.any('SELECT * FROM SPID_ASG ORDER BY "LINE_NUM"')
            .then((results) => {
                var segmentPops = this.getSegmentPopsOB(results);
                callback(segmentPops, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getSegmentPop(db, segmentPopId, callback) {
        db.one('SELECT * FROM SPID_ASG WHERE "PKEY_ID"= $1', segmentPopId)
            .then((results) => {
                var segmentPop = this.getSegmentPopsOB(results);
                callback(segmentPop, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createSegmentPop(db, segmentPop, callback) {
        if (segmentPop !== null) {
            var data = [segmentPop.description, segmentPop.spId, segmentPop.refName1, segmentPop.refName2, segmentPop.refName3, segmentPop.refName4, segmentPop.refName5, segmentPop.refName6, segmentPop.refName7, segmentPop.refName8, segmentPop.refName9, segmentPop.refName10];
            db.one('INSERT INTO SPID_ASG("PKEY_ID", "LINE_NUM", "DESCRIPTION", "SPID", "REF_NAME_1", "REF_NAME_2", "REF_NAME_3", "REF_NAME_4", "REF_NAME_5", "REF_NAME_6", "REF_NAME_7", "REF_NAME_8", "REF_NAME_9", "REF_NAME_10") ' +
                'VALUES (NEXTVAL(\'"SPID_ASG_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM SPID_ASG), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ' +
                'RETURNING *', data)
                .then((results) => {
                    var addedSegmentPop = this.getSegmentPopsOB(results);
                    callback(addedSegmentPop, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateSegmentPop(db, segmentPop, callback) {
        if (segmentPop !== null) {
            log.info('Updating segmentPopulation with id:' + segmentPop.id);
            
            var data = [segmentPop.description, segmentPop.spId, segmentPop.refName1, segmentPop.refName2, segmentPop.refName3, segmentPop.refName4, segmentPop.refName5,
            segmentPop.refName6, segmentPop.refName7, segmentPop.refName8, segmentPop.refName9, segmentPop.refName10, segmentPop.id];

            db.one('UPDATE SPID_ASG SET "DESCRIPTION" = $1, "SPID" = $2, "REF_NAME_1" = $3, "REF_NAME_2" = $4, "REF_NAME_3" = $5, ' +
                '"REF_NAME_4" = $6, "REF_NAME_5" = $7, "REF_NAME_6" = $8, "REF_NAME_7" = $9, "REF_NAME_8" = $10, "REF_NAME_9" = $11, "REF_NAME_10" = $12 ' +
                'WHERE "PKEY_ID" = $13 RETURNING *', data)
                .then((results) => {
                    var updatedSegmentPop = this.getSegmentPopsOB(results);
                    callback(updatedSegmentPop, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteSegmentPop(db, segmentPop, callback) {
        log.info('Deleting segmentPopulation with id:' + segmentPop.id);
        db.one('DELETE FROM SPID_ASG WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', segmentPop.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, segmentPop, callback) {
        log.info('Updating segmentPopulation lineNum...');
        if (segmentPop !== null) {
            var data = [segmentPop.lineNum];
            db.any('UPDATE SPID_ASG SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedSegmentPops = this.getSegmentPopsOB(results);
                    callback(updatedSegmentPops, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateProperties(db, properties, callback) {
        if (properties != null) {
            log.info('Updating segmentPopulation properties... ');
            
            if (properties.refNameValue === null) {
                var sqlStr = 'UPDATE SPID_ASG SET "' + properties.refName + '" = $1 RETURNING *';
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
                var sqlStr = 'UPDATE SPID_ASG SET "' + properties.refName + '" = $1 WHERE "PKEY_ID" = $2 RETURNING *';
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

    resetOrder(db, segmentPop, order, callback) {
        log.info('Resetting segmentPopulation order...');
        if (segmentPop !== null) {
            db.any('UPDATE SPID_ASG SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [segmentPop.lineNum])
                .then((results) => {

                    db.any('UPDATE SPID_ASG SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE SPID_ASG SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, segmentPop.id])
                                .then((results) => {
                                    var updatedSegmentPop = this.getSegmentPopsOB(results);
                                    callback(updatedSegmentPop[0], null);
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

const segmentPopPGDB = new SegmentPopPGDB();
module.exports = segmentPopPGDB;