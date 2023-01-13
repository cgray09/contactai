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
        def.id = element.PKEY_ID;
        def.asgValue = element.ASG_VALUE;
        def.description = element.DESCRIPTION;
        def.lineNum = element.LINE_NUM;
        def.operand2 = element.LOWER_BOUND;
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

    createDefinition(db, def, callback) {
        let table = this.getTable(page);
        log.info('Creating definition...');
        if (def !== null) {
            var data = [
                def.lineNum, def.asgValue, def.description, def.operand2, charDefName];

            var sqlStr =  'INSERT INTO ' + table + ' ("PKEY_ID", "LINE_NUM", "ASG_VALUE", "DESCRIPTION", "LOWER_BOUND", "NAME" ' +
            'VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), $1, $2, $3, $4, $5) RETURNING *';

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

var discretizePGDB = new DiscretizePGDB();
module.exports = discretizePGDB;