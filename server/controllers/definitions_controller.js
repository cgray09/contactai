var defServc = require('../services/definition_service');
const { validationResult } = require('express-validator');
const validator = require('../routes/validator');
var log = require('../logger')(module);
var HashMap = require('hashmap');

class DefinitionsController {

    //----------------------------- CALL RESULT -> STANDARDIZE DATA -> DEFINITIONS -------------------------------------------------------------
    lookupDefinitions(req, res, next) {
        var connection = req.app.get('connection');
        let varReference = req.variable.name + "-" + req.variable.generateName;
        defServc.getDefinitionsByRef(connection, req.session.dbConfig, varReference, (defs, error) => {
            if (defs === null || defs.length <= 0) {
                log.info('Definitions does not exists for variable :' + req.variable.name);
                res.statusCode = 404;
                return res.json({ errors: ['Definitions does not exists for variable :' + req.variable.name] });
            }
            else if (error) {
                log.info('Failed to get definitions for variable id :' + req.variable.name);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get definitions for variable :' + req.variable.name] });
            }
            else {
                req.dbDefs = defs;
                next();
            }
        });
    }

    lookupDefinitionsForCopy(req, res, next) {
        var connection = req.app.get('connection');
        let varReference = req.variable.name + "-" + req.variable.generateName;
        defServc.getDefinitionsByRef(connection, req.session.dbConfig, varReference, (defs, error) => {
            req.dbDefs = defs;
            next();
        });
    }

    validateDefinitions(req, res, next) {
        const errors = validationResult(req).errors;
        var defs = req.body;
        Promise.all(defs.map(def => {
            if(!def.lineNum || isNaN(def.lineNum)) {
                errors.push({ msg: 'LineNum must be a valid Number'});
            }
            if(!def.connector ||
                (def.connector && validator.defConnectors.indexOf(def.connector) === -1)) {
                errors.push({ msg: 'Connector invalid value set'});
            }
            return def; 
        })).then(defs => {
            if (errors.length > 0) {
                var response = { errors: [] };
                errors.forEach((err) => {
                    response.errors.push(err.msg);
                });
                return res.status(400).json(response);
            }
            log.info(" Callresult definition validation complete");
            req.defs = defs;
            next();
        });
    }

    getDefinitions(req, res) {
        res.status(200).json(req.dbDefs);
    }

    createDefinitions(req, res) {
        var connection = req.app.get('connection');

        var errors = [];
        var i = 0;
        const recursiveDef = function (def) {
            def.generateName = req.variable.name + "-" + req.variable.generateName;
            defServc.createDefinitionPromise(connection, req.session.dbConfig, def)
                .then((createdDef) => {
                    i++;
                    if (i < req.defs.length) {
                        return recursiveDef(req.defs[i]);
                    } else {
                        log.info('Definitions created successfully');
                        defServc.getDefinitionsByRef(connection, req.session.dbConfig, def.generateName, (dbDefs, err) => {
                            if (err) {
                                return res.status(500).json(error);
                            } else {
                                req.dbDefs = dbDefs;
                                return res.status(201).json({ success: true, message: 'Create successful', definitions: req.dbDefs });
                            }
                        });
                    }
                }).catch(error => {
                    errors.push(error);
                    i++;
                    if (i < req.defs.length) {
                        return recursiveDef(req.defs[i]);
                    } else {
                        if (errors.length > 0) {
                            log.info('Failed creating 1 or more definitions/corresponding operation :' + JSON.stringify(errors));
                            return res.status(500).json(errors);
                        }
                    }
                });
        };
        return recursiveDef(req.defs[0]);
    }

    deleteDefs(req, res, next) {
        var connection = req.app.get('connection');
        let varReference = req.variable.name + "-" + req.variable.generateName;
        defServc.deleteDefinitionsByRef(connection, req.session.dbConfig, varReference, (defs, error) => {
            if (error) {
                log.info('Failed to delete existing defintions');
                return res.status(500).json(error);
            }
            else {
                next();
            }
        });
    }
  
    deleteDefinitions(req, res) {
        log.info('Definitions deleted successfully with variable id :' + req.variable.id);
        return res.status(200).json({ success: true, message: 'Delete successful' })
    }
}

const defController = new DefinitionsController();
module.exports = defController;