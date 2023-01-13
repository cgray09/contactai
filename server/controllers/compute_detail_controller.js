var detailServc = require('../services/compute_detail_service');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);
var HashMap = require('hashmap');

class DetailController {

    lookupDefinitions(req, res, next) {
        var connection = req.app.get('connection');
        detailServc.getDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
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
        
        Promise.all(defs.map(def => {
            if(!def.lineNum || isNaN(def.lineNum)) {
                errors.push({ msg: 'LineNum must be a valid Number'});
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
            detailServc.createDefinitionPromise(connection, req.session.dbConfig, req.characteristic.defName, def, req.params.page)
                .then((createdDef) => {
                    i++;
                    if (i < req.defs.length) {
                        return recursiveDef(req.defs[i]);
                    } else {
                        log.info('Definitions created successfully');
                        detailServc.getDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (dbDefs, err) => {
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
        if (req.defs.length > 0) {
            return recursiveDef(req.defs[0]);
        } else {
            return res.status(200).json({ success: true, message: 'Delete successful' });
        }
    }

    deleteDefs(req, res, next) {
        var connection = req.app.get('connection');
        detailServc.deleteDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
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

var detailController = new DetailController();
module.exports = detailController;