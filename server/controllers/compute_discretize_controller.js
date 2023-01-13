var discretizeServc = require('../services/compute_discretize_service');
const computeCharServc = require('../services/computechars_service');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);
var HashMap = require('hashmap');

class DiscretizeController {

    lookupDefinitions(req, res, next) {
        var connection = req.app.get('connection');
        discretizeServc.getDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
            if (defs === null || defs.length <= 0) {
                log.info('Definitions does not exists for characteristic :' + req.characteristic.name);
                res.statusCode = 404;
                return res.json({ errors: ['Definitions does not exists for characteristic :' + req.characteristic.name] });
            }
            else if (error) {
                log.info('Failed to get definitions for characteristic id :' + req.characteristic.name);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get definitions for characteristic :' + req.characteristic.name] });
            }
            else {
                req.dbDefs = defs;
                next();
            }
        });
    }

    validateDefinitions(req, res, next) {
        const errors = validationResult(req).errors;
        var defs = req.body;
        
        // loop thru definitions and verify operand1 is same value for all
        let operand1 = (defs && defs.length>0) ? defs[0].operand1 : null;
        Promise.all(defs.map(def => {
            if(!def.lineNum || isNaN(def.lineNum)) {
                errors.push({ msg: 'LineNum must be a valid Number'});
            }            
            if(def.operand1 && def.operand1 !== operand1) {
                errors.push({msg: 'Operand1 must be same value for all defs'});
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
            log.info(" Computechar definition validation complete");
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
            discretizeServc.createDefinitionPromise(connection, req.session.dbConfig, req.characteristic.defName, def, req.params.page)
                .then((createdDef) => {
                    i++;
                    if (i < req.defs.length) {
                        return recursiveDef(req.defs[i]);
                    } else {
                        log.info('Definitions created successfully');
                        
                        if (def.operand1 !== req.characteristic.inputChar) { //operand1 changed for defs, update inputchar
                            req.characteristic.inputChar = def.operand1;
                            computeCharServc.updateInputChar(connection, req.session.dbConfig, req.characteristic, req.params.page, (char, err) => {
                                if(err) { log.error('Failed updating inputChar for characteristic with id:' + req.characteristic.id); }                                
                                
                                log.info('Characteristic inputchar updated successfully');
                                discretizeServc.getDefinitionsByRef(connection, req.session.dbConfig,  req.characteristic.defName, req.params.page, (dbDefs, err) => {
                                    if (err) {
                                        return res.status(500).json(error);
                                    } else {
                                        req.dbDefs = dbDefs;
                                        return res.status(201).json({ success: true, message: 'Create successful', definitions: req.dbDefs });
                                    }
                                });
                            });
                        } else {
                            discretizeServc.getDefinitionsByRef(connection, req.session.dbConfig,  req.characteristic.defName, req.params.page, (dbDefs, err) => {
                                if (err) {
                                    return res.status(500).json(error);
                                } else {
                                    req.dbDefs = dbDefs;
                                    return res.status(201).json({ success: true, message: 'Create successful', definitions: req.dbDefs });
                                }
                            });
                        }                       
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
        if (req.defs.length > 0) {
            return recursiveDef(req.defs[0]);
        } else {
            return res.status(200).json({ success: true, message: 'Delete successful' });
        }
    }

    deleteDefs(req, res, next) {
        var connection = req.app.get('connection');
        discretizeServc.deleteDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
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
        log.info('Definitions deleted successfully with characteristic id :' + req.characteristic.id);
        return res.status(200).json({ success: true, message: 'Delete successful' });
    }

}

var discretizeController = new DiscretizeController();
module.exports = discretizeController;