var analysisCharServc = require('../services/analysischar_service');
var log = require('../logger')(module);
const { validationResult } = require('express-validator');

class AnalysisCharController {

    lookupAnalysisChar(req, res, next) {
        var analysisCharId = req.params.id;
        var lockId = analysisCharId.toString();
        var loggedInUser = req.session.user.name;

        var analysisCharLocks = new Map();
        if (req.app.get('analysisCharLocks') !== undefined) {
            analysisCharLocks = req.app.get('analysisCharLocks');
        }

        var connection = req.app.get('connection');

        analysisCharServc.getAnalysisChar(connection, req.session.dbConfig, analysisCharId, (analysisChar, error) => {
            if (analysisChar === null) {
                log.info('AnalysisChar does not exists with id:' + analysisCharId);
                res.statusCode = 404;
                return res.json({ errors: ['AnalysisChar does not exists with id:' + analysisCharId] });
            }
            if (error) {
                log.info('Failed to get AnalysisChar with id: ' + analysisCharId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get AnalysisChar with id: ' + analysisCharId] });
            }

            if (analysisCharLocks.get(lockId) !== undefined) {
                if (analysisCharLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on AnalysisChar :' + analysisCharId + '. Locked by another user :' + analysisCharLocks.get(lockId));
                    return res.json({ errors: ['AnalysisChar is locked by another user. Cannot obtain lock.'] });
                }
                if (analysisCharLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for analysisChar:' + analysisCharId + ' by user :' + loggedInUser);
                }
            } else {
                analysisCharLocks.set(lockId, loggedInUser);
                req.app.set('analysisCharLocks', analysisCharLocks);
                log.debug('Acquired lock for  analysisChar :' + analysisCharId + ' by user :' + loggedInUser);
            }

            req.analysisChar = analysisChar;
            next();
        });
    }

    validateAnalysisChar(req, res, next) {
        const errors = validationResult(req).errors;
       
        if (req.analysisChar && req.body.id && (req.analysisChar.id !== req.body.id)) {
            errors.push({ msg: 'AnalysisChar id mismatch within request body and param' });
        }
        const TYPE = ['CHARACTER', 'NUMERIC'];
        if(TYPE.indexOf(req.body.type) === -1) {
            errors.push({ msg: 'type is incorrect, must be CHARACTER or NUMERIC' });
        }
        const SOURCE = ['SAK', 'SUMMARIZATION'];
        if(SOURCE.indexOf(req.body.source) === -1) {
            errors.push({ msg: 'source is incorrect, must be one of: ' + JSON.stringify(SOURCE) });
        }

        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
        log.info('AnalysisChar Validation complete');

        req.analysisChar = req.body;
        next();

    }

    validateImport(req, res, next) {
        //TO:DO
        //besides validating for format etc as in validateAnalysisChar - also ensure that analysis Char from req.body list 
        //is not pre-existing in the DB. If present, filter those records
        req.analysisChars = req.body;
        next();
    }

    getAnalysisChars(req, res) {
        var connection = req.app.get('connection');
        analysisCharServc.getAnalysisChars(connection, req.session.dbConfig, (analysisChars, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(analysisChars);
        });
    }

    getAnalysisChar(req, res) {
        res.json(req.analysisChar);
    }

    createAnalysisChar(req, res) {
        var connection = req.app.get('connection');
        analysisCharServc.createAnalysisChar(connection, req.session.dbConfig, req.analysisChar, (analysisChar, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('AnalysisChar created successfully for analysisChar :' + req.analysisChar.name);
            return res.status(201).json({ success: true, message: 'Create successful', analysisChar: analysisChar });
        });
    }

    updateAnalysisChar(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.analysisChar.id.toString();
        var loggedInUser = req.session.user.name;
        var analysisCharLocks = req.app.get('analysisCharLocks');

        analysisCharServc.updateAnalysisChar(connection, req.session.dbConfig, req.analysisChar, (analysisChar, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('AnalysisChar updated successfully with id :' + req.analysisChar.id);

            analysisCharLocks.delete(lockId);
            req.app.set('analysisCharLocks', analysisCharLocks);
            log.debug('Released lock for analysisChar :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteAnalysisChar(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.analysisChar.id.toString();
        var loggedInUser = req.session.user.name;
        var analysisCharLocks = req.app.get('analysisCharLocks');

        analysisCharServc.deleteAnalysisChar(connection, req.session.dbConfig, req.analysisChar, (analysisChar, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                analysisCharServc.updateLineNumOnDel(connection, req.session.dbConfig, req.analysisChar, (analysisChar, error) => {
                    if (error) {
                        log.info('Updating line number for analysisChars failed');
                    }
                    log.info('AnalysisChar deleted successfully with id :' + req.analysisChar.id);

                    analysisCharLocks.delete(lockId);
                    req.app.set('analysisCharLocks', analysisCharLocks);
                    log.debug('Released lock for  analysisChar :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    releaseLock(req, res) {
        var lockId = req.analysisChar.id.toString();
        var loggedInUser = req.session.user.name;
        var analysisCharLocks = req.app.get('analysisCharLocks');

        if (analysisCharLocks.get(lockId) !== undefined && analysisCharLocks.get(lockId) === loggedInUser) {
            analysisCharLocks.delete(lockId);
            req.app.set('analysisCharLocks', analysisCharLocks);
            log.debug('Released lock for  analysisChar :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on  analysisChar id :' + lockId });
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
            analysisCharServc.resetOrder(connection, req.session.dbConfig, req.analysisChar, req.body.order, (sample, error) => {
                if (error) {
                    log.info('Failed reset of analysisChar order');
                    return res.status(500).json(error);
                } else {
                    log.info('AnalysisChar order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order successful'});
                }
            });
        }
    }

    importAnalysisChars(req, res) {
        var connection = req.app.get('connection');
        analysisCharServc.importAnalysisChars(connection, req.session.dbConfig, req.analysisChars, (analysisChars, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('AnalysisChars imported successfully');
            return res.status(201).json({ success: true, message: 'Import successful' });
        });
    }

    deleteAnalysisChars(req, res) {
        var connection = req.app.get('connection');
        
        //TODO: Need to identify how to obtain lock for all analysisChars.

        analysisCharServc.deleteAnalysisChars(connection, req.session.dbConfig, (analysisChars, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {                
                log.info('All AnalysisChars deleted successfully');
                return res.status(200).json({ success: true, message: 'Delete successful' });                
            }
        });       
    }
}

const analysisCharCntrl = new AnalysisCharController();
module.exports = analysisCharCntrl;