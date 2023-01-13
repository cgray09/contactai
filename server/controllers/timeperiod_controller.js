var periodServc = require('../services/timeperiods_service');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);

class TimePeriodController {

    lookupPeriod(req, res, next) {
        var periodId = req.params.id;
        var lockId = periodId.toString();
        var loggedInUser = req.session.user.name;

        var periodLocks = new Map();
        if (req.app.get('periodLocks') !== undefined) {
            periodLocks = req.app.get('periodLocks');
        }

        var connection = req.app.get('connection');

        periodServc.getPeriod(connection, req.session.dbConfig, periodId, (period, error) => {
            if (period === null) {
                log.info('Time Period does not exists with id:' + periodId);
                res.statusCode = 404;
                return res.json({ errors: ['Time Period does not exists with id:' + periodId] });
            }
            if (error) {
                log.info('Failed to get time period with id: ' + periodId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get time period with id: ' + periodId] });
            }

            if (periodLocks.get(lockId) !== undefined) {
                if (periodLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on time period :' + periodId + '. Locked by another user :' + periodLocks.get(lockId));
                    return res.json({ errors: ['Time Period is locked by another user. Cannot obtain lock.'] });
                }
                if (periodLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for time period:' + periodId + ' by user :' + loggedInUser);
                }
            } else {
                periodLocks.set(lockId, loggedInUser);
                req.app.set('periodLocks', periodLocks);
                log.debug('Acquired lock for time period :' + periodId + ' by user :' + loggedInUser);
            }

            req.period = period;
            next();
        });
    }

    validatePeriod(req, res, next) {
        const errors = validationResult(req).errors;
        if (req.period && req.body.id && (req.period.id !== req.body.id)) {
            errors.push({ msg: 'TimePeriod id mismatch within request body and param' });
        }

        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }
        log.info('TimePeriod validation complete');
        req.period = req.body;
        next();
    }

    getPeriods(req, res) {
        var connection = req.app.get('connection');
        periodServc.getPeriods(connection, req.session.dbConfig, (periods, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(periods);
        });
    }

    getPeriod(req, res) {
        res.json(req.period);
    }

    createPeriod(req, res) {
        var connection = req.app.get('connection');
        periodServc.createPeriod(connection, req.session.dbConfig, req.period, (period, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Time Period created successfully for period :' + req.period.name);
            return res.status(201).json({ success: true, message: 'Create successful', period: period });
        });
    }

    updatePeriod(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.period.id.toString();
        var loggedInUser = req.session.user.name;
        var periodLocks = req.app.get('periodLocks');

        periodServc.updatePeriod(connection, req.session.dbConfig, req.period, (period, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Time Period updated successfully with id :' + req.period.id);

            periodLocks.delete(lockId);
            req.app.set('periodLocks', periodLocks);
            log.debug('Released lock for time period :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deletePeriod(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.period.id.toString();
        var loggedInUser = req.session.user.name;
        var periodLocks = req.app.get('periodLocks');

        periodServc.deletePeriod(connection, req.session.dbConfig, req.period, (period, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                periodServc.updateLineNumOnDel(connection, req.session.dbConfig, req.period, (period, error) => {
                    if (error) {
                        log.info('Updating line number for time periods failed');
                    }
                    log.info('Time Period deleted successfully with id :' + req.period.id);

                    periodLocks.delete(lockId);
                    req.app.set('periodLocks', periodLocks);
                    log.debug('Released lock for time period :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    releaseLock(req, res) {
        var lockId = req.period.id.toString();
        var loggedInUser = req.session.user.name;
        var periodLocks = req.app.get('periodLocks');

        if (periodLocks.get(lockId) !== undefined && periodLocks.get(lockId) === loggedInUser) {
            periodLocks.delete(lockId);
            req.app.set('periodLocks', periodLocks);
            log.debug('Released lock for time period :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on time period id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    //PLaceholder for copy functionality. Not verified.
    copyPeriod(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        var connection = req.app.get('connection');

        var lockId = req.period.id.toString();
        var periodLocks = req.app.get('periodLocks');
        periodLocks.delete(lockId);
        req.app.set('periodLocks', periodLocks);
        log.debug('Released lock for time period :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of time period :' + req.period.id);

        var copyPeriod = req.period;
        copyPeriod.day = req.body.day;

        periodServc.createPeriod(connection, req.session.dbConfig, copyPeriod, (newPeriod, error) => {
            if (error) {
                log.error('Failed creating copy of time period :' + req.period.id);
                return res.status(500).json(error);
            }
            return res.status(201).json({ success: true, message: 'Create copy successful', copyPeriod: newPeriod });
        });
    }

    resetOrder(req, res) {
        var connection = req.app.get('connection');
        var errors = [];
        if (isNaN(req.body.order)) {
            errors.push({ msg: 'order is required and must be a valid number' });
            return res.status(400).json({ errors: errors });
        } else {
            periodServc.resetOrder(connection, req.session.dbConfig, req.period, req.body.order, (period, error) => {
                if (error) {
                    log.info('Failed reset of timePeriod order');
                    return res.status(500).json(error);
                } else {
                    log.info('TimePeriod order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order sucessful' });
                }
            });
        }
    }

}

const TimePeriodCntrl = new TimePeriodController();
module.exports = TimePeriodCntrl;