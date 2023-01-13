var scServc = require('../services/scorecards_service');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);

class ScoreCardController {

    lookupScoreCard(req, res, next) {
        var scId = req.params.id;
        var lockId = scId.toString();
        var loggedInUser = req.session.user.name;

        var scLocks = new Map();
        if (req.app.get('scLocks') !== undefined) {
            scLocks = req.app.get('scLocks');
        }

        var connection = req.app.get('connection');

        scServc.getSC(connection, req.session.dbConfig, scId, (sc, error) => {
            if (sc === null) {
                log.info('Score Card does not exists with id:' + scId);
                res.statusCode = 404;
                return res.json({ errors: ['Score Card does not exists with id:' + scId] });
            }
            if (error) {
                log.info('Failed to get scorecard with id: ' + scId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get scorecard with id: ' + scId] });
            }

            if (scLocks.get(lockId) !== undefined) {
                if (scLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on scorecard :' + scId + '. Locked by another user :' + scLocks.get(lockId));
                    return res.json({ errors: ['Score Card is locked by another user. Cannot obtain lock.'] });
                }
                if (scLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for scorecard:' + scId + ' by user :' + loggedInUser);
                }
            } else {
                scLocks.set(lockId, loggedInUser);
                req.app.set('scLocks', scLocks);
                log.debug('Acquired lock for scorecard :' + scId + ' by user :' + loggedInUser);
            }

            req.sc = sc;
            next();
        });
    }

    validateScoreCard(req, res, next) {
        //TO-DO: Implement validations if needed
        /**Not Required - Create/Update are not supported by thick client. only support available is for activating SC */
        req.sc = req.body;
        next();
    }

    getScoreCards(req, res) {
        var connection = req.app.get('connection');
        scServc.getSCs(connection, req.session.dbConfig, (scs, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(scs);
        });
    }

    getScoreCard(req, res) {
        res.json(req.sc);
    }

    createScoreCard(req, res) {
        var connection = req.app.get('connection');
        scServc.createSC(connection, req.session.dbConfig, req.sc, (sc, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Score Card created successfully for sc :' + req.sc.name);
            return res.status(201).json({ success: true, message: 'Create successful', sc: sc });
        });
    }

    updateScoreCard(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.sc.id.toString();
        var loggedInUser = req.session.user.name;
        var scLocks = req.app.get('scLocks');

        scServc.updateSC(connection, req.session.dbConfig, req.sc, (sc, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Score Card updated successfully with id :' + req.sc.id);

            scLocks.delete(lockId);
            req.app.set('scLocks', scLocks);
            log.debug('Released lock for scorecard :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteScoreCard(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.sc.id.toString();
        var loggedInUser = req.session.user.name;
        var scLocks = req.app.get('scLocks');

        scServc.deleteSC(connection, req.session.dbConfig, req.sc, (sc, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                log.info('Score Card deleted successfully with id :' + req.sc.id);

                scLocks.delete(lockId);
                req.app.set('scLocks', scLocks);
                log.debug('Released lock for scorecard :' + lockId + ' by user :' + loggedInUser);

                return res.status(200).json({ success: true, message: 'Delete successful' });

            }
        });
    }

    activateSC(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.sc.id.toString();
        var loggedInUser = req.session.user.name;
        var scLocks = req.app.get('scLocks');

        scServc.activateSC(connection, req.session.dbConfig, req.sc, (sc, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('ScoreCard activated successfully with id :' + req.sc.id);

            scLocks.delete(lockId);
            req.app.set('scLocks', scLocks);
            log.debug('Released lock for scoreCard :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    releaseLock(req, res) {
        var lockId = req.sc.id.toString();
        var loggedInUser = req.session.user.name;
        var scLocks = req.app.get('scLocks');

        if (scLocks.get(lockId) !== undefined && scLocks.get(lockId) === loggedInUser) {
            scLocks.delete(lockId);
            req.app.set('scLocks', scLocks);
            log.debug('Released lock for scorecard :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on scorecard id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    copyScoreCard(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        var connection = req.app.get('connection');

        var lockId = req.sc.id.toString();
        var scLocks = req.app.get('scLocks');
        scLocks.delete(lockId);
        req.app.set('scLocks', scLocks);
        log.debug('Released lock for scorecard :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of scorecard :' + req.sc.id);

        var copyScoreCard = req.sc;
        copyScoreCard.day = req.body.day;

        scServc.createSC(connection, req.session.dbConfig, copyScoreCard, (newScoreCard, error) => {
            if (error) {
                log.error('Failed creating copy of scorecard :' + req.sc.id);
                return res.status(500).json(error);
            }
            return res.status(201).json({ success: true, message: 'Create copy successful', copyScoreCard: newScoreCard });
        });
    }

    /***************ScoreCard model def details ************** */

    validateFilters(req, res, next) {
        const errors = validationResult(req).errors;
        const types = ['RIGHT', 'WRONG', 'PTP'];
        let filters = req.body;

        if (isNaN(filters.version)) {
            errors.push({ msg : 'Scorecard version expected'});
        }
        if (isNaN(filters.scoreId)) {
            filters.scoreId = 1;
        }
        if(isNaN(filters.timeperiod)) {
            filters.timeperiod = 0;
        }
        if(!filters.type || types.indexOf(filters.type) === -1) {
            filters.type = 'RIGHT';
        }

        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }

        req.filters = filters;
        next();
    }

    getSCModelDef(req, res) {
        var connection = req.app.get('connection');
       scServc.getSCModelDef(connection, req.session.dbConfig, req.filters, (modelDef, error) => {
            if (error) {
                res.status(500).json(error);
            } else {
                res.status(200).json(modelDef);
            }
        });
    }

    getSCDefs(req, res) {
        var connection = req.app.get('connection');
        scServc.getSCDefs(connection, req.session.dbConfig, req.sc, (defs, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(defs);
        });
    }
}

const ScoreCardCntrl = new ScoreCardController();
module.exports = ScoreCardCntrl;