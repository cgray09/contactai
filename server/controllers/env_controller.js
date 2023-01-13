var envServc = require('../services/env_service');
var log = require('../logger')(module);
const { validationResult } = require('express-validator');

class EnvController {

    lookupEnv(req, res, next) {
        var envId = req.params.id;
        var lockId = envId.toString();
        var loggedInUser = req.session.user.name;

        var envLocks = new Map();
        if (req.app.get('envLocks') !== undefined) {
            envLocks = req.app.get('envLocks');
        }

        var connection = req.app.get('connection');

        envServc.getEnv(connection, req.session.dbConfig, envId, (env, error) => {
            if (env === null) {
                log.info('Environment does not exists with id:' + envId);
                res.statusCode = 404;
                return res.json({ errors: ['Environment does not exists with id:' + envId] });
            }
            if (error) {
                log.info('Failed to get enviroment with id: ' + envId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get enviroment with id: ' + envId] });
            }

            if (envLocks.get(lockId) !== undefined) {
                if (envLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on enviroment :' + envId + '. Locked by another user :' + envLocks.get(lockId));
                    return res.json({ errors: ['Environment is locked by another user. Cannot obtain lock.'] });
                }
                if (envLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for enviroment:' + envId + ' by user :' + loggedInUser);
                }
            } else {
                envLocks.set(lockId, loggedInUser);
                req.app.set('envLocks', envLocks);
                log.debug('Acquired lock for enviroment :' + envId + ' by user :' + loggedInUser);
            }

            req.env = env;
            next();
        });
    }

    validateEnv(req, res, next) {
        const errors = validationResult(req).errors;

        if (req.env && req.body.id && (req.env.id !== req.body.id)) {
            errors.push({ msg: 'Environment id mismatch within request body and param' });
        }

        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }
        log.info('Environment validation complete');
        req.env = req.body;
        next();
    }

    getEnvs(req, res) {
        var connection = req.app.get('connection');
        envServc.getEnvs(connection, req.session.dbConfig, (envs, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(envs);
        });
    }

    getEnv(req, res) {
        res.json(req.env);
    }

    createEnv(req, res) {
        var connection = req.app.get('connection');
        envServc.createEnv(connection, req.session.dbConfig, req.env, (env, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Environment created successfully for env :' + req.env.name);
            return res.status(201).json({ success: true, message: 'Create successful', env: env });
        });
    }

    updateEnv(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.env.id.toString();
        var loggedInUser = req.session.user.name;
        var envLocks = req.app.get('envLocks');

        envServc.updateEnv(connection, req.session.dbConfig, req.env, (env, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Environment updated successfully with id :' + req.env.id);

            envLocks.delete(lockId);
            req.app.set('envLocks', envLocks);
            log.debug('Released lock for enviroment :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    activateEnv(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.env.id.toString();
        var loggedInUser = req.session.user.name;
        var envLocks = req.app.get('envLocks');

        envServc.activateEnv(connection, req.session.dbConfig, req.env, (env, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Environment activated successfully with id :' + req.env.id);

            envLocks.delete(lockId);
            req.app.set('envLocks', envLocks);
            log.debug('Released lock for enviroment :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteEnv(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.env.id.toString();
        var loggedInUser = req.session.user.name;
        var envLocks = req.app.get('envLocks');

        envServc.deleteEnv(connection, req.session.dbConfig, req.env, (env, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                envServc.updateLineNumOnDel(connection, req.session.dbConfig, req.env, (env, error) => {
                    if (error) {
                        log.info('Updating line number for enviroments failed');
                    }
                    log.info('Environment deleted successfully with id :' + req.env.id);

                    envLocks.delete(lockId);
                    req.app.set('envLocks', envLocks);
                    log.debug('Released lock for enviroment :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    releaseLock(req, res) {
        var lockId = req.env.id.toString();
        var loggedInUser = req.session.user.name;
        var envLocks = req.app.get('envLocks');

        if (envLocks.get(lockId) !== undefined && envLocks.get(lockId) === loggedInUser) {
            envLocks.delete(lockId);
            req.app.set('envLocks', envLocks);
            log.debug('Released lock for enviroment :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on enviroment id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    copyEnv(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        var connection = req.app.get('connection');

        var lockId = req.env.id.toString();
        var envLocks = req.app.get('envLocks');
        envLocks.delete(lockId);
        req.app.set('envLocks', envLocks);
        log.debug('Released lock for enviroment :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of enviroment :' + req.env.id);

        var copyEnv = req.env;
        copyEnv.day = req.body.day;

        envServc.createEnv(connection, req.session.dbConfig, copyEnv, (newEnv, error) => {
            if (error) {
                log.error('Failed creating copy of enviroment :' + req.env.id);
                return res.status(500).json(error);
            }
            return res.status(201).json({ success: true, message: 'Create copy successful', copyEnv: newEnv });
        });
    }

    resetOrder(req, res) {
        var connection = req.app.get('connection');
        var errors = [];
        if (isNaN(req.body.order)) {
            errors.push({ msg: 'order is required and must be a valid number' });
            return res.status(400).json({ errors: errors });
        } else {
            envServc.resetOrder(connection, req.session.dbConfig, req.env, req.body.order, (env, error) => {
                if (error) {
                    log.info('Failed reset of enviroment order');
                    return res.status(500).json(error);
                } else {
                    log.info('Env order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order sucessful' });
                }
            });
        }
    }

}

const EnvCntrl = new EnvController();
module.exports = EnvCntrl;