var log = require('../../logger')(module);

class ExclusionsPGDB {

    getTable(screen){
        if(!screen) return "";
        switch(screen.toUpperCase()){
            case "CALLRESULT": return "ACTIVITY_INCLUDE";
            case "DOWNLOAD": return "DL_INCLUDE";
            case "SCORECARDS": return "DEV_SAMPLE2";
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
        def.equals = element.INCVALUE;

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

    getDefinitions(db, page, callback) {
        var table = this.getTable(page);
        db.any('SELECT * FROM ' + table + ' ORDER BY "LINE_NUM"')
            .then((results) => {
                var definitions = this.getDefinitionsOB(results);
                callback(definitions, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }

    createDefinition(db, def, page, callback) {
        log.info('Creating exclusion definitions for ' + page);
        var table = this.getTable(page);
        if (def !== null) {
            var data = [
                def.lineNum, def.operand1, def.operator, def.compare, def.refName2,
                def.connector, def.equals, def.description];

            var sqlStr =  'INSERT INTO ' + table + ' ("PKEY_ID", "LINE_NUM", "REF_NAME_1", ' +
            '"DELIMITER", "COMPARE", "REF_NAME_2", "CONNECTOR", "INCVALUE", "DESCRIPTION")' +
            'VALUES (NEXTVAL(\'"' + table + '_SEQ"\'), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';

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

    deleteDefinitions(db, page, callback) {
        log.info('Deleting exclusion definitions for ' + page);
        var table = this.getTable(page);
        db.any('TRUNCATE TABLE ' + table)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }
}

var exclusionsPGDB = new ExclusionsPGDB();
module.exports = exclusionsPGDB;