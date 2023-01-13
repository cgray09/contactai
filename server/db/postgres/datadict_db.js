var log = require('../../logger')(module);

//scorecards - analysis characteristics data dict SQL's
const SAKSql = 'SELECT "REF_NAME", "DB_TYPE", "DESCRIPTION", \'SAK\' as "SOURCE" FROM SCORE_ACCTS_KEEPS_PARM WHERE "REF_NAME" NOT LIKE \'%INDEX%\' ORDER BY "REF_NAME" ASC';
const HISTSql = 'SELECT "REF_NAME", \'NUMERIC\' as "DB_TYPE", "DESCRIPTION", \'SUMMARIZATION\' as "SOURCE" FROM HISTORY_GENERATE_2 WHERE "SUBPROC" NOT IN (\'DETAIL\') ORDER BY "REF_NAME" ASC';

class DataDictionaryPGDB {

    /*START: Data dictionary variables retrieval based on table name*/

    getDataDictionaryVariables(db, table, callback) {
        if (table && table !== "") {
            var sqlStr = 'SELECT DISTINCT("REF_NAME") FROM ' + table + ' WHERE "LINE_NUM" > 0 ORDER BY "REF_NAME"';
                    
        db.any(sqlStr)
            .then((results) => {
                var data = [];
                if (Array.isArray(results)) {
                    results.forEach(row => {
                        data.push(row.REF_NAME);
                    });
                } else {
                    data.push(results.REF_NAME);
                }    
                callback(data, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
        }
        else {
            callback([], null);
        }    
    }
    
    /*END: Data dictionary variables retrieval  based on table name*/


    /*START: scorecards - analysis characteristics data dictionary retrieval */

    getAnalysisCharDataArr(results) {
        var data = [];
        if (Array.isArray(results)) {
            results.forEach(element => {
                var field = {}; 
                field.name = element.REF_NAME; 
                field.type = element.DB_TYPE;
                field.description = element.DESCRIPTION;
                field.source = element.SOURCE;
                data.push(field);
            });
            return data;
        } else {
            var field = {}; 
            field.name = results.REF_NAME; 
            field.type = results.DB_TYPE;
            field.description = results.DESCRIPTION;
            field.source = results.SOURCE;
            data.push(field);
            return data.push(field);
        }
    }

    getAnalysisCharData(db, callback) {
        var allData = [];
        db.any(SAKSql)
            .then((results) => {
                var data = this.getAnalysisCharDataArr(results);
                data.forEach(value => { allData.push(value); });
            })
            .finally(() => {
                db.any(HISTSql)
                    .then((results) => {
                        var data = this.getAnalysisCharDataArr(results);
                        data.forEach(value => { allData.push(value); });
                    })
                    .finally(() => {
                        callback(allData);
                    });
            });
    }

    /*END: scorecards - analysis characteristics data dictionary retrieval */
}

const ddPGDB = new DataDictionaryPGDB();
module.exports = ddPGDB;