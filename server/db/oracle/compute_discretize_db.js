var log = require('../../logger')(module);

class DiscretizePGDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "HISTORY_DISCRETIZE";
            case "DOWNLOAD": return "DL_DISCRETIZE";
            default: return "";
        }
    }
    
    convertDefinition(element) {
        var def = {};
        def.id = element[0];
        def.asgValue = element[1];
        def.description = element[2];
        def.lineNum = element[3];
        def.operand2 = element[4];
        def.defName= element[5];

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
                            def.id, def.lineNum, def.asgValue, def.description, def.operand2, charDefName];

                        var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, ' +
                            'ASG_VALUE, DESCRIPTION, LOWER_BOUND, NAME) VALUES (:1, :2, :3, :4, :5, :6)';

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
var discretizePGDB = new DiscretizePGDB();
module.exports = discretizePGDB;