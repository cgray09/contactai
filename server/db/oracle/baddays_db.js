const OracleDB = require('oracledb');

var log = require('../../logger')(module);

class BadDayODB {

    epochToDateString(epoch) {            
        var date = new Date(epoch * 86400 * 1000);
        var str =  (date.getFullYear() + '' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '' + ((date.getDate() > 8) ? (date.getDate() + 1) : ('0' + (date.getDate() + 1))));       
        return str;
    }

    convertBadDay(element) {
        var badDay = {};
        badDay.badDay = this.epochToDateString(element[0]);
        badDay.dialerName = element[1];
        return badDay;
    }

    getBadDaysOB(rows) {
        if (Array.isArray(rows)) {
            var badDays = [];
            rows.forEach(row => {
                badDays.push(this.convertBadDay(row));
            });
            return badDays;
        }
    }

    getBadDays(connection, dialer, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM BAD_DAYS WHERE DIALER_NAME IN (\'all\', :1)';
            conn.execute(sqlStr, [dialer.name], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var badDays = this.getBadDaysOB(results.rows);
                    callback(badDays, null);
                }
            });
        });
    }

    getDialerBadDays(connection, dialer, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM BAD_DAYS WHERE DIALER_NAME = :1';
            conn.execute(sqlStr, [dialer.name], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var badDays = this.getBadDaysOB(results.rows);
                    callback(badDays, null);
                }
            });
        });
    }

    createBadDays(connection, badDays, callback) {
        if (badDays !== null && badDays.length > 0) {
            connection.then((conn) => {

                var sqlStr = 'INSERT INTO BAD_DAYS (BAD_DAY, DIALER_NAME) ' +
                    'VALUES (:1, :2)';

                var dataBinds = [];
                badDays.forEach(x => {
                    var data = [x.badDay, x.dialerName];
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

    deleteBadDays(connection, dialer, callback) {
        connection.then((conn) => {
            log.info('Deleting badDays...');
            var sqlStr = 'DELETE FROM BAD_DAYS WHERE DIALER_NAME IN (\'all\', :1)';
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

    deleteDialerBadDays(connection, dialer, callback) {
        connection.then((conn) => {
            log.info('Deleting badDays...');
            var sqlStr = 'DELETE FROM BAD_DAYS WHERE DIALER_NAME = :1';
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

const badDayODB = new BadDayODB();
module.exports = badDayODB;