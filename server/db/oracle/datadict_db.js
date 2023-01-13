var log = require('../../logger')(module);

//scorecards - analysis characteristics data dict SQL's
const SAKSql = 'SELECT REF_NAME, DB_TYPE, DESCRIPTION, \'SAK\' as SOURCE FROM SCORE_ACCTS_KEEPS_PARM WHERE REF_NAME NOT LIKE \'%INDEX%\' ORDER BY REF_NAME ASC';
const HISTSql = 'SELECT REF_NAME, \'NUMERIC\' as DB_TYPE, DESCRIPTION, \'SUMMARIZATION\' as SOURCE FROM HISTORY_GENERATE_2 WHERE SUBPROC NOT IN (\'DETAIL\') ORDER BY REF_NAME ASC';


class DataDictionaryODB {

    /*START: Data dictionary variables retrieval based on table name*/

    getDataDictionaryVariables(connection, table, callback) {
        if (table && table !== "") {
            connection.then((conn) => {
                var sqlStr = 'SELECT DISTINCT(REF_NAME) FROM ' + table + ' WHERE LINE_NUM > 0 ORDER BY REF_NAME';
                conn.execute(sqlStr, (error, results) => {
                    var data = [];
                    if (results && results.rows) {
                        results.rows.forEach(row => {
                            data.push(row[0]);
                        });
                    }
                    callback(data, null);
                });
            });
        }
        else {
            callback([], null);
        }
    }

    /*END: Data dictionary variables retrieval  based on table name*/


    /*START: scorecards - analysis characteristics data dictionary retrieval */

    getAnalysisCharDataArr(rows) {
        if (Array.isArray(rows)) {
            var data = [];
            rows.forEach(row => {
                var field = {};
                field.name = row[0]; field.type = row[1]; field.description = row[2]; field.source = row[3];
                data.push(field);
            });
            return data;
        }
    }

    getAnalysisCharData(connection, callback) {
        var allData = [];
        connection.then((conn) => {
            conn.execute(SAKSql, (error, results) => {
                if (results) {
                    var data = this.getAnalysisCharDataArr(results.rows);
                    data.forEach(value => { allData.push(value); });
                }
                conn.execute(HISTSql, (error, results) => {
                    if (results) {
                        var data = this.getAnalysisCharDataArr(results.rows);
                        data.forEach(value => { allData.push(value); });
                    }
                    callback(allData, null);
                });
            });
        });
    }

    /*END: scorecards - analysis characteristics data dictionary retrieval */
}


const ddODB = new DataDictionaryODB();
module.exports = ddODB;