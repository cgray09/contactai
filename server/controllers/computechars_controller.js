var computeCharServc = require('../services/computechars_service');
var subProcSrvc = require('../services/compute_subproc_service');
var detailSrvc = require('../services/compute_detail_service');
var discretizeSrvc = require('../services/compute_discretize_service');
const validator = require('../routes/validator');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);
const SUBPROC_TYPES = ['AVERAGE', 'RATIO', 'ROUND', 'EVAL', 'SUM', 'COUNT_OF', 'VALUE_OF', 'DAYS_SINCE'];

class CharacteristicController {

    lookupCharacteristic(req, res, next) {
        var characteristicId = req.params.id;
        var page = req.params.page;
        var lockId = characteristicId.toString() + page;
        var loggedInUser = req.session.user.name;

        var characteristicLocks = new Map();
        if (req.app.get('characteristicLocks') !== undefined) {
            characteristicLocks = req.app.get('characteristicLocks');
        }

        var connection = req.app.get('connection');

        computeCharServc.getCharacteristic(connection, req.session.dbConfig, characteristicId, page, (characteristic, error) => {
            if (characteristic === null) {
                log.info('Characteristic does not exists with id:' + characteristicId);
                res.statusCode = 404;
                return res.json({ errors: ['Characteristic does not exists with id:' + characteristicId] });
            }
            if (error) {
                log.info('Failed to get characteristic with id: ' + characteristicId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get characteristic with id: ' + characteristicId] });
            }

            if (characteristicLocks.get(lockId) !== undefined) {
                if (characteristicLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on characteristic :' + characteristicId + '. Locked by another user :' + characteristicLocks.get(lockId));
                    return res.json({ errors: ['Characteristic is locked by another user. Cannot obtain lock.'] });
                }
                if (characteristicLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for characteristic:' + characteristicId + ' by user :' + loggedInUser);
                }
            } else {
                characteristicLocks.set(lockId, loggedInUser);
                req.app.set('characteristicLocks', characteristicLocks);
                log.debug('Acquired lock for characteristic :' + characteristicId + ' by user :' + loggedInUser);
            }

            req.characteristic = characteristic;
            next();
        });
    }

    lookupDefinitionsForCopy(req, res, next) {
        var connection = req.app.get('connection');
        if (SUBPROC_TYPES.indexOf(req.characteristic.type) !== -1) {
            subProcSrvc.getDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
                req.dbDefs = defs;
                next();
            });
        } else if (req.characteristic.type === 'DETAIL') {
            detailSrvc.getDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
                req.dbDefs = defs;
                next();
            });
        } else if (req.characteristic.type === 'DISCRETIZE') {
            discretizeSrvc.getDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
                req.dbDefs = defs;
                next();
            });
        } else {
            next();
        }
    }

    validateCharacteristic(req, res, next) {
        const errors = validationResult(req).errors;
        const page = req.params.page;
        if (req.characteristic && req.body.id && (req.characteristic.id !== req.body.id)) {
            errors.push({ msg: 'Characteristic id mismatch within request body and param' });
        }

        if ((page === 'SUMMARIZATION' && validator.SUMMCharTypes.indexOf(req.body.type) === -1) ||
            (page === 'DOWNLOAD' && validator.DLCharTypes.indexOf(req.body.type) === -1)) {
            errors.push({ msg: 'Characteristic type value Invalid/NotSupported' });
        }

        if (req.characteristic && req.characteristic.name !== req.body.name) {
            req.nameChange = true;  // this will be used to check if we need to drop and recreate definitions with new name
            req.oldCharDefName = req.characteristic.defName;
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
        log.info('Characteristics validation complete');
        req.characteristic = req.body;
        next();
    }

    getCharacteristics(req, res) {
        var connection = req.app.get('connection');
        computeCharServc.getCharacteristics(connection, req.session.dbConfig, req.params.page, (characteristics, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(characteristics);
        });
    }

    getCharacteristic(req, res) {
        req.characteristic.definitions = req.dbDefs;
        res.json(req.characteristic);
    }

    createCharacteristic(req, res) {
        var connection = req.app.get('connection');
        computeCharServc.createCharacteristic(connection, req.session.dbConfig, req.characteristic, req.params.page, (characteristic, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Characteristic created successfully with name :' + req.characteristic.name);
            return res.status(201).json({ success: true, message: 'Create successful', characteristic: characteristic });
        });
    }

    updateCharacteristic(req, res) {
        const page = req.params.page;
        var connection = req.app.get('connection');
        var lockId = req.characteristic.id.toString() + page;
        var loggedInUser = req.session.user.name;
        var characteristicLocks = req.app.get('characteristicLocks');

        computeCharServc.updateCharacteristic(connection, req.session.dbConfig, req.characteristic, page, (characteristic, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Characteristic updated successfully with id :' + req.characteristic.id);

            let service = null;
            let isArrayDef = false;
            switch (req.characteristic.type.toUpperCase()) {
                case "DETAIL": service = detailSrvc; isArrayDef = true; break;
                case "DISCRETIZE": service = discretizeSrvc; isArrayDef = true; break;
                default: service = subProcSrvc; isArrayDef = false; break;
            }
            
            if (req.nameChange && ((req.dbDefs && !isArrayDef) || (req.dbDefs && isArrayDef && req.dbDefs.length > 0))) {

                service.deleteDefinitionsByRef(connection, req.session.dbConfig, req.oldCharDefName, page, (defs, error) => {
                    if (error) {
                        log.error('Failed to delete existing defintions with defName:' + req.characteristic.defName);
                    }
                    var errors = [];
                    var i = 0;
                    const defName = (page === 'SUMMARIZATION') ? 'ML_act_summary' : 'DL_chars';
                    const newCharDefName = req.characteristic.name + '-' + defName;

                    if (isArrayDef) {
                        const recursiveDef = function (def) { //recreate new definitions
                            def.defName = newCharDefName;
                            service.createDefinitionPromise(connection, req.session.dbConfig, newCharDefName, def, page)
                                .then((createdDef) => {
                                    i++;
                                    if (i < req.dbDefs.length) {
                                        return recursiveDef(req.dbDefs[i]);
                                    } else {
                                        log.info('ComputChar definitions recreated successfully');
                                        characteristicLocks.delete(lockId);
                                        req.app.set('characteristicLocks', characteristicLocks);
                                        log.debug('Released lock for characteristic :' + lockId + ' by user :' + loggedInUser);
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
                                            characteristicLocks.delete(lockId);
                                            req.app.set('characteristicLocks', characteristicLocks);
                                            log.debug('Released lock for characteristic :' + lockId + ' by user :' + loggedInUser);
                                            return res.status(200).json({ success: true, message: 'Update successful' });
                                        }
                                    }
                                });
                        };
                        return recursiveDef(req.dbDefs[0]);
                   
                    } else {
                        req.dbDefs.defName = newCharDefName;
                        service.createDefinition(connection, req.session.dbConfig, newCharDefName, req.dbDefs, page, (dbDef, error) => {
                            if (error) {
                                log.error('Failed recreating 1 or more definitions :' + JSON.stringify(errors));
                            }
                            characteristicLocks.delete(lockId);
                            req.app.set('characteristicLocks', characteristicLocks);
                            log.debug('Released lock for characteristic :' + lockId + ' by user :' + loggedInUser);
                            return res.status(200).json({ success: true, message: 'Update successful' });
                        });
                    }
                });
            } else {
                characteristicLocks.delete(lockId);
                req.app.set('characteristicLocks', characteristicLocks);
                log.debug('Released lock for characteristic :' + lockId + ' by user :' + loggedInUser);

                return res.status(200).json({ success: true, message: 'Update successful' });
            }
        });
    }

    deleteCharacteristic(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.characteristic.id.toString() + req.params.page;
        var loggedInUser = req.session.user.name;
        var characteristicLocks = req.app.get('characteristicLocks');

        var service = null;
        switch (req.characteristic.type.toUpperCase()) {
            case "DETAIL": service = detailSrvc; break;
            case "DISCRETIZE": service = discretizeSrvc; break;
            default: service = subProcSrvc; break;
        }

        service.deleteDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (defs, error) => {
            if (error) { /* do nothing*/ }
            else {
                log.info('Linked definitions deleted successfully');
            }
            computeCharServc.deleteCharacteristic(connection, req.session.dbConfig, req.characteristic, req.params.page, (characteristic, error) => {
                if (error) {
                    return res.status(500).json(error);
                } else {
                    computeCharServc.updateLineNumOnDel(connection, req.session.dbConfig, req.characteristic, req.params.page, (characteristic, error) => {
                        if (error) {
                            log.info('Updating line number for characteristics failed');
                        }
                        log.info('Characteristic deleted successfully with id :' + req.characteristic.id);

                        characteristicLocks.delete(lockId);
                        req.app.set('characteristicLocks', characteristicLocks);
                        log.debug('Released lock for characteristic :' + lockId + ' by user :' + loggedInUser);

                        return res.status(200).json({ success: true, message: 'Delete successful' });
                    });
                }
            });
        });
    }

    releaseLock(req, res) {
        var lockId = req.characteristic.id.toString() + req.params.page;
        var loggedInUser = req.session.user.name;
        var characteristicLocks = req.app.get('characteristicLocks');

        if (characteristicLocks.get(lockId) !== undefined && characteristicLocks.get(lockId) === loggedInUser) {
            characteristicLocks.delete(lockId);
            req.app.set('characteristicLocks', characteristicLocks);
            log.debug('Released lock for characteristic :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on characteristic id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    copyCharacteristic(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        var connection = req.app.get('connection');
        req.characteristic.definitions = req.dbDefs;

        var lockId = req.characteristic.id.toString() + req.params.page;
        var characteristicLocks = req.app.get('characteristicLocks');
        characteristicLocks.delete(lockId);
        req.app.set('characteristicLocks', characteristicLocks);
        log.debug('Released lock for characteristic :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of characteristic :' + req.characteristic.id);

        var copyCharacteristic = req.characteristic;
        copyCharacteristic.name = req.body.name;

        computeCharServc.createCharacteristic(connection, req.session.dbConfig, copyCharacteristic, req.params.page, (newCharacteristic, error) => {
            if (error) {
                log.error('Failed creating copy of characteristic :' + req.characteristic.id);
                return res.status(500).json(error);
            }
            if (!copyCharacteristic.definitions || copyCharacteristic.definitions.length < 1) {
                return res.status(201).json({ success: true, message: 'Create copy successful', copyCharacteristic: newCharacteristic });

            }
            else {
                //defintions exist, identify the type of definition service to invoke
                var service = null;
                switch (copyCharacteristic.type.toUpperCase()) {
                    case "DETAIL": service = detailSrvc; break;
                    case "DISCRETIZE": service = discretizeSrvc; break;
                    default: service = subProcSrvc; break;
                }

                var errors = [];
                var i = 0;
                var charDefName = newCharacteristic.name + '-' + newCharacteristic.defName;
                const recursiveDef = function (def) {

                    service.createDefinitionPromise(connection, req.session.dbConfig, charDefName, def, req.params.page)
                        .then((createdDef) => {
                            i++;
                            if (i < copyCharacteristic.definitions.length) {
                                return recursiveDef(copyCharacteristic.definitions[i]);
                            } else {
                                log.info('Copy characteristic definitions created successfully');
                                service.getDefinitionsByRef(connection, req.session.dbConfig, charDefName, req.params.page, (dbDefs, err) => {
                                    if (err) {
                                        return res.status(500).json(error);
                                    } else {
                                        newCharacteristic.definitions = dbDefs;
                                        return res.status(201).json({ success: true, message: 'Create successful', copyCharacteristic: newCharacteristic });
                                    }
                                });
                            }
                        }).catch(error => {
                            errors.push(error);
                            i++;
                            if (i < copyCharacteristic.definitions.length) {
                                return recursiveDef(copyCharacteristic.definitions[i]);
                            } else if (errors.length > 0) {
                                log.info('Failed creating 1 or more copy characteristic definitions/corresponding operation :' + JSON.stringify(errors));
                                return res.status(500).json(errors);
                            }

                        });
                };
                return recursiveDef(copyCharacteristic.definitions[0]);
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
            computeCharServc.resetOrder(connection, req.session.dbConfig, req.characteristic, req.body.order, req.params.page, (characteristic, error) => {
                if (error) {
                    log.info('Failed reset of characteristics order');
                    return res.status(500).json(error);
                } else {
                    log.info('Characteristics order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order sucessful' });
                }
            });
        }
    }
}

const characteristicsCntrl = new CharacteristicController();
module.exports = characteristicsCntrl;