const OracleDB = require('oracledb');

var log = require('../../logger')(module);

class DialerRecycleDayODB {

    convertDialerRecycleDay(element) {
        var dialerRecycleDay = {};
        dialerRecycleDay.id = element[0];
        dialerRecycleDay.description = element[2];
        dialerRecycleDay.dialerName = element[3];
        dialerRecycleDay.recycleOn = element[4];
        return dialerRecycleDay;
    }

    getDialerRecycleDaysOB(rows) {
        if (Array.isArray(rows)) {
            var dialerRecycleDays = [];
            rows.forEach(row => {
                dialerRecycleDays.push(this.convertDialerRecycleDay(row));
            });
            return dialerRecycleDays;
        }
    }

    getDialerRecycleDays(connection, dialer, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM DIALER_RECYCLE_DAYS WHERE DIALER_NAME = :1';
            conn.execute(sqlStr, [dialer.name], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var dialerRecycleDays = this.getDialerRecycleDaysOB(results.rows);
                    callback(dialerRecycleDays, null);
                }
            });
        });
    }

    createDialerRecycleDays(connection, dialerRecycleDays, dialer, callback) {
        if (dialerRecycleDays !== null && dialerRecycleDays.length > 0) {
            connection.then((conn) => {

                var sqlStr = 'INSERT INTO DIALER_RECYCLE_DAYS (PKEY_ID, DESCRIPTION, DIALER_NAME, RECYCLE_ON) ' +
                    'VALUES (DIALER_RECYCLE_DAYS_SEQ.nextval, :1, :2, :3)';

                var dataBinds = [];
                dialerRecycleDays.forEach(x => {
                    var data = [x.description, dialer.name, x.recycleOn];
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

    deleteDialerRecycleDays(connection, dialer, callback) {
        connection.then((conn) => {
            log.info('Deleting dialer recycleDays...');
            var sqlStr = 'DELETE FROM DIALER_RECYCLE_DAYS WHERE DIALER_NAME = :1';
            conn.execute(sqlStr, [dialer.name], { autoCommit: true }, (error, results) => {
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

const dialerRecycleDayODB = new DialerRecycleDayODB();
module.exports = dialerRecycleDayODB;