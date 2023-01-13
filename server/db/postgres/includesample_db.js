var log = require('../../logger')(module);

class IncludeSamplePGDB {

    convertSample(element) {
        var sample = {};
        sample.id = element.PKEY_ID;
        sample.description = element.DESCRIPTION;
        sample.include = element.INCLUDE;
        sample.lineNum = element.LINE_NUM;
        sample.refName1 = element.REF_NAME_1;
        sample.refName2 = element.REF_NAME_2;
        sample.refName3 = element.REF_NAME_3;
        sample.refName4 = element.REF_NAME_4;
        sample.refName5 = element.REF_NAME_5;
        sample.refName6 = element.REF_NAME_6;
        sample.refName7 = element.REF_NAME_7;
        sample.refName8 = element.REF_NAME_8;
        sample.refName9 = element.REF_NAME_9;
        sample.refName10 = element.REF_NAME_10;
        return sample;
    }

    getSamplesOB(results) {
        if (Array.isArray(results)) {
            var samples = [];
            results.forEach(element => {
                samples.push(this.convertSample(element));
            });
            return samples;
        } else {
            return this.convertSample(results);
        }
    }

    getSamples(db, callback) {
        db.any('SELECT * FROM DEV_SAMPLE ORDER BY "LINE_NUM"')
            .then((results) => {
                var samples = this.getSamplesOB(results);
                callback(samples, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getSample(db, sampleId, callback) {
        db.one('SELECT * FROM DEV_SAMPLE WHERE "PKEY_ID"= $1', sampleId)
            .then((results) => {
                var sample = this.getSamplesOB(results);
                callback(sample, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createSample(db, sample, callback) {
        if (sample !== null) {
            var data = [sample.description, sample.include, sample.refName1, sample.refName2, sample.refName3, sample.refName4, sample.refName5, sample.refName6, sample.refName7, sample.refName8, sample.refName9, sample.refName10];
            db.one('INSERT INTO DEV_SAMPLE("PKEY_ID", "LINE_NUM", "DESCRIPTION", "INCLUDE", "REF_NAME_1", "REF_NAME_2", "REF_NAME_3", "REF_NAME_4", "REF_NAME_5", "REF_NAME_6", "REF_NAME_7", "REF_NAME_8", "REF_NAME_9", "REF_NAME_10") ' +
                'VALUES (NEXTVAL(\'"DEV_SAMPLE_SEQ"\'), (SELECT COALESCE(MAX("LINE_NUM"), 0)+1 FROM DEV_SAMPLE), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ' +
                'RETURNING *', data)
                .then((results) => {
                    var addedSample = this.getSamplesOB(results);
                    callback(addedSample, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateSample(db, sample, callback) {
        if (sample !== null) {
            log.info('Updating include sample with id:' + sample.id);

            var data = [sample.description, sample.include, sample.refName1, sample.refName2, sample.refName3, sample.refName4, sample.refName5,
            sample.refName6, sample.refName7, sample.refName8, sample.refName9, sample.refName10, sample.id];

            db.one('UPDATE DEV_SAMPLE SET "DESCRIPTION" = $1, "INCLUDE" = $2, "REF_NAME_1" = $3, "REF_NAME_2" = $4, "REF_NAME_3" = $5, ' +
                '"REF_NAME_4" = $6, "REF_NAME_5" = $7, "REF_NAME_6" = $8, "REF_NAME_7" = $9, "REF_NAME_8" = $10, "REF_NAME_9" = $11, "REF_NAME_10" = $12 ' +
                'WHERE "PKEY_ID" = $13 RETURNING *', data)
                .then((results) => {
                    var updatedSample = this.getSamplesOB(results);
                    callback(updatedSample, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteSample(db, sample, callback) {
        log.info('Deleting time sample with id:' + sample.id);
        db.one('DELETE FROM DEV_SAMPLE WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', sample.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, sample, callback) {
        log.info('Updating time samples lineNum...');
        if (sample !== null) {
            var data = [sample.lineNum];
            db.any('UPDATE DEV_SAMPLE SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedSamples = this.getSamplesOB(results);
                    callback(updatedSamples, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    updateProperties(db, properties, callback) {
        if (properties != null) {
            log.info('Updating include sample point properties... ');

            if (properties.refNameValue === null) {
                var sqlStr = 'UPDATE DEV_SAMPLE SET "' + properties.refName + '" = $1 RETURNING *';
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
                var data = [properties.refNameValue, properties.refNameValueId, properties.refNameLength, properties.refNameLengthId];

                var sqlStr = 'UPDATE DEV_SAMPLE SET "' + properties.refName + '" = $1 WHERE "PKEY_ID" = $2; ' +
                    'UPDATE DEV_SAMPLE SET "' + properties.refName + '" = $3 WHERE "PKEY_ID" = $4 RETURNING *';

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

    resetOrder(db, sample, order, callback) {
        log.info('Resetting includeSample order...');
        if (sample !== null) {
            db.any('UPDATE DEV_SAMPLE SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [sample.lineNum])
                .then((results) => {

                    db.any('UPDATE DEV_SAMPLE SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE DEV_SAMPLE SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, sample.id])
                                .then((results) => {
                                    var updatedSample = this.getSamplesOB(results);
                                    callback(updatedSample[0], null);
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

const samplePGDB = new IncludeSamplePGDB();
module.exports = samplePGDB;