var segmentPopServc = require('../services/segmentpop_service');
var log = require('../logger')(module);
const { validationResult } = require('express-validator');

class SegmentPopController {

    lookupSegmentPop(req, res, next) {
        var segmentPopId = req.params.id;
        var lockId = segmentPopId.toString();
        var loggedInUser = req.session.user.name;

        var segmentPopLocks = new Map();
        if (req.app.get('segmentPopLocks') !== undefined) {
            segmentPopLocks = req.app.get('segmentPopLocks');
        }

        var connection = req.app.get('connection');

        segmentPopServc.getSegmentPop(connection, req.session.dbConfig, segmentPopId, (segmentPop, error) => {
            if (segmentPop === null) {
                log.info('SegmentPop does not exists with id:' + segmentPopId);
                res.statusCode = 404;
                return res.json({ errors: ['SegmentPop does not exists with id:' + segmentPopId] });
            }
            if (error) {
                log.info('Failed to get SegmentPop with id: ' + segmentPopId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get SegmentPop with id: ' + segmentPopId] });
            }

            if (segmentPopLocks.get(lockId) !== undefined) {
                if (segmentPopLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on SegmentPop :' + segmentPopId + '. Locked by another user :' + segmentPopLocks.get(lockId));
                    return res.json({ errors: ['SegmentPop is locked by another user. Cannot obtain lock.'] });
                }
                if (segmentPopLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for segmentPop:' + segmentPopId + ' by user :' + loggedInUser);
                }
            } else {
                segmentPopLocks.set(lockId, loggedInUser);
                req.app.set('segmentPopLocks', segmentPopLocks);
                log.debug('Acquired lock for  segmentPop :' + segmentPopId + ' by user :' + loggedInUser);
            }

            req.segmentPop = segmentPop;
            next();
        });
    }

    validateSegmentPop(req, res, next) {
        const errors = validationResult(req).errors;
        
        if (req.segmentPop && req.body.id && (req.segmentPop.id !== req.body.id)) {
            errors.push({ msg: 'SegmentPop id mismatch within request body and param' });
        }

        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }        
        log.info('SegmentPop Validation complete');
        req.segmentPop = req.body;
        next();
    }

    lookupProperties(req, res, next) {
        var propertyId = req.body.refNameValueId;
        var propertyName = req.body.refName;
        var lockId = propertyName + propertyId.toString();
        var loggedInUser = req.session.user.name;

        var segmentPopLocks = new Map();
        if (req.app.get('segmentPopLocks') !== undefined) {
            segmentPopLocks = req.app.get('segmentPopLocks');
        }

        var connection = req.app.get('connection');

        segmentPopServc.getSegmentPop(connection, req.session.dbConfig, propertyId, (property, error) => {
            if (property === null) {
                log.info('SegmentPop property does not exists with id:' + propertyId);
                res.statusCode = 404;
                return res.json({ errors: ['SegmentPop property does not exists with id:' + propertyId] });
            }
            if (error) {
                log.info('Failed to get SegmentPop property with id: ' + propertyId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get SegmentPop property with id: ' + propertyId] });
            }

            if (segmentPopLocks.get(lockId) !== undefined) {
                if (segmentPopLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on SegmentPop property :' + propertyId + '. Locked by another user :' + segmentPopLocks.get(lockId));
                    return res.json({ errors: ['SegmentPop property is locked by another user. Cannot obtain lock.'] });
                }
                if (segmentPopLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for SegmentPop property:' + propertyId + ' by user :' + loggedInUser);
                }
            } else {
                segmentPopLocks.set(lockId, loggedInUser);
                req.app.set('segmentPopLocks', segmentPopLocks);
                log.debug('Acquired lock for  SegmentPop property :' + propertyId + ' by user :' + loggedInUser);
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
        log.info('SegmentPop properties validation complete');
        req.properties = req.body;
        next();
    }

    getSegmentPops(req, res) {
        var connection = req.app.get('connection');
        segmentPopServc.getSegmentPops(connection, req.session.dbConfig, (segmentPops, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(segmentPops);
        });
    }

    getSegmentPop(req, res) {
        res.json(req.segmentPop);
    }

    createSegmentPop(req, res) {
        var connection = req.app.get('connection');
        segmentPopServc.createSegmentPop(connection, req.session.dbConfig, req.segmentPop, (segmentPop, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('SegmentPop created successfully for segmentPop :' + req.segmentPop.name);
            return res.status(201).json({ success: true, message: 'Create successful', segmentPop: segmentPop });
        });
    }

    updateSegmentPop(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.segmentPop.id.toString();
        var loggedInUser = req.session.user.name;
        var segmentPopLocks = req.app.get('segmentPopLocks');

        segmentPopServc.updateSegmentPop(connection, req.session.dbConfig, req.segmentPop, (segmentPop, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('SegmentPop updated successfully with id :' + req.segmentPop.id);

            segmentPopLocks.delete(lockId);
            req.app.set('segmentPopLocks', segmentPopLocks);
            log.debug('Released lock for segmentPop :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteSegmentPop(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.segmentPop.id.toString();
        var loggedInUser = req.session.user.name;
        var segmentPopLocks = req.app.get('segmentPopLocks');

        segmentPopServc.deleteSegmentPop(connection, req.session.dbConfig, req.segmentPop, (segmentPop, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                segmentPopServc.updateLineNumOnDel(connection, req.session.dbConfig, req.segmentPop, (segmentPop, error) => {
                    if (error) {
                        log.info('Updating line number for segmentPops failed');
                    }
                    log.info('SegmentPop deleted successfully with id :' + req.segmentPop.id);

                    segmentPopLocks.delete(lockId);
                    req.app.set('segmentPopLocks', segmentPopLocks);
                    log.debug('Released lock for  segmentPop :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    updateProperties(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.properties.refName + req.properties.refNameValueId.toString();
        var loggedInUser = req.session.user.name;
        var segmentPopLocks = req.app.get('segmentPopLocks');

        segmentPopServc.updateProperties(connection, req.session.dbConfig, req.properties, (properties, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('SegmentPop property updated successfully');

            segmentPopLocks.delete(lockId);
            req.app.set('segmentPopLocks', segmentPopLocks);
            log.debug('Released lock for  segmentPop property:' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    releaseLock(req, res) {
        var lockId = req.segmentPop.id.toString();
        var loggedInUser = req.session.user.name;
        var segmentPopLocks = req.app.get('segmentPopLocks');

        if (segmentPopLocks.get(lockId) !== undefined && segmentPopLocks.get(lockId) === loggedInUser) {
            segmentPopLocks.delete(lockId);
            req.app.set('segmentPopLocks', segmentPopLocks);
            log.debug('Released lock for  segmentPop :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on  segmentPop id :' + lockId });
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
            segmentPopServc.resetOrder(connection, req.session.dbConfig, req.segmentPop, req.body.order, (sample, error) => {
                if (error) {
                    log.info('Failed reset of segmentPop order');
                    return res.status(500).json(error);
                } else {
                    log.info('SegmentPop order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order successful'});
                }
            });
        }
    }
}

const segmentPopCntrl = new SegmentPopController();
module.exports = segmentPopCntrl;