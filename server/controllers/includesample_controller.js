var includeSampleServc = require('../services/includesample_service');
var log = require('../logger')(module);
const { validationResult } = require('express-validator');
const validator = require('../routes/validator');

class IncludeSampleController {

    lookupIncludeSample(req, res, next) {
        var includeSampleId = req.params.id;
        var lockId = includeSampleId.toString();
        var loggedInUser = req.session.user.name;

        var includeSampleLocks = new Map();
        if (req.app.get('includeSampleLocks') !== undefined) {
            includeSampleLocks = req.app.get('includeSampleLocks');
        }

        var connection = req.app.get('connection');

        includeSampleServc.getSample(connection, req.session.dbConfig, includeSampleId, (includeSample, error) => {
            if (includeSample === null) {
                log.info('IncludeSample does not exists with id:' + includeSampleId);
                res.statusCode = 404;
                return res.json({ errors: ['IncludeSample does not exists with id:' + includeSampleId] });
            }
            if (error) {
                log.info('Failed to get IncludeSample with id: ' + includeSampleId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get IncludeSample with id: ' + includeSampleId] });
            }

            if (includeSampleLocks.get(lockId) !== undefined) {
                if (includeSampleLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on IncludeSample :' + includeSampleId + '. Locked by another user :' + includeSampleLocks.get(lockId));
                    return res.json({ errors: ['IncludeSample is locked by another user. Cannot obtain lock.'] });
                }
                if (includeSampleLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for includeSample:' + includeSampleId + ' by user :' + loggedInUser);
                }
            } else {
                includeSampleLocks.set(lockId, loggedInUser);
                req.app.set('includeSampleLocks', includeSampleLocks);
                log.debug('Acquired lock for  includeSample :' + includeSampleId + ' by user :' + loggedInUser);
            }

            req.includeSample = includeSample;
            next();
        });
    }

    validateIncludeSample(req, res, next) {
        const errors = validationResult(req).errors;

        if (req.includeSample && req.body.id && (req.includeSample.id !== req.body.id)) {
            errors.push({ msg: 'IncludeSample id mismatch within request body and param' });
        }

        if(!req.body.include) {
            req.body.include = 'INCLUDE';
        }
        else if (validator.INCValues.indexOf(req.body.include) === -1) {
            errors.push({ msg: 'include value is incorrect, must be INCLUDE or EXCLUDE' });
        }

        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
         }
        log.info('IncludeSample Validation complete');
        req.includeSample = req.body;
        next();

    }

    lookupProperties(req, res, next) {
        var propertyId = req.body.refNameValueId;
        var propertyName = req.body.refName;
        var lockId = propertyName + propertyId.toString();
        var loggedInUser = req.session.user.name;

        var includeSampleLocks = new Map();
        if (req.app.get('includeSampleLocks') !== undefined) {
            includeSampleLocks = req.app.get('includeSampleLocks');
        }

        var connection = req.app.get('connection');

        includeSampleServc.getSample(connection, req.session.dbConfig, propertyId, (property, error) => {
            if (property === null) {
                log.info('IncludeSample property does not exists with id:' + propertyId);
                res.statusCode = 404;
                return res.json({ errors: ['IncludeSample property does not exists with id:' + propertyId] });
            }
            if (error) {
                log.info('Failed to get IncludeSample property with id: ' + propertyId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get IncludeSample property with id: ' + propertyId] });
            }

            if (includeSampleLocks.get(lockId) !== undefined) {
                if (includeSampleLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on IncludeSample property :' + propertyId + '. Locked by another user :' + includeSampleLocks.get(lockId));
                    return res.json({ errors: ['IncludeSample property is locked by another user. Cannot obtain lock.'] });
                }
                if (includeSampleLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for includeSample property :' + propertyId + ' by user :' + loggedInUser);
                }
            } else {
                includeSampleLocks.set(lockId, loggedInUser);
                req.app.set('includeSampleLocks', includeSampleLocks);
                log.debug('Acquired lock for includeSample property :' + propertyId + ' by user :' + loggedInUser);
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
        if (req.body.refNameLength && isNaN(req.body.refNameLengthId)) {
            errors.push({ msg: 'RefNameLenghtId must be specified to update refNameLength' });
        }
        if (req.body.refNameLengthId && !req.body.refNameLength) {
            req.body.refNameLength = '100'; //set default length
        }
        if (Number.isInteger(req.body.refNameLength)) {
            req.body.refNameLength = req.body.refNameLength.toString();
        }

        if (errors.length > 0) {
           return res.status(400).json(errors);
        }
        log.info('IncludeSample properties validation complete');

        req.properties = req.body;
        next();
    }

    getIncludeSamples(req, res) {
        var connection = req.app.get('connection');
        includeSampleServc.getSamples(connection, req.session.dbConfig, (includeSamples, error) => {
            if (error) {
                res.status(500).json(error);
            } else {
                res.status(200).json(includeSamples);
            }
        });
    }

    getIncludeSample(req, res) {
        res.json(req.includeSample);
    }

    createIncludeSample(req, res) {
        var connection = req.app.get('connection');
        includeSampleServc.createSample(connection, req.session.dbConfig, req.includeSample, (includeSample, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('IncludeSample created successfully for includeSample :' + req.includeSample.name);
            return res.status(201).json({ success: true, message: 'Create successful', includeSample: includeSample });
        });
    }

    updateIncludeSample(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.includeSample.id.toString();
        var loggedInUser = req.session.user.name;
        var includeSampleLocks = req.app.get('includeSampleLocks');

        includeSampleServc.updateSample(connection, req.session.dbConfig, req.includeSample, (includeSample, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('IncludeSample updated successfully with id :' + req.includeSample.id);

            includeSampleLocks.delete(lockId);
            req.app.set('includeSampleLocks', includeSampleLocks);
            log.debug('Released lock for includeSample :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteIncludeSample(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.includeSample.id.toString();
        var loggedInUser = req.session.user.name;
        var includeSampleLocks = req.app.get('includeSampleLocks');

        includeSampleServc.deleteSample(connection, req.session.dbConfig, req.includeSample, (includeSample, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                includeSampleServc.updateLineNumOnDel(connection, req.session.dbConfig, req.includeSample, (includeSample, error) => {
                    if (error) {
                        log.info('Updating line number for includeSamples failed');
                    }
                    log.info('IncludeSample deleted successfully with id :' + req.includeSample.id);

                    includeSampleLocks.delete(lockId);
                    req.app.set('includeSampleLocks', includeSampleLocks);
                    log.debug('Released lock for  includeSample :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    updateProperties(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.properties.refName + req.properties.refNameValueId.toString();
        var loggedInUser = req.session.user.name;
        var includeSampleLocks = req.app.get('includeSampleLocks');

        includeSampleServc.updateProperties(connection, req.session.dbConfig, req.properties, (properties, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('IncludeSample property updated successfully');

            includeSampleLocks.delete(lockId);
            req.app.set('includeSampleLocks', includeSampleLocks);
            log.debug('Released lock for  includeSample property:' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    releaseLock(req, res) {
        var lockId = req.includeSample.id.toString();
        var loggedInUser = req.session.user.name;
        var includeSampleLocks = req.app.get('includeSampleLocks');

        if (includeSampleLocks.get(lockId) !== undefined && includeSampleLocks.get(lockId) === loggedInUser) {
            includeSampleLocks.delete(lockId);
            req.app.set('includeSampleLocks', includeSampleLocks);
            log.debug('Released lock for  includeSample :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on  includeSample id :' + lockId });
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
            includeSampleServc.resetOrder(connection, req.session.dbConfig, req.includeSample, req.body.order, (sample, error) => {
                if (error) {
                    log.info('Failed reset of includeSample order');
                    return res.status(500).json(error);
                } else {
                    log.info('IncludeSample order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order successful'});
                }
            });
        }
    }
}

const includeSampleCntrl = new IncludeSampleController();
module.exports = includeSampleCntrl;