var log = require('../../logger')(module);

class DetailsODB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "HISTORY_DETAIL";
            case "DOWNLOAD": return "DL_DETAIL";
            default: return "";
        }
    }

    convertDefinition(element) {
        var def = {};
        def.id = element[0];
        def.compare = element[1];
        def.connector = element[2];
        def.equals = element[3];
        def.operator = element[4];
        def.description = element[5];
        def.lineNum = element[6];
        def.defName = element[7];
        def.operand1 = element[9];
        def.refName2 = element[10];

        return def;
    }

    getDefinitionsOB(rows) {
        if (Array.isArray(rows)) {
            var definitions = [];
            rows.forEach(row => {
                definitions.push(this.convertDefinition(row));
            });
            return definitions;
        }
    }

    getDefinitionsByRef(connection, charDefName, page, callback) {
        let table = this.getTable(page);
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM ' + table + ' WHERE NAME = :1 ORDER BY LINE_NUM';
            conn.execute(sqlStr, [charDefName], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var definitions = this.getDefinitionsOB(results.rows);
                    callback(definitions, null);
                }
            });
        });
    }

    createDefinition(connection, charDefName, def, page, callback) {
        let table = this.getTable(page);
        connection.then((conn) => {
            log.info('Creating definition...');
            if (def !== null) {
                conn.execute('SELECT ' + table + '_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        def.id = results.rows[0][0];
                        
                        var bind = [
                            def.id, def.lineNum, def.operand1, def.operator, def.compare, def.refName2, 
                            def.connector, def.equals, charDefName, def.description];

                        var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, ' +
                            'REF_NAME_1, DELIMITER, COMPARE, REF_NAME_2, CONNECTOR, CVALUE,' +
                            'NAME, DESCRIPTION) VALUES (:1, :2, :3, :4, :5, :6, ' +
                            ':7, :8, :9, :10)';

                        conn.execute(sqlStr, bind, { autoCommit: true }, (error, results) => {
                            if (error) {
                                log.error("ERROR:" + JSON.stringify(error));
                                callback(null, error);

                            } else {
                                callback(def, null);
                            }
                        });
                    }
                });
            }
        });
    }

    /* used for bulk create - createDS definitions creation */
    createDefinitions(connection, defs, page, callback) {
        if (defs !== null && defs.length > 0) {
            let table = this.getTable(page);
            connection.then((conn) => {

                var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, ' +
                    'REF_NAME_1, DELIMITER, COMPARE, REF_NAME_2, CONNECTOR, CVALUE,' +
                    'NAME, DESCRIPTION) VALUES (' + table + '_SEQ.nextval, :1, :2, :3, :4, :5, :6, ' +
                    ':7, :8, :9)';

                const dataBinds = defs.map( def => {
                    var data = [
                        def.lineNum, def.operand1, def.operator, def.compare, def.refName2,
                        def.connector, def.equals, def.defName, def.description];
                    return data;    
                });
                
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

    deleteDefinitionsByRef(connection, charDefName, page, callback) {
        let table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting definitions associated with characteristic: ' + charDefName);
            var sqlStr = 'DELETE FROM ' + table + ' WHERE NAME = :1';
            conn.execute(sqlStr, [charDefName], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(null, null);
                }
            });
        });
    }

    updateLineNumOnDel(connection, charDefName, def, page, callback) {
        let table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating definitions lineNum...');
            if (def !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET LINE_NUM = LINE_NUM - 1 WHERE NAME = :1 ' +
                    'AND LINE_NUM >= :2';
                var bind = [charDefName, def.lineNum]
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
   
}
var detailsODB = new DetailsODB();
module.exports = detailsODB;