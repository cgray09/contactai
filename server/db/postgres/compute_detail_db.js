var log = require('../../logger')(module);

class DetailsPGDB {

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
        def.id = element.PKEY_ID;
        def.lineNum = element.LINE_NUM;
        def.description = element.DESCRIPTION;
        def.operand1 = element.REF_NAME_1;
        def.operator = element.DELIMITER;
        def.compare = element.COMPARE;
        def.refName2 = element.REF_NAME_2;
        def.connector = element.CONNECTOR;
        def.equals = element.CVALUE;
        def.defName = element.NAME; //points to the parent name

        return def;
    }

    getDefinitionsOB(results) {
        if (Array.isArray(results)) {
            var definitions = [];
            results.forEach(element => {
                definitions.push(this.convertDefinition(element));
            });
            return definitions;
        } else {
            return this.convertDefinition(results);
        }
    }

    getDefinitionsByRef(db, charDefName, page, callback) {
        let table = this.getTable(page);
        db.any('SELECT * FROM ' + table + ' WHERE "NAME" = $1 ORDER BY "LINE_NUM"', charDefName)
            .then((results) => {
                var definitions = this.getDefinitionsOB(results);
                callback(definitions, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createDefinition(db, charDefName, def, page, callback) {
        let table = this.getTable(page);
        log.info('Creating definition...');
        if (def !== null) {
            var data = [
                def.lineNum, def.operand1, def.operator, def.compare, def.refName2,
                def.connector, def.equals, charDefName, def.description];

            var sqlStr =  'INSERT INTO ' + table + ' ("PKEY_ID", "LINE_NUM", ' +
            '"REF_NAME_1", "DELIMITER", "COMPARE", "REF_NAME_2", "CONNECTOR", "CVALUE",' +
            '"NAME", "DESCRIPTION") VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), $1, $2, $3, $4, $5, $6, ' +
            '$7, $8, $9) RETURNING *';

            db.one(sqlStr, data)
                .then((results) => {
                    var addedOP = this.getDefinitionsOB(results);
                    callback(addedOP, null);
                })
                .catch((error) => {
                    console.log("Insert failed");
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    /* used for bulk create - createDS definitions creation */
    createDefinitions(db, defs, page, callback) {
        if (defs !== null && defs.length > 0 ) {
            let table = this.getTable(page);
        
            var sqlStr =  'INSERT INTO ' + table + ' ("PKEY_ID", "LINE_NUM", ' +
            '"REF_NAME_1", "DELIMITER", "COMPARE", "REF_NAME_2", "CONNECTOR", "CVALUE",' +
            '"NAME", "DESCRIPTION") VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), $1, $2, $3, $4, $5, $6, ' +
            '$7, $8, $9) ';

            db.tx(t => {
                const queries = defs.map(def => {
                    var data = [def.lineNum, def.operand1, def.operator, def.compare, def.refName2,
                        def.connector, def.equals, def.defName, def.description];
                    return t.none(sqlStr, data);
                });                
                return t.batch(queries);
            })
                .then((results) => {
                    callback(null, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteDefinitionsByRef(db, charDefName, page, callback) {
        let table = this.getTable(page);
        log.info('Deleting definitions associated with characteristic:' + charDefName);
        db.any('DELETE FROM ' + table + ' WHERE "NAME" = $1 RETURNING *', charDefName)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    updateLineNumOnDel(db, charDefName, def, page, callback) {
        let table = this.getTable(page);
        log.info('Updating definitions lineNum...');
        if (def !== null) {
            var data = [charDefName, def.lineNum];
            db.any('UPDATE ' + table + ' SET "LINE_NUM" = "LINE_NUM" - 1 WHERE "NAME" = $1 ' +
                'AND "LINE_NUM" >= $2 RETURNING *', data)
                .then((results) => {
                    var updatedOPs = this.getDefinitionsOB(results);
                    callback(updatedOPs, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }
}

var detailsPGDB = new DetailsPGDB();
module.exports = detailsPGDB;