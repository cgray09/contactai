var log = require('../../logger')(module);

class DefinitionsODB {

    //--------------------------------------------------------- CALL RESULT -> STANDARDIZE DATA -> DEFINITIONS -------------------------------------------------------------
    
    convertDefinition(element) {
        var def = {};
        def.id = element[0];
        def.compare = element[1];
        def.connector = element[2];
        def.equals = element[3];
        def.operator = element[4];
        def.description = element[5];
        def.lineNum = element[6];
        def.generateName = element[7];
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

    getDefinitionsByRef(connection, generateName, callback) {
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM GENERATE_DETAIL WHERE NAME = :1 ORDER BY LINE_NUM';
            conn.execute(sqlStr, [generateName], (error, results) => {
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

    createDefinition(connection, def, callback) {
        connection.then((conn) => {
            log.info('Creating definition...');
            if (def !== null) {
                conn.execute('SELECT GENERATE_DETAIL_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        def.id = results.rows[0][0];

                        var sqlStr = 'INSERT INTO GENERATE_DETAIL (PKEY_ID, LINE_NUM, ' +
                            'REF_NAME_1, DELIMITER, COMPARE, REF_NAME_2, CONNECTOR, CVALUE, ' +
                            'NAME, DESCRIPTION) VALUES (:1, :2, :3, :4, :5, :6, ' +
                            ':7, :8, :9, :10)';

                        var bind = [
                            def.id, def.lineNum, def.operand1, def.operator, def.compare, def.refName2, 
                            def.connector, def.equals, def.generateName, def.description];

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

    deleteDefinitionsByRef(connection, generateName, callback) {
        connection.then((conn) => {
            log.info('Deleting definitions associated with variable: ' + generateName);
            var sqlStr = 'DELETE FROM GENERATE_DETAIL WHERE NAME = :1';
            conn.execute(sqlStr, [generateName], { autoCommit: true }, (error, results) => {
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
var definitionsODB = new DefinitionsODB();
module.exports = definitionsODB;