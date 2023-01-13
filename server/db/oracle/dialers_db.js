var log = require('../../logger')(module);

class DialerODB {

    convertDialer(element) {
        var dialer = {};
        dialer.id = element[0];
        dialer.description = element[1];
        dialer.name = element[2];
        dialer.timezone = element[7];
        dialer.sunday = element[9];
        dialer.monday = element[10];
        dialer.tuesday = element[11];
        dialer.wednesday = element[12];
        dialer.thursday = element[13];
        dialer.friday = element[14];
        dialer.saturday = element[15];
        dialer.city = element[16];
        dialer.dst = element[17];
        dialer.dialerId = element[18]; // pkey_id from DIALER table
        return dialer;
    }

    getDialersOB(rows) {
        if (Array.isArray(rows)) {
            var dialers = [];
            rows.forEach(row => {
                dialers.push(this.convertDialer(row));
            });
            return dialers;
        }
    }

    getDialers(connection, callback) {
        connection.then((conn) => {

            var sqlStr = 'SELECT I.*, D.PKEY_ID AS DIALER_ID FROM DIALER_INFO I ' +
                'RIGHT OUTER JOIN DIALER D ON I.DIALER_NAME = D.NAME ORDER BY I.DIALER_NAME';

            conn.execute(sqlStr, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var dialers = this.getDialersOB(results.rows);
                    callback(dialers, null);
                }
            });
        });
    }

    getDialer(connection, dialerId, callback) {
        connection.then((conn) => {

            var sqlStr = 'SELECT I.*, D.PKEY_ID AS DIALER_ID FROM DIALER_INFO I, DIALER D ' +
                'WHERE I.DIALER_NAME = D.NAME AND I.PKEY_ID = :pkey';

            conn.execute(sqlStr, [dialerId], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if (results.rows.length === 0) { callback(null, null) }
                    else {
                        var dialers = this.getDialersOB(results.rows);
                        callback(dialers[0], null);
                    }
                }
            });
        });
    }

    createDialer(connection, dialer, callback) {
        connection.then((conn) => {
            log.info('Creating dialer...');
            if (dialer !== null) {
                conn.execute('SELECT DIALER_INFO_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        dialer.id = results.rows[0][0];

                        var sqlStr = 'INSERT INTO DIALER_INFO (PKEY_ID, DESCRIPTION, DIALER_NAME, SITE_TIME_ZONE, SUNDAY, MONDAY, TUESDAY, ' +
                            'WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, DIALER_CITY, DST_FLAG) ' +
                            'VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13)';

                        var bind = [dialer.id, dialer.description, dialer.name, dialer.timezone, dialer.sunday, dialer.monday, dialer.tuesday,
                        dialer.wednesday, dialer.thursday, dialer.friday, dialer.saturday, dialer.city, dialer.dst];

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);
                            } else {
                                // now insert into DIALER table, referenced for fileformat
                                conn.execute('SELECT DIALER_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                                    if (error) {
                                        log.error('Failed to fetch next sequence ' + error);
                                    } else {
                                        dialer.dialerId = results.rows[0][0];

                                        sqlStr = 'INSERT INTO DIALER (PKEY_ID, DIALER_DESCRIPTION, NAME) VALUES (:1, :2, :3)';

                                        bind = [dialer.dialerId, dialer.description, dialer.name];

                                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                                            if (error) {
                                                log.error("ERROR:" + JSON.stringify(error));
                                                callback(null, error);
                                            } else {
                                                callback(dialer, null);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    updateDialer(connection, dialer, callback) {
        connection.then((conn) => {
            log.info('Updating dialer with id:' + dialer.id);
            if (dialer !== null) {
                var sqlStr = 'UPDATE DIALER_INFO SET DESCRIPTION = :1, DIALER_NAME = :2, SITE_TIME_ZONE = :3, SUNDAY = :4, MONDAY = :5, ' +
                    'TUESDAY = :6, WEDNESDAY = :7, THURSDAY = :8, FRIDAY = :9, SATURDAY = :10, DIALER_CITY = :11, DST_FLAG  = :12 WHERE PKEY_ID = :13';

                var bind = [dialer.description, dialer.name, dialer.timezone, dialer.sunday, dialer.monday, dialer.tuesday,
                dialer.wednesday, dialer.thursday, dialer.friday, dialer.saturday, dialer.city, dialer.dst, dialer.id];

                conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                    if (error) {
                        log.error("ERROR:" + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        sqlStr = 'UPDATE DIALER SET DIALER_DESCRIPTION = :1, NAME = :2 WHERE PKEY_ID = :3';
                        bind = [dialer.description, dialer.name, dialer.dialerId];
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
        });
    }

    deleteDialer(connection, dialer, callback) {
        connection.then((conn) => {
            log.info('Deleting dialer with id:' + dialer.id);

            var sqlStr1 = 'DELETE FROM DIALER_INFO WHERE PKEY_ID = :1';
            var sqlStr2 = 'DELETE FROM DIALER WHERE PKEY_ID = :1';

            conn.execute(sqlStr1, [dialer.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    conn.execute(sqlStr2, [dialer.dialerId], { autoCommit: true }, (error, results) => {
                        if (error) {
                            log.error("ERROR:" + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                    });
                }
            });
        });
    }
}

const dialerODB = new DialerODB();
module.exports = dialerODB;