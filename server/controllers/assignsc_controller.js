var assignSCServc = require('../services/assignsc_service');
var log = require('../logger')(module);
const { validationResult } = require('express-validator');

class AssignSCController {

    lookupAssignSC(req, res, next) {
        var assignSCId = req.params.id;
        var lockId = assignSCId.toString();
        var loggedInUser = req.session.user.name;

        var assignSCLocks = new Map();
        if (req.app.get('assignSCLocks') !== undefined) {
            assignSCLocks = req.app.get('assignSCLocks');
        }

        var connection = req.app.get('connection');

        assignSCServc.getAssignSC(connection, req.session.dbConfig, assignSCId, (assignSC, error) => {
            if (assignSC === null) {
                log.info('AssignSC does not exists with id:' + assignSCId);
                res.statusCode = 404;
                return res.json({ errors: ['AssignSC does not exists with id:' + assignSCId] });
            }
            if (error) {
                log.info('Failed to get AssignSC with id: ' + assignSCId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get AssignSC with id: ' + assignSCId] });
            }

            if (assignSCLocks.get(lockId) !== undefined) {
                if (assignSCLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on AssignSC :' + assignSCId + '. Locked by another user :' + assignSCLocks.get(lockId));
                    return res.json({ errors: ['AssignSC is locked by another user. Cannot obtain lock.'] });
                }
                if (assignSCLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for assignSC:' + assignSCId + ' by user :' + loggedInUser);
                }
            } else {
                assignSCLocks.set(lockId, loggedInUser);
                req.app.set('assignSCLocks', assignSCLocks);
                log.debug('Acquired lock for  assignSC :' + assignSCId + ' by user :' + loggedInUser);
            }

            assignSC.callHistory = (assignSC.callHistory) ? 1 : 0;
            req.assignSC = assignSC;
            next();
        });
    }

    validateAssignSC(req, res, next) {
        const errors = validationResult(req).errors;
         
        if (req.assignSC && req.body.id && (req.assignSC.id !== req.body.id)) {
            errors.push({ msg: 'AssignSC id mismatch within request body and param' });
        }
        
        if (errors.length > 0) {
           return res.status(400).json(errors);
        }
        
        log.info('AssignSC Validation complete');
        req.assignSC = req.body;
        next();
    }

    lookupProperties(req, res, next) {
        var propertyId = req.body.refNameValueId;
        var propertyName = req.body.refName;
        var lockId = propertyName + propertyId.toString();
        var loggedInUser = req.session.user.name;

        var assignSCLocks = new Map();
        if (req.app.get('assignSCLocks') !== undefined) {
            assignSCLocks = req.app.get('assignSCLocks');
        }

        var connection = req.app.get('connection');

        assignSCServc.getAssignSC(connection, req.session.dbConfig, propertyId, (property, error) => {
            if (property === null) {
                log.info('AssignSC property does not exists with id:' + propertyId);
                res.statusCode = 404;
                return res.json({ errors: ['AssignSC property does not exists with id:' + propertyId] });
            }
            if (error) {
                log.info('Failed to get AssignSC property with id: ' + propertyId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get AssignSC property with id: ' + propertyId] });
            }

            if (assignSCLocks.get(lockId) !== undefined) {
                if (assignSCLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on AssignSC property :' + propertyId + '. Locked by another user :' + assignSCLocks.get(lockId));
                    return res.json({ errors: ['AssignSC property is locked by another user. Cannot obtain lock.'] });
                }
                if (assignSCLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for AssignSC property:' + propertyId + ' by user :' + loggedInUser);
                }
            } else {
                assignSCLocks.set(lockId, loggedInUser);
                req.app.set('assignSCLocks', assignSCLocks);
                log.debug('Acquired lock for  AssignSC property :' + propertyId + ' by user :' + loggedInUser);
            }

            next();
        });
    }

    validateProperties(req, res, next) {
        const REF_NAMES = ['REF_NAME_1', 'REF_NAME_2', 'REF_NAME_3', 'REF_NAME_4', 'REF_NAME_5',
            'REF_NAME_6', 'REF_NAME_7', 'REF_NAME_8', 'REF_NAME_9', 'REF_NAME_10'];

        const errors = validationResult(req).errors;

        if (REF_NAMES.indexOf(req.body.refName) === -1) {
            errors.push({ msg: 'Ref name is incorrect, Must be one of these values : ' + JSON.stringify(REF_NAMES) });
        }
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
        log.info('AssignSC properties validation complete');
        req.properties = req.body;
        next();
    }

    getAssignSCs(req, res) {
        var connection = req.app.get('connection');
        assignSCServc.getAssignSCs(connection, req.session.dbConfig, (assignSCs, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(assignSCs);
        });
    }

    getAssignSC(req, res) {
        res.json(req.assignSC);
    }

    createAssignSC(req, res) {
        var connection = req.app.get('connection');
        assignSCServc.createAssignSC(connection, req.session.dbConfig, req.assignSC, (assignSC, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('AssignSC created successfully for assignSC :' + req.assignSC.name);
            return res.status(201).json({ success: true, message: 'Create successful', assignSC: assignSC });
        });
    }

    updateAssignSC(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.assignSC.id.toString();
        var loggedInUser = req.session.user.name;
        var assignSCLocks = req.app.get('assignSCLocks');

        assignSCServc.updateAssignSC(connection, req.session.dbConfig, req.assignSC, (assignSC, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('AssignSC updated successfully with id :' + req.assignSC.id);

            assignSCLocks.delete(lockId);
            req.app.set('assignSCLocks', assignSCLocks);
            log.debug('Released lock for assignSC :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteAssignSC(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.assignSC.id.toString();
        var loggedInUser = req.session.user.name;
        var assignSCLocks = req.app.get('assignSCLocks');

        assignSCServc.deleteAssignSC(connection, req.session.dbConfig, req.assignSC, (assignSC, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                assignSCServc.updateLineNumOnDel(connection, req.session.dbConfig, req.assignSC, (assignSC, error) => {
                    if (error) {
                        log.info('Updating line number for assignSCs failed');
                    }
                    log.info('AssignSC deleted successfully with id :' + req.assignSC.id);

                    assignSCLocks.delete(lockId);
                    req.app.set('assignSCLocks', assignSCLocks);
                    log.debug('Released lock for  assignSC :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    updateProperties(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.properties.refName + req.properties.refNameValueId.toString();
        var loggedInUser = req.session.user.name;
        var assignSCLocks = req.app.get('assignSCLocks');
        
        assignSCServc.updateProperties(connection, req.session.dbConfig, req.properties, (properties, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('AssignSC property updated successfully');

            assignSCLocks.delete(lockId);
            req.app.set('assignSCLocks', assignSCLocks);
            log.debug('Released lock for  assignSC property:' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    releaseLock(req, res) {
        var lockId = req.assignSC.id.toString();
        var loggedInUser = req.session.user.name;
        var assignSCLocks = req.app.get('assignSCLocks');

        if (assignSCLocks.get(lockId) !== undefined && assignSCLocks.get(lockId) === loggedInUser) {
            assignSCLocks.delete(lockId);
            req.app.set('assignSCLocks', assignSCLocks);
            log.debug('Released lock for  assignSC :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on  assignSC id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    resetOrder(req, res) {
        var connection = req.app.get('connection');
        var errors = [];
        if (isNaN(req.body.order)) {
            errors.push({ msg: 'order is required and must be a valid number' });
            return res.status(400).json({ errors: errors });
        } else {
            assignSCServc.resetOrder(connection, req.session.dbConfig, req.assignSC, req.body.order, (sample, error) => {
                if (error) {
                    log.info('Failed reset of assignSC order');
                    return res.status(500).json(error);
                } else {
                    log.info('AssignSC order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order successful'});
                }
            });
        }
    }
}

const assignSCCntrl = new AssignSCController();
module.exports = assignSCCntrl;