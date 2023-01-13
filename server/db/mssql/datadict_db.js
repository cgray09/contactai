var dbUtil = require('../db_util');
var log = require('../../logger')(module);
var Request = require('tedious').Request;

//scorecards - analysis characteristics data dict SQL's
const SAKSql = 'SELECT REF_NAME, DB_TYPE, DESCRIPTION, \'SAK\' as SOURCE FROM SCORE_ACCTS_KEEPS_PARM WHERE REF_NAME NOT LIKE \'%INDEX%\' ORDER BY REF_NAME ASC';
const HISTSql = 'SELECT REF_NAME, \'NUMERIC\' as DB_TYPE, DESCRIPTION, \'SUMMARIZATION\' as SOURCE FROM HISTORY_GENERATE_2 WHERE SUBPROC NOT IN (\'DETAIL\') ORDER BY REF_NAME ASC';

class DataDictionarySQLDB {

    /*START: Data dictionary variables retrieval based on table name*/

    getDataDictionaryVariables(config, table, callback) {
        if (table && table !== "") {
            var conn = dbUtil.getConnection(config);
            conn.connect((err) => {
                if (err) {
                    log.error('Failed DB Connection :' + err);
                    callback(null, error);
                } else {
                    var sqlStr = 'SELECT DISTINCT(REF_NAME) FROM ' + table + ' WHERE LINE_NUM > 0 ORDER BY REF_NAME';
                    var request = new Request(sqlStr, (error, rowCount, rows) => {
                        if (error) {
                            log.error('ERROR :' + JSON.stringify(error));
                            callback(null, error);
                        } else {
                            if (rowCount === 0) { callback([], null) }
                            else {
                                var data = [];
                                rows.forEach(row => {
                                    data.push(row[0].value);
                                });
                                callback(data, null);
                            }
                        }
                        conn.close();
                    });
                    conn.execSql(request);
                }
            });
        }
        else {
            callback([], null);
        }
    }

    /*END: Data dictionary variables retrieval  based on table name*/


    /*START: scorecards - analysis characteristics data dictionary retrieval */
 
    getAnalysisCharDataArr(rows) {
        var data = [];
        if (Array.isArray(rows)) {
            rows.forEach(row => {
                var field = {};
                field.name = row[0].value; field.type = row[1].value; field.description = row[2].value; field.source = row[3].value;
                data.push(field);
            });
            return data;
        }
    }

    getAnalysisCharData(config, callback) {
        var conn = dbUtil.getConnection(config);
        conn.connect((err) => {
            if (err) {
                log.error('Failed DB Connection :' + err);
                callback(null, error);
            } else {
                var allData = [];
                var request1 = new Request(SAKSql, (error, rowCount, rows) => {
                    if (rowCount !== 0) {
                        var data = this.getAnalysisCharDataArr(rows);
                        data.forEach(value => { allData.push(value); });
                    }
                    var request2 = new Request(HISTSql, (error, rowCount, rows) => {
                        if (rowCount !== 0) {
                            var data = this.getAnalysisCharDataArr(rows);
                            data.forEach(value => { allData.push(value); });
                        }
                        callback(allData);
                        conn.close();
                    });
                    conn.execSql(request2);
                });
                conn.execSql(request1);
            }
        });
    }

    /*END: scorecards - analysis characteristics data dictionary retrieval */
}

const ddSQLDB = new DataDictionarySQLDB();
module.exports = ddSQLDB;