var log = require('../../logger')(module);

class DefinitionsPGDB {

    //--------------------------------------------------------- CALL RESULT -> STANDARDIZE DATA -> DEFINITIONS -------------------------------------------------------------

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
        def.generateName = element.NAME; //points to the parent variable name

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

    getDefinitionsByRef(db, generateName, callback) {
        db.any('SELECT * FROM GENERATE_DETAIL WHERE "NAME" = $1 ORDER BY "LINE_NUM"', generateName)
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
        log.info('Creating definition...');
        if (def !== null) {
            var data = [
                def.lineNum, def.operand1, def.operator, def.compare, def.refName2,
                def.connector, def.equals, def.generateName, def.description];

            var sqlStr =  'INSERT INTO GENERATE_DETAIL ("PKEY_ID", "LINE_NUM", ' +
            '"REF_NAME_1", "DELIMITER", "COMPARE", "REF_NAME_2", "CONNECTOR", "CVALUE",' +
            '"NAME", "DESCRIPTION") VALUES (NEXTVAL(\'"GENERATE_DETAIL_SEQ"\'), $1, $2, $3, $4, $5, $6, ' +
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

    deleteDefinitionsByRef(db, generateName, callback) {
        log.info('Deleting definitions associated with variable:' + generateName);
        db.any('DELETE FROM GENERATE_DETAIL WHERE "NAME" = $1 RETURNING *', generateName)
            .then((results) => {
                callback(null, null);
            })
            .catch((error) => {
                log.error("ERROR:" + JSON.stringify(error));
                callback(null, error);
            });
    }
    
}

var definitionsPGDB = new DefinitionsPGDB();
module.exports = definitionsPGDB;