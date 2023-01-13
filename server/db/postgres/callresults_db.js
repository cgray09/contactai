var log = require('../../logger')(module);

class CallResultPGDB {

    convertVariable(element) {
        var variable = {};
        variable.id = element.PKEY_ID;
        variable.lineNum = element.LINE_NUM;
        variable.name = element.REF_NAME;
        variable.generateName = element.NAME;
        variable.description = element.DESCRIPTION;
        return variable;
    }

    getVariablesOB(results) {
        if (Array.isArray(results)) {
            var variables = [];
            results.forEach(element => {
                variables.push(this.convertVariable(element));
            });
            return variables;
        } else {
            return this.convertVariable(results);
        }
    }

    getVariables(db, callback) {
        db.any('SELECT * FROM GENERATE ORDER BY "LINE_NUM"')
            .then((results) => {
                var variables = this.getVariablesOB(results);
                callback(variables, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    getVariable(db, variableId, callback) {
        db.one('SELECT * FROM GENERATE WHERE "PKEY_ID"= $1', variableId)
            .then((results) => {
                var variable = this.getVariablesOB(results);
                callback(variable, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createVariable(db, variable, callback) {
        log.info('Creating variable...');
        if (variable !== null) {
            var data = [variable.index, variable.name, variable.generateName, variable.description];

            var sqlLock = `LOCK TABLE GENERATE IN EXCLUSIVE MODE`;
            var sqlStr1 = `UPDATE GENERATE SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1`;
            var sqlStr2 = `INSERT INTO GENERATE ("PKEY_ID", "LINE_NUM", "REF_NAME", "NAME", "DESCRIPTION")
                VALUES (NEXTVAL(\'"GENERATE_SEQ"\'), $1, $2, $3, $4)
                RETURNING *`;
            
            db.tx(t => {
                const sqlLock1 = t.none(sqlLock)
                .catch((error) => {
                    return error;
                });

                const sqlRet1 = t.none(sqlStr1, data)
                .catch((error) => {
                    return error;
                });
                    
                const sqlRet2 = t.one(sqlStr2, data)
                .then((results) => {
                    var addedFileFormat = this.getFileFormatsOB(results);
                    return addedFileFormat;
                })
                .catch((error) => {
                    return error;
                });
                    
                return t.batch([sqlLock1, sqlRet1, sqlRet2]);
            })
            .then((results) => {
                callback(results, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
        }
    }

    updateVariable(db, variable, callback) {
        log.info('Updating variable with id:' + variable.id);
        if (variable !== null) {
            var data = [variable.name, variable.generateName, variable.description, variable.id];
            db.one('UPDATE GENERATE SET "REF_NAME" = $1, "NAME" = $2, "DESCRIPTION" = $3 WHERE "PKEY_ID" = $4 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedVariable = this.getVariablesOB(results);
                    callback(updatedVariable, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteVariable(db, variable, callback) {
        log.info('Deleting variable with id:' + variable.id);
        db.one('DELETE FROM GENERATE WHERE "PKEY_ID"= $1 RETURNING "PKEY_ID"', variable.id)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, variable, callback) {
        log.info('Updating variables lineNum...');
        if (variable !== null) {
            var data = [variable.lineNum];
            db.any('UPDATE GENERATE SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 ' +
                'RETURNING *', data)
                .then((results) => {
                    var updatedVariables = this.getVariablesOB(results);
                    callback(updatedVariables, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    resetOrder(db, variable, order, callback) {
        log.info('Resetting variables order...');
        if (variable !== null) {
            db.any('UPDATE GENERATE SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "LINE_NUM" >= $1 RETURNING *', [variable.lineNum])
                .then((results) => {

                    db.any('UPDATE GENERATE SET "LINE_NUM" = "LINE_NUM" + 1 WHERE "LINE_NUM" >= $1 RETURNING *', [order])
                        .then((results) => {

                            db.any('UPDATE GENERATE SET "LINE_NUM" = $1 WHERE "PKEY_ID"= $2 RETURNING *', [order, variable.id])
                                .then((results) => {
                                    var updatedVariable = this.getVariablesOB(results);
                                    callback(updatedVariable[0], null);
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

const callResultPGDB = new CallResultPGDB();
module.exports = callResultPGDB;