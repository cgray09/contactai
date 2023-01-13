const OracleDB = require('oracledb');

var log = require('../../logger')(module);

class CommonRecycleDayODB {

    convertCommonRecycleDay(element) {
        var commonRecycleDay = {};
        commonRecycleDay.id = element[0];
        commonRecycleDay.description = element[2];
        commonRecycleDay.recycleOn = element[3];
        return commonRecycleDay;
    }

    getCommonRecycleDaysOB(rows) {
        if (Array.isArray(rows)) {
            var commonRecycleDays = [];
            rows.forEach(row => {
                commonRecycleDays.push(this.convertCommonRecycleDay(row));
            });
            return commonRecycleDays;
        }
    }

    getCommonRecycleDays(connection, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM COMMON_RECYCLE_DAYS';
            conn.execute(sqlStr, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var commonRecycleDays = this.getCommonRecycleDaysOB(results.rows);
                    callback(commonRecycleDays, null);
                }
            });
        });
    }

    createCommonRecycleDays(connection, commonRecycleDays, callback) {
        if (commonRecycleDays !== null && commonRecycleDays.length > 0) {
            connection.then((conn) => {

                var sqlStr = 'INSERT INTO COMMON_RECYCLE_DAYS (PKEY_ID, DESCRIPTION, RECYCLE_ON) ' +
                    'VALUES (COMMON_RECYCLE_DAYS_SEQ.nextval, :1, :2)';

                var dataBinds = [];
                commonRecycleDays.forEach(x => {
                    var data = [x.description, x.recycleOn];
                    dataBinds.push(data);
                })

                const options = {
                    autoCommit: true,
                    batchErrors: true
                };
                
                conn.executeMany(sqlStr, dataBinds, options, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        callback(null, null);
                    }
                });
            });
        }
    }

    deleteCommonRecycleDays(connection, callback) {
        connection.then((conn) => {
            log.info('Deleting commonRecycleDays...');
            var sqlStr = 'DELETE FROM COMMON_RECYCLE_DAYS';
            conn.execute(sqlStr, [], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }
}

const commonRecycleDayODB = new CommonRecycleDayODB();
module.exports = commonRecycleDayODB;