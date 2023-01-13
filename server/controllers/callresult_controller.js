var callResultServc = require('../services/callresult_service');
var defServc = require('../services/definition_service');
var log = require('../logger')(module);
const { validationResult } = require('express-validator');
const { json } = require('express');

class CallResultsController {

    //---------------------------------------------------------- CALL RESULT -> STANDARDIZE DATA --------------------------------------------------------------------------
    lookupVariable(req, res, next) {
        var variableId = req.params.id;
        var lockId = variableId.toString();
        var loggedInUser = req.session.user.name;

        var variableLocks = new Map();
        if (req.app.get('variableLocks') !== undefined) {
            variableLocks = req.app.get('variableLocks');
        }

        var connection = req.app.get('connection');

        callResultServc.getVariable(connection, req.session.dbConfig, variableId, (variable, error) => {
            if (variable === null) {
                log.info('Variable does not exists with id:' + variableId);
                res.statusCode = 404;
                return res.json({ errors: ['Variable does not exists with id:' + variableId] });
            }
            if (error) {
                log.info('Failed to get variable with id: ' + variableId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get variable with id: ' + variableId] });
            }

            if (variableLocks.get(lockId) !== undefined) {
                if (variableLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on variable :' + variableId + '. Locked by another user :' + variableLocks.get(lockId));
                    return res.json({ errors: ['Variable is locked by another user. Cannot obtain lock.'] });
                }
                if (variableLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for variable:' + variableId + ' by user :' + loggedInUser);
                }
            } else {
                variableLocks.set(lockId, loggedInUser);
                req.app.set('variableLocks', variableLocks);
                log.debug('Acquired lock for variable :' + variableId + ' by user :' + loggedInUser);
            }

            req.variable = variable;
            next();
        });
    }

    validateVariable(req, res, next) {
        const errors = validationResult(req).errors;

        if (req.variable && req.body.id && (req.variable.id !== req.body.id)) {
            errors.push({ msg: 'Variable id mismatch within request body and param' });
        }
        if (req.variable && req.variable.name !== req.body.name) {
            req.nameChange = true;  // this will be used to check if we need to drop and recreate definitions with new name
            req.oldVarName = req.variable.name;
        }
        if (req.body.name && req.body.name.length > 0) {
            if (req.body.name.match(/^\d/) || req.body.name.match(/^\s/)) {
                errors.push({ msg: req.body.name + ' Characteristic names cannot start with a digit or space' });
            }
            if (req.body.name.length > 50) {
                errors.push({ msg: req.body.name + 'cannot be longer than 50 characters' });
            }
        }
        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }
        log.info('Variables validation complete');
        req.variable = req.body;
        next();
    }

    getVariables(req, res) {
        var connection = req.app.get('connection');
        callResultServc.getVariables(connection, req.session.dbConfig, (variables, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(variables);
        });
    }

    getVariable(req, res) {
        req.variable.definitions = req.dbDefs;
        res.status(200).json(req.variable);
    }

    createVariable(req, res) {
        var connection = req.app.get('connection');
        req.variable.generateName = "UL_generate";
        callResultServc.createVariable(connection, req.session.dbConfig, req.variable, (variable, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Variable created successfully with name :' + req.variable.name);
            return res.status(201).json({ success: true, message: 'Create successful', variable: variable });
        });
    }

    updateVariable(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.variable.id.toString();
        var loggedInUser = req.session.user.name;
        var variableLocks = req.app.get('variableLocks');

        callResultServc.updateVariable(connection, req.session.dbConfig, req.variable, (variable, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Variable updated successfully with id :' + req.variable.id);
            
            if (req.nameChange && req.dbDefs && req.dbDefs.length > 0) {
                //delete old definitions
                const varReference =  req.oldVarName + "-" + req.variable.generateName;
                defServc.deleteDefinitionsByRef(connection, req.session.dbConfig, varReference, (defs, error) => {
                    if (error) {
                        log.error('Failed to delete existing defintions with refName:' + varReference);
                    } 
                    var errors = [];
                    var i = 0;
                    const recursiveDef = function (def) { //recreate new definitions
                        def.generateName = req.variable.name + "-" + req.variable.generateName;
                        defServc.createDefinitionPromise(connection, req.session.dbConfig, def)
                            .then((createdDef) => {
                                i++;
                                if (i < req.dbDefs.length) {
                                    return recursiveDef(req.dbDefs[i]);
                                } else {
                                    log.info('Variable definitions recreated successfully');
                                    variableLocks.delete(lockId);
                                    req.app.set('variableLocks', variableLocks);
                                    log.debug('Released lock for variable :' + lockId + ' by user :' + loggedInUser);
                                    return res.status(200).json({ success: true, message: 'Update successful' });
                                }
                            }).catch(error => {
                                errors.push(error);
                                i++;
                                if (i < req.dbDefs.length) {
                                    return recursiveDef(req.dbDefs[i]);
                                } else {
                                    if (errors.length > 0) {
                                        log.error('Failed recreating 1 or more definitions :' + JSON.stringify(errors));
                                        variableLocks.delete(lockId);
                                        req.app.set('variableLocks', variableLocks);
                                        log.debug('Released lock for variable :' + lockId + ' by user :' + loggedInUser);
                                        return res.status(200).json({ success: true, message: 'Update successful' });
                                    }
                                }
                            });
                    };
                    return recursiveDef(req.dbDefs[0]);
                });    
                
            } else {
                variableLocks.delete(lockId);
                req.app.set('variableLocks', variableLocks);
                log.debug('Released lock for variable :' + lockId + ' by user :' + loggedInUser);

                return res.status(200).json({ success: true, message: 'Update successful' });
            }
        });
    }

    deleteVariable(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.variable.id.toString();
        var loggedInUser = req.session.user.name;
        var variableLocks = req.app.get('variableLocks');

        let generateName = req.variable.name + "-" + req.variable.generateName
        defServc.deleteDefinitionsByRef(connection, req.session.dbConfig, generateName, (defs, error) => {
            if (error) { /* do nothing */ }
            else {
                log.info('Linked defintions deleted successfully');
            }
            callResultServc.deleteVariable(connection, req.session.dbConfig, req.variable, (variable, error) => {
                if (error) {
                    return res.status(500).json(error);
                } else {
                    callResultServc.updateLineNumOnDel(connection, req.session.dbConfig, req.variable, (variable, error) => {
                        if (error) {
                            log.info('Updating line number for variables failed');
                        }
                        log.info('Variable deleted successfully with id :' + req.variable.id);

                        variableLocks.delete(lockId);
                        req.app.set('variableLocks', variableLocks);
                        log.debug('Released lock for variable :' + lockId + ' by user :' + loggedInUser);

                        return res.status(200).json({ success: true, message: 'Delete successful' });
                    });
                }
            });
        });
    }

    releaseLock(req, res) {
        var lockId = req.variable.id.toString();
        var loggedInUser = req.session.user.name;
        var variableLocks = req.app.get('variableLocks');

        if (variableLocks.get(lockId) !== undefined && variableLocks.get(lockId) === loggedInUser) {
            variableLocks.delete(lockId);
            req.app.set('variableLocks', variableLocks);
            log.debug('Released lock for variable :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on variable id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    copyVariable(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        var connection = req.app.get('connection');
        req.variable.definitions = req.dbDefs;

        var lockId = req.variable.id.toString();
        var variableLocks = req.app.get('variableLocks');
        variableLocks.delete(lockId);
        req.app.set('variableLocks', variableLocks);
        log.debug('Released lock for variable :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of variable :' + req.variable.id);

        var copyVariable = req.variable;
        copyVariable.name = req.body.name;

        callResultServc.createVariable(connection, req.session.dbConfig, copyVariable, (newVariable, error) => {
            if (error) {
                log.error('Failed creating copy of variable :' + req.variable.id);
                return res.status(500).json(error);
            }
            if (!copyVariable.definitions || copyVariable.definitions.length < 1) {
                return res.status(201).json({ success: true, message: 'Create copy successful', copyVariable: newVariable });

            }
            else {
                //defintions exist continue
                var errors = [];
                var i = 0;
                const recursiveDef = function (def) {
                    def.generateName = newVariable.name + "-" + newVariable.generateName;
                    defServc.createDefinitionPromise(connection, req.session.dbConfig, def)
                        .then((createdDef) => {
                            i++;
                            if (i < copyVariable.definitions.length) {
                                return recursiveDef(copyVariable.definitions[i]);
                            } else {
                                log.info('Copy variable definitions created successfully');
                                defServc.getDefinitionsByRef(connection, req.session.dbConfig, def.generateName, (dbDefs, err) => {
                                    if (err) {
                                        return res.status(500).json(error);
                                    } else {
                                        newVariable.definitions = dbDefs;
                                        return res.status(201).json({ success: true, message: 'Create successful', copyVariable: newVariable });
                                    }
                                });
                            }
                        }).catch(error => {
                            errors.push(error);
                            i++;
                            if (i < copyVariable.definitions.length) {
                                return recursiveDef(copyVariable.definitions[i]);
                            } else {
                                if (errors.length > 0) {
                                    log.info('Failed creating 1 or more copy variable definitions/corresponding operation :' + JSON.stringify(errors));
                                    return res.status(500).json(errors);
                                }
                            }
                        });
                };
                return recursiveDef(copyVariable.definitions[0]);
            }
        });
    }

    resetOrder(req, res) {
        var connection = req.app.get('connection');
        var errors = [];
        if (isNaN(req.body.order)) {
            errors.push({ msg: 'order is required and must be a valid number' });
            return res.status(400).json({ errors: errors });
        } else {
            callResultServc.resetOrder(connection, req.session.dbConfig, req.variable, req.body.order, (variable, error) => {
                if (error) {
                    log.info('Failed reset of variables order');
                    return res.status(500).json(error);
                } else {
                    log.info('Variables order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order sucessful' });
                }
            });
        }
    }
}

const variablesCntrl = new CallResultsController();
module.exports = variablesCntrl;