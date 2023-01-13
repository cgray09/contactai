var log = require('../../logger')(module);

class SubprocPGDB {

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
        def.id = element.PKEY_ID;
        def.actChar = element.ACT_CHAR;
        def.anchor = element.ANCHOR;
        def.connector = element.BOOL_CONN;
        def.delim1 = element.DELIM_1;
        def.delim2 = element.DELIM_2;
        def.event1 = element.EVENT_1;
        def.event2 = element.EVENT_2;
        def.range = element.RANGE;
        def.value1 = element.VALUE_1;
        def.value2 = element.VALUE_2;
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

    getDefinitionByRef(db, charDefName, page, callback) {
        let table = this.getTable(page);
        db.one('SELECT * FROM ' + table + ' WHERE "NAME" = $1', charDefName)
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
            var data = [def.actChar, def.anchor, def.connector, def.delim1, def.delim2, 
                def.event1, def.event2, def.range, def.value1, def.value2, charDefName];

            var sqlStr =  'INSERT INTO ' + table + ' ("PKEY_ID", "ACT_CHAR", "ANCHOR", "BOOL_CONN", "DELIM_1", ' +
            '"DELIM_2", "EVENT_1", "EVENT_2", "RANGE", "VALUE_1", "VALUE_2", "NAME") ' +
            'VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
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

    updateDefinition(db, def, page, callback) {
        let table = this.getTable(page);
        log.info('Updating definition with id:' + def.id);
        if (def !== null) {
            var data = [def.actChar, def.anchor, def.connector, def.delim1,  
                def.delim2, def.event1, def.event2, def.range, def.value1, def.value2, def.id];

            db.one('UPDATE ' + table + ' SET "ACT_CHAR" = $1, "ANCHOR" = $2, "BOOL_CONN" = $3, "DELIM_1" = $4, "DELIM_2" = $5, ' + 
                '"EVENT_1" = $6, "EVENT_2" = $7, "RANGE" = $8, "VALUE_1" = $9, "VALUE_2" = $10 ' +
                'WHERE "PKEY_ID" = $11 RETURNING *', data)
                .then((results) => {
                    var updatedDef = this.getDefinitionsOB(results);
                    callback(updatedDef, null);
                })
                .catch((error) => {
                    log.error("ERROR:" + JSON.stringify(error));
                    callback(null, error);
                });
        }
    }

    deleteDefinitionByRef(db, charDefName, page, callback) {
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
    
}

var subprocPGDB = new SubprocPGDB();
module.exports = subprocPGDB;