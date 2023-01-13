var log = require('../../logger')(module);

class CallResultODB {
    
    convertVariable(element) {
        var variable = {};
        variable.id = element[0];
        variable.description = element[1];
        variable.lineNum = element[2];
        variable.generateName = element[3];
        variable.name = element[5];
        return variable;
    }

    getVariablesOB(rows) {
        if (Array.isArray(rows)) {
            var variables = [];
            rows.forEach(row => {
                variables.push(this.convertVariable(row));
            });
            return variables;
        }
    }

    getVariables(connection, callback) {
        connection.then((conn) => {
            conn.execute('SELECT * FROM GENERATE ORDER BY LINE_NUM', (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var variables = this.getVariablesOB(results.rows);
                    callback(variables, null);
                }
            });
        });
    }

    getVariable(connection, variableId, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM GENERATE WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [variableId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if(results.rows.length === 0) { callback(null, null) }
                    else {
                        var variables = this.getVariablesOB(results.rows);
                        callback(variables[0], null);
                    }
                }
            });
        });
    }

    createVariable(connection, variable, callback) {
        connection.then((conn) => {
            log.info('Creating variable...');
            if (variable !== null) {
                conn.execute('SELECT GENERATE_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        variable.id = results.rows[0][0];

                        var sqlStr = `BEGIN
                            UPDATE GENERATE SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1;
                            INSERT INTO GENERATE (PKEY_ID, LINE_NUM, REF_NAME, NAME, DESCRIPTION)
                            VALUES (:2, :3, :4, :5, :6);
                        END;`;

                        var bind = [variable.index, variable.id, variable.index, variable.name, variable.generateName, variable.description];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                callback(variable, null);
                            }
                        });
                    }
                });
            }
        });
    }

    updateVariable(connection, variable, callback) {
        connection.then((conn) => {
            log.info('Updating variable with id:' + variable.id);
            if (variable !== null) {
                var sqlStr = 'UPDATE GENERATE SET REF_NAME = :1, NAME = :2, DESCRIPTION = :3 WHERE PKEY_ID = :4';

                var bind = [variable.name, variable.generateName, variable.description,  variable.id];

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

    deleteVariable(connection, variable, callback) {
        connection.then((conn) => {
            log.info('Deleting variable with id:' + variable.id);
            var sqlStr = 'DELETE FROM GENERATE WHERE PKEY_ID = :pkey';
            conn.execute(sqlStr, [variable.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, variable, callback) {
        connection.then((conn) => {
            log.info('Updating variables lineNum...');
            if (variable !== null) {
                var sqlStr = 'UPDATE GENERATE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [variable.lineNum], { autoCommit: true }, (error, results) => {
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

    resetOrder(connection, variable, order, callback) {
        connection.then((conn) => {
            log.info('Resetting variables order...');
            if (variable !== null) {
                var sqlStr = 'UPDATE GENERATE SET LINE_NUM = LINE_NUM - 1 WHERE LINE_NUM >= :1';
                conn.execute(sqlStr, [variable.lineNum], { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        var sqlStr = 'UPDATE GENERATE SET LINE_NUM = LINE_NUM + 1 WHERE LINE_NUM >= :1';
                        conn.execute(sqlStr, [order], { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                var sqlStr = 'UPDATE GENERATE SET LINE_NUM = :1 WHERE PKEY_ID = :2';
                                conn.execute(sqlStr, [order, variable.id], { autoCommit: true }, (error, results) => {
                                    if (error) {
                                        log.error("ERROR:" + JSON.stringify(error));
                                        callback(null, error);
                                    } else {
                                        variable.lineNum = order;
                                        callback(variable, null);
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

const callResultODB = new CallResultODB();
module.exports = callResultODB;