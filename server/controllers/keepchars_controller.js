var keepCharServc = require('../services/keepchars_service');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);

class KeepCharController {

    lookupKeepChar(req, res, next) {
        var keepCharId = req.params.id;
        var lockId = keepCharId.toString() + req.params.page;
        var loggedInUser = req.session.user.name;

        var keepCharLocks = new Map();
        if (req.app.get('keepCharLocks') !== undefined) {
            keepCharLocks = req.app.get('keepCharLocks');
        }

        var connection = req.app.get('connection');

        keepCharServc.getKeepChar(connection, req.session.dbConfig, keepCharId, req.params.page, (keepChar, error) => {
            if (keepChar === null) {
                log.info('Keep characteristic does not exists with id:' + keepCharId);
                res.statusCode = 404;
                return res.json({ errors: ['Keep characteristic does not exists with id:' + keepCharId] });
            }
            if (error) {
                log.info('Failed to get keep characteristic with id: ' + keepCharId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get keep characteristic with id: ' + keepCharId] });
            }

            if (keepCharLocks.get(lockId) !== undefined) {
                if (keepCharLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on keep characteristic :' + keepCharId + '. Locked by another user :' + keepCharLocks.get(lockId));
                    return res.json({ errors: ['Keep characteristic is locked by another user. Cannot obtain lock.'] });
                }
                if (keepCharLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for keep characteristic:' + keepCharId + ' by user :' + loggedInUser);
                }
            } else {
                keepCharLocks.set(lockId, loggedInUser);
                req.app.set('keepCharLocks', keepCharLocks);
                log.debug('Acquired lock for keep characteristic :' + keepCharId + ' by user :' + loggedInUser);
            }

            req.keepChar = keepChar;
            next();
        });
    }

    validateKeepChar(req, res, next) {
        const errors = validationResult(req).errors;
        
        if (req.keepChar && req.body.id && (req.keepChar.id !== req.body.id)) {
            errors.push({ msg: 'KeepChar id mismatch within request body and param' });
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
        log.info('KeepChars validation complete');
        req.keepChar = req.body;
        next();
    }

    getKeepChars(req, res) {
        var page = req.params.page
        var connection = req.app.get('connection');
        keepCharServc.getKeepChars(connection, req.session.dbConfig, page, (keepChars, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(keepChars);
        });
    }

    getKeepChar(req, res) {
        res.json(req.keepChar);
    }

    createKeepChar(req, res) {
        var page = req.params.page
        var connection = req.app.get('connection');
        keepCharServc.createKeepChar(connection, req.session.dbConfig, req.keepChar, page, (keepChar, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Keep characteristic created successfully for characteristic :' + req.keepChar.name);
            return res.status(201).json({ success: true, message: 'Create successful', keepChar: keepChar });
        });
    }

    updateKeepChar(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.keepChar.id.toString() + req.params.page;
        var loggedInUser = req.session.user.name;
        var keepCharLocks = req.app.get('keepCharLocks');

        keepCharServc.updateKeepChar(connection, req.session.dbConfig, req.keepChar, req.params.page, (keepChar, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Keep characteristic updated successfully with id :' + req.keepChar.id);

            keepCharLocks.delete(lockId);
            req.app.set('keepCharLocks', keepCharLocks);
            log.debug('Released lock for keep characteristic :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteKeepChar(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.keepChar.id.toString() + req.params.page;
        var loggedInUser = req.session.user.name;
        var keepCharLocks = req.app.get('keepCharLocks');

        keepCharServc.deleteKeepChar(connection, req.session.dbConfig, req.keepChar, req.params.page, (keepChar, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                keepCharServc.updateLineNumOnDel(connection, req.session.dbConfig, req.keepChar, req.params.page, (keepChar, error) => {
                    if (error) {
                        log.info('Updating line number for keep characteristics failed');
                    }
                    log.info('Keep characteristic deleted successfully with id :' + req.keepChar.id);

                    keepCharLocks.delete(lockId);
                    req.app.set('keepCharLocks', keepCharLocks);
                    log.debug('Released lock for keep characteristic :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    releaseLock(req, res) {
        var lockId = req.keepChar.id.toString() + req.params.page;
        var loggedInUser = req.session.user.name;
        var keepCharLocks = req.app.get('keepCharLocks');

        if (keepCharLocks.get(lockId) !== undefined && keepCharLocks.get(lockId) === loggedInUser) {
            keepCharLocks.delete(lockId);
            req.app.set('keepCharLocks', keepCharLocks);
            log.debug('Released lock for keep characteristic :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on keep characteristic id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    copyKeepChar(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        var connection = req.app.get('connection');

        var lockId = req.keepChar.id.toString() + req.params.page;
        var keepCharLocks = req.app.get('keepCharLocks');
        keepCharLocks.delete(lockId);
        req.app.set('keepCharLocks', keepCharLocks);
        log.debug('Released lock for keep characteristic :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of keep characteristic :' + req.keepChar.id);

        var copyKeepChar = req.keepChar;
        copyKeepChar.name = req.body.name;

        keepCharServc.createKeepChar(connection, req.session.dbConfig, copyKeepChar, req.params.page, (newKeepChar, error) => {
            if (error) {
                log.error('Failed creating copy of keep characteristic :' + req.keepChar.id);
                return res.status(500).json(error);
            }
            return res.status(201).json({ success: true, message: 'Create copy successful', copyKeepChar: newKeepChar });
        });
    }

    resetOrder(req, res) {
        var connection = req.app.get('connection');
        var errors = [];
        if (isNaN(req.body.order)) {
            errors.push({ msg: 'order is required and must be a valid number' });
            return res.status(400).json({ errors: errors });
        } else {
            keepCharServc.resetOrder(connection, req.session.dbConfig, req.keepChar, req.body.order, req.params.page, (keepChar, error) => {
                if (error) {
                    log.info('Failed reset of keepChar order');
                    return res.status(500).json(error);
                } else {
                    log.info('KeepChar order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order sucessful' });
                }
            });
        }
    }
}

const keepCharCntrl = new KeepCharController();
module.exports = keepCharCntrl;