const { json } = require('express');

var log = require('../../logger')(module);

class ExclusionsODB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "CALLRESULT": return "ACTIVITY_INCLUDE";
            case "DOWNLOAD": return "DL_INCLUDE";
            case "SCORECARDS": return "DEV_SAMPLE2";
            default: return "";
        }
    }

    convertDefinition(element, table) {
        var def = {};
        if (table === "DEV_SAMPLE2" || table === "DL_INCLUDE") {
            def.id = element[0];
            def.compare = element[1];
            def.connector = element[2];
            def.operator = element[3];
            def.description = element[4];
            def.equals = element[5];
            def.lineNum = element[6];
            def.operand1 = element[9];
            def.refName2 = element[10];
        } else {
            def.id = element[10];
            def.compare = element[0];
            def.connector = element[1];
            def.operator = element[2];
            def.description = element[3];
            def.equals = element[4];
            def.lineNum = element[5];
            def.operand1 = element[8];
            def.refName2 = element[9];
        }
        return def;
    }

    getDefinitionsOB(rows, table) {
        if (Array.isArray(rows)) {
            var definitions = [];
            rows.forEach(row => {
                definitions.push(this.convertDefinition(row, table));
            });
            return definitions;
        }
    }

    getDefinitions(connection, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            var sqlStr = 'SELECT * FROM ' + table + ' ORDER BY LINE_NUM';
            conn.execute(sqlStr, [], (error, results) => {
                if (error) {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                } else {
                    var definitions = this.getDefinitionsOB(results.rows, table);
                    callback(definitions, null);
                }
            });
        });
    }

    createDefinition(connection, def, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Creating definitions for ' + page);
            if (def !== null) {
                conn.execute('SELECT ' + table + '_SEQ.NEXTVAL FROM DUAL', (error, results) => {
                    if (error) {
                        log.error('Failed to fetch next sequence ' + error);
                    } else {
                        def.id = results.rows[0][0];

                        var sqlStr = 'INSERT INTO ' + table + ' (PKEY_ID, LINE_NUM, ' +
                            'REF_NAME_1, DELIMITER, COMPARE, REF_NAME_2, CONNECTOR, INCVALUE,' +
                            'DESCRIPTION) VALUES (:1, :2, :3, :4, :5, :6, ' +
                            ':7, :8, :9)';

                        var bind = [
                            def.id, def.lineNum, def.operand1, def.operator, def.compare, def.refName2, 
                            def.connector, def.equals, def.description];

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

    deleteDefinitions(connection, page, callback) {
        var table = this.getTable(page);
        connection.then((conn) => {
            log.info('Deleting definitions for ' + page);
            var sqlStr = 'TRUNCATE TABLE ' + table;
            conn.execute(sqlStr, [], { autoCommit: true }, (error, results) => {
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
var exclusionsODB = new ExclusionsODB();
module.exports = exclusionsODB;