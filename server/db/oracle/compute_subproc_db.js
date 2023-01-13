var log = require('../../logger')(module);

class SubprocODB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "SUMMARIZATION": return "HISTORY_SUBPROC";
            case "DOWNLOAD": return "DL_SUBPROC";
            default: return "";
        }
    }

    convertDefinition(element) {
        var def = {};
        def.id = element[0];
        def.actChar = element[1];
        def.anchor = element[2];
        def.connector = element[3];
        def.delim1 = element[5];
        def.delim2 = element[6];
        def.event1 = element[8];
        def.event2 = element[9];
        def.range = element[13];
        def.value1 = element[14];
        def.value2 = element[15];
        def.defName = element[11]; 
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

    getDefinitionByRef(connection, charDefName, page, callback) {
        let table = this.getTable(page);
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM ' + table + ' WHERE NAME = :1';
            conn.execute(sqlStr, [charDefName], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    if(results.rows.length === 0) { callback(null, null) }
                    else {
                        var definitions = this.getDefinitionsOB(results.rows);
                        callback(definitions[0], null);
                    }    
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

                        var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, ACT_CHAR, ANCHOR, BOOL_CONN, ' +
                            'DELIM_1, DELIM_2, EVENT_1, EVENT_2, RANGE, VALUE_1, VALUE_2, NAME) ' +
                            'VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12)';

                        var bind = [def.id, def.actChar, def.anchor, def.connector, def.delim1, def.delim2, 
                            def.event1, def.event2, def.range, def.value1, def.value2, charDefName];

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

    updateDefinition(connection, def, page, callback) {
        let table = this.getTable(page);
        connection.then((conn) => {
            log.info('Updating definition with id: ' + def.id);
            if (def !== null) {
                var sqlStr = 'UPDATE ' + table + ' SET ACT_CHAR = :1, ANCHOR = :2, ' +
                    'BOOL_CONN = :3, DELIM_1 = :4, DELIM_2 = :5, EVENT_1 = :6, EVENT_2 = :7, ' +
                    'RANGE = :8, VALUE_1 = :9, VALUE_2 = :10 WHERE PKEY_ID = :11';

                var bind = [def.actChar, def.anchor, def.connector, def.delim1,  
                    def.delim2, def.event1, def.event2, def.range, def.value1, def.value2, def.id];

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

   deleteDefinition(connection, def, page, callback) {
    let table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting definition with id: ' + def.id);
            var sqlStr = 'DELETE FROM ' + table + ' WHERE PKEY_ID = :1';
            conn.execute(sqlStr, [def.id], { autoCommit: true }, (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    callback(def, null);
                }
            });
        });
    }

    deleteDefinitionByRef(connection, charDefName, page, callback) {
        let table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting definitions associated with variable:: ' + charDefName);
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

}
var subprocODB = new SubprocODB();
module.exports = subprocODB;