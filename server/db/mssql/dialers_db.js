var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var MSSqlUtil = require('./mssql_seq_util');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

class DialersSQLDB {
    
    convertDialer(element) {
        var dialer = {};
        dialer.id = element['PKEY_ID'];
        dialer.description = element['DESCRIPTION'];
        dialer.name = element['DIALER_NAME'];
        dialer.timezone = element['SITE_TIME_ZONE'];
        dialer.sunday = element['SUNDAY'];
        dialer.monday = element['MONDAY'];
        dialer.tuesday = element['TUESDAY'];
        dialer.wednesday = element['WEDNESDAY'];
        dialer.thursday = element['THURSDAY'];
        dialer.friday = element['FRIDAY'];
        dialer.saturday = element['SATURDAY'];
        dialer.city = element['DIALER_CITY'];
        dialer.dst = element['DST_FLAG'];
        dialer.dialerId = element['DIALER_ID']; // pkey_id from DIALER table
        return dialer;
    }

    getDialersOB(rows) {
        if (Array.isArray(rows)) {
            var dialers = [];
            rows.forEach(row => {
                var rowObject = [];
                row.forEach(field => {
                    rowObject[field.metadata.colName] = field.value;
                });
                dialers.push(this.convertDialer(rowObject));
            });
            return dialers;
        }
    }

    getDialers(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT I.*, D.PKEY_ID AS DIALER_ID FROM DIALER_INFO I ' + 
                    'RIGHT OUTER JOIN DIALER D ON I.DIALER_NAME = D.NAME ORDER BY I.DIALER_NAME';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback([], null) }
                        else {
                            var dialers = this.getDialersOB(rows);
                            callback(dialers, null);
                        }
                    }
                    conn.close();
                });
                conn.execSql(request);
            }
        });
    }

    getDialer(config, dialerId, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var sqlStr = 'SELECT I.*, D.PKEY_ID AS DIALER_ID FROM DIALER_INFO I ' + 
                    'LEFT OUTER JOIN DIALER D ON I.DIALER_NAME = D.NAME ' +
                    'WHERE I.PKEY_ID = @pkey';
                var request = new Request(sqlStr, (error, rowCount, rows) => {
                    if (error) {
                        log.error('ERROR :' + JSON.stringify(error));
                        callback(null, error);
                    } else {
                        if (rowCount === 0) { callback(null, null) }
                        else {
                            var dialers = this.getDialersOB(rows);
                            callback(dialers[0], null);
                        }
                    }
                    conn.close();
                });
                request.addParameter('pkey', TYPES.Int, dialerId);
                conn.execSql(request);
            }
        });
    }

    createDialer(config, dialer, callback) {
        if (dialer !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Creating dialer...');
                    MSSqlUtil.getSeqNextVal(conn, 'DIALER_INFO_SEQ', (error, pkey) => {
                        if (error) {
                            log.error('Unable to fetch next sequence ' + error);
                            callback(null, error);
                            conn.close();
                        } else {
                            var sqlStr = 'INSERT INTO DIALER_INFO (PKEY_ID, DESCRIPTION, DIALER_NAME, SITE_TIME_ZONE, SUNDAY, MONDAY, TUESDAY, ' + 
                            'WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, DIALER_CITY, DST_FLAG) ' +
                                'VALUES (@pkey, @desc, @name, @timezone, @sun, @mon, @tues, @wed, @thurs, @fri, @sat, @city, @dst)';
                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                    conn.close();
                                } else {
                                    dialer.id = pkey; // this is the DIALER_INFO id.

                                    //Now insert record in DIALER table, referenced for dialer file format
                                    MSSqlUtil.getSeqNextVal(conn, 'DIALER_SEQ', (error, dialerId) => {
                                        if (error) {
                                            log.error('Unable to fetch next sequence ' + error);
                                            callback(null, error);
                                            conn.close();
                                        } else {
                                            dialer.dialerId = dialerId; //this is the DIALER id referenced for file format

                                            var sqlStr = 'INSERT INTO DIALER (PKEY_ID, DIALER_DESCRIPTION, NAME) VALUES (@id, @desc, @name)';
                                            var request = new Request(sqlStr, (error, rowCount, rows) => {
                                                if (error) {
                                                    log.error('ERROR :' + JSON.stringify(error));
                                                    callback(null, error);
                                                } else {
                                                    callback(dialer, null);
                                                }
                                                conn.close();
                                            });
                                            request.addParameter('id', TYPES.Int, dialerId);
                                            request.addParameter('desc', TYPES.VarChar, dialer.description);
                                            request.addParameter('name', TYPES.VarChar, dialer.name);
                                            conn.execSql(request);                                    
                                        }                                       
                                    }); 
                                }
                            });
                            request.addParameter('pkey', TYPES.Int, pkey);
                            request.addParameter('desc', TYPES.VarChar, dialer.description);
                            request.addParameter('name', TYPES.VarChar, dialer.name);
                            request.addParameter('timezone', TYPES.VarChar, dialer.timezone);
                            request.addParameter('sun', TYPES.Int, dialer.sunday);
                            request.addParameter('mon', TYPES.Int, dialer.monday);
                            request.addParameter('tues', TYPES.Int, dialer.tuesday);
                            request.addParameter('wed', TYPES.Int, dialer.wednesday);
                            request.addParameter('thurs', TYPES.Int, dialer.thursday);
                            request.addParameter('fri', TYPES.Int, dialer.friday);
                            request.addParameter('sat', TYPES.Int, dialer.saturday);
                            request.addParameter('city', TYPES.VarChar, dialer.city);
                            request.addParameter('dst', TYPES.Int, dialer.dst);
                            conn.execSql(request);
                        }
                    });
                }
            });
        }
    }

    updateDialer(config, dialer, callback) {
        if (dialer !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Updating dialer with id:' + dialer.id);
                    var sqlStr = 'UPDATE DIALER_INFO SET DESCRIPTION = @desc, DIALER_NAME = @name, SITE_TIME_ZONE = @timezone, SUNDAY = @sun, ' + 
                    'MONDAY = @mon, TUESDAY = @tues, WEDNESDAY = @wed, THURSDAY = @thurs, FRIDAY = @fri, SATURDAY = @sat, DIALER_CITY = @city, ' +
                    'DST_FLAG = @dst WHERE PKEY_ID = @pkey';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            sqlStr = 'UPDATE DIALER SET DIALER_DESCRIPTION = @desc, NAME = @name WHERE PKEY_ID = @pkey';
                            request = new Request(sqlStr, (error, rowCount, rows) => {
                                if (error) {
                                    log.error('ERROR :' + JSON.stringify(error));
                                    callback(null, error);
                                } else {
                                    callback(null, null);                                    
                                }
                                conn.close();
                            });
                            request.addParameter('desc', TYPES.VarChar, dialer.description);
                            request.addParameter('name', TYPES.VarChar, dialer.name);
                            request.addParameter('pkey', TYPES.Int, dialer.dialerId);  
                            conn.execSql(request);
                        }                        
                    });
                    request.addParameter('desc', TYPES.VarChar, dialer.description);
                    request.addParameter('name', TYPES.VarChar, dialer.name);
                    request.addParameter('timezone', TYPES.VarChar, dialer.timezone);
                    request.addParameter('sun', TYPES.Int, dialer.sunday);
                    request.addParameter('mon', TYPES.Int, dialer.monday);
                    request.addParameter('tues', TYPES.Int, dialer.tuesday);
                    request.addParameter('wed', TYPES.Int, dialer.wednesday);
                    request.addParameter('thurs', TYPES.Int, dialer.thursday);
                    request.addParameter('fri', TYPES.Int, dialer.friday);
                    request.addParameter('sat', TYPES.Int, dialer.saturday);
                    request.addParameter('city', TYPES.VarChar, dialer.city);
                    request.addParameter('dst', TYPES.Int, dialer.dst);
                    request.addParameter('pkey', TYPES.Int, dialer.id);
                    conn.execSql(request);
                }
            });
        }
    }

    deleteDialer(config, dialer, callback) {
        if (dialer !== null) {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    log.info('Deleting dialer with id:' + dialer.id);
                    var sqlStr = 'DELETE FROM DIALER_INFO WHERE PKEY_ID = @pkey; ' + 
                        'DELETE FROM DIALER WHERE PKEY_ID = @dialerId; ';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            callback(null, null);
                        }
                        conn.close();
                    });
                    request.addParameter('pkey', TYPES.Int, dialer.id);
                    request.addParameter('dialerId', TYPES.Int, dialer.dialerId);
                    conn.execSql(request);
                }
            });
        }
    }
}

const dialersSQLDB = new DialersSQLDB();
module.exports = dialersSQLDB;