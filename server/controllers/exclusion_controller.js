var exclusionServc = require('../services/exclusion_service');
const { validationResult } = require('express-validator');
const validator = require('../routes/validator');
var log = require('../logger')(module);
var HashMap = require('hashmap');

class ExclusionsController {

    lookupDefinitions(req, res, next) {
        var connection = req.app.get('connection');
        var page = req.params.page;
        var lockId = page + '_exclusion';
        var loggedInUser = req.session.user.name;

        var exclusionLocks = new Map();
        if (req.app.get('exclusionLocks') !== undefined) {
            exclusionLocks = req.app.get('exclusionLocks');
        }
        exclusionServc.getDefinitions(connection, req.session.dbConfig, page, (defs, error) => {
            if (defs === null || defs.length <= 0) {
                log.info('Exclusion definitions do not exists for ' + page);
                res.statusCode = 404;
                return res.json({ errors: ['Exclusion definitions do not exists for ' + page] });
            }
            else if (error) {
                log.info('Failed to get exclusion definitions for' + page);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get exclusion definitions for' + page] });
            }
            else {
                req.dbDefs = defs;

                if (exclusionLocks.get(lockId) !== undefined) {
                    if (exclusionLocks.get(lockId) !== loggedInUser) {
                        res.statusCode = 423;
                        log.debug('Cannot obtain lock on exclusions for ' + page + '. Locked by another user :' + exclusionLocks.get(lockId));
                        return res.json({ errors: ['Exclusions is locked by another user. Cannot obtain lock.'] });
                    }
                    if (exclusionLocks.get(lockId) === loggedInUser) {
                        log.debug('Lock already acquired on exclusions for ' + page + ' by user :' + loggedInUser);
                        next();
                    }
                } else {
                    exclusionLocks.set(lockId, loggedInUser);
                    req.app.set('exclusionLocks', exclusionLocks);
                    log.debug('Acquired lock on exclusions for ' + page + ' by user :' + loggedInUser);
                    next();
                } 
            }
        });
    }

    validateDefinitions(req, res, next) {
        const errors = validationResult(req).errors;
        var defs = req.body;
      
        Promise.all(defs.map(def => {            
            if(!def.lineNum || isNaN(def.lineNum)) {
                errors.push({ msg: 'LineNum must be a valid Number' });
            }
            if(!def.equals && req.params.page === 'DOWNLOAD') {
                def.equals = 'INCLUDE';
            }
            else if (validator.INCValues.indexOf(def.equals) === -1) {
                errors.push({ msg: 'equals value is incorrect, must be INCLUDE or EXCLUDE' });
            }
            if(validator.defConnectors.indexOf(def.connector) === -1) {
                errors.push({ msg: 'Connector invalid value set'});
            }    
            return def;
        })).then(x => {
             if (errors.length > 0) {
                var response = { errors: [] };
                errors.forEach((err) => {
                    response.errors.push(err.msg);
                });
                return res.status(400).json(response);
             }
             log.info('Exclusion definitions validation complete');
             req.defs = defs;
             next();
        });
    }

    getDefinitions(req, res) {
        res.status(200).json(req.dbDefs);
    }

    createDefinitions(req, res) {
        var connection = req.app.get('connection');
        var page = req.params.page
        var lockId = page + '_exclusion';
        var loggedInUser = req.session.user.name;
        var exclusionLocks = req.app.get('exclusionLocks');

        var errors = [];
        var i = 0;
        
        const recursiveDef = function (def) {
            exclusionServc.createDefinitionPromise(connection, req.session.dbConfig, def, page)
                .then((createdDef) => {
                    i++;
                    if (i < req.defs.length) {
                        return recursiveDef(req.defs[i]);
                    } else {
                        log.info('Exclusion definitions created successfully');
                        exclusionServc.getDefinitions(connection, req.session.dbConfig, page, (dbDefs, err) => {
                            if (err) {
                                return res.status(500).json(error);
                            } else {
                                req.dbDefs = dbDefs;

                                if (exclusionLocks !== undefined) { //releaseLock only if acquired. lock would be acquired if exclusions pre-existed and 
                                    //this is a PUT operation.
                                    exclusionLocks.delete(lockId);
                                    req.app.set('exclusionLocks', exclusionLocks);
                                    log.debug('Released lock on exclusions for :' + lockId + ' by user :' + loggedInUser);
                                }
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
        var page = req.params.page;
        
        exclusionServc.deleteDefinitions(connection, req.session.dbConfig, page, (defs, error) => {
            if (error) {
                log.info('Failed to delete existing definitions');
                return res.status(500).json(error);
            }
            else {
                next();
            }
        });
    }  

    deleteDefinitions(req, res) {
        var lockId = req.params.page + '_exclusion';
        var loggedInUser = req.session.user.name;
        var exclusionLocks = req.app.get('exclusionLocks');

        exclusionLocks.delete(lockId);
        req.app.set('exclusionLocks', exclusionLocks);
        log.debug('Released lock on exclusions for :' + lockId + ' by user :' + loggedInUser);

        log.info('Exclusion definitions deleted successfully');
        return res.status(200).json({ success: true, message: 'Delete successful' });
    }

    releaseLock(req, res) {
        var lockId = req.params.page + '_exclusion';
        var loggedInUser = req.session.user.name;
        var exclusionLocks = req.app.get('exclusionLocks');

        console.log(exclusionLocks.get(lockId));
        if (exclusionLocks.get(lockId) !== undefined && exclusionLocks.get(lockId) === loggedInUser) {
            exclusionLocks.delete(lockId);
            req.app.set('exclusionLocks', exclusionLocks);
            log.debug('Released lock for exclusions :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on exclusions :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }
}

var exclusionController = new ExclusionsController();
module.exports = exclusionController;