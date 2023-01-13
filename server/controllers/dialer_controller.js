var dialerServc = require('../services/dialer_service');
var recycleServc = require('../services/recycledays_service');
var badDaysServc = require('../services/baddays_service');
var ffservice = require('../services/fileformat_service');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);

class DialerController {

    lookupDialer(req, res, next) {
        var dialerId = req.params.id;
        var lockId = dialerId.toString();
        var loggedInUser = req.session.user.name;

        var dialerLocks = new Map();
        if (req.app.get('dialerLocks') !== undefined) {
            dialerLocks = req.app.get('dialerLocks');
        }

        var connection = req.app.get('connection');

        dialerServc.getDialer(connection, req.session.dbConfig, dialerId, (dialer, error) => {
            if (dialer === null) {
                log.info('Dialer does not exists with id:' + dialerId);
                res.statusCode = 404;
                return res.json({ errors: ['Dialer does not exists with id:' + dialerId] });
            }
            if (error) {
                log.info('Failed to get dialer with id: ' + dialerId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get dialer with id: ' + dialerId] });
            }

            if (dialerLocks.get(lockId) !== undefined) {
                if (dialerLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on dialer :' + dialerId + '. Locked by another user :' + dialerLocks.get(lockId));
                    return res.json({ errors: ['Dialer is locked by another user. Cannot obtain lock.'] });
                }
                if (dialerLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for dialer:' + dialerId + ' by user :' + loggedInUser);
                }
            } else {
                dialerLocks.set(lockId, loggedInUser);
                req.app.set('dialerLocks', dialerLocks);
                log.debug('Acquired lock for dialer :' + dialerId + ' by user :' + loggedInUser);
            }

            req.dialer = dialer;
            next();
        });
    }

    lookupDialerRecycleDays(req, res, next) {
        var connection = req.app.get('connection');
        recycleServc.getDialerRecycleDays(connection, req.session.dbConfig, req.dialer, (dialerRecycleDays, error) => {
            if (dialerRecycleDays) {
                req.dialer.dialerRecycleDays = dialerRecycleDays;
            }
            next();
        });
    }

    lookupDialerBadDays(req, res, next) {
        var connection = req.app.get('connection');
        badDaysServc.getDialerBadDays(connection, req.session.dbConfig, req.dialer, (badDays, error) => {
            if (badDays) {
                req.dialer.dialerBadDays = badDays;
            }
            next();
        });
    }

    validateDialerName(req, res, next) {
        var connection = req.app.get('connection');
        dialerServc.getDialers(connection, req.session.dbConfig, (dialers, error) => {
            var error = false;
            dialers.forEach(dialer => {
                if ((!req.dialer) && (dialer.name === req.body.name)) {
                    error = true;
                    return res.status(400).json({ errors: ['Dialer with given name already exists'] });
                }
                if (req.dialer && (req.dialer.id !== dialer.id) && (dialer.name === req.body.name)) {
                    error = true;
                    return res.status(400).json({ errors: ['Dialer with given name already exists'] });
                }
            });
            if (!error) {
                next();
            }
        });
    }

    validateDialer(req, res, next) {
        const errors = validationResult(req).errors;

        if (req.dialer && req.body.id && (req.dialer.id !== req.body.id)) {
            errors.push({ msg: 'Dialer id mismatch within request body and param' });
        }

        //Validate date in format - yyyymmdd for dialer/common recycle/bad days.
        if (req.body.dialerRecycleDays) {
            req.body.dialerRecycleDays.forEach(x => {
                var y = x.recycleOn.substr(0, 4);
                var m = x.recycleOn.substr(4, 2) - 1;
                var d = x.recycleOn.substr(6, 2);
                var D = new Date(y, m, d);
                if (x.recycleOn.length > 8 || D.getFullYear() != y || D.getMonth() != m || D.getDate() != d) {
                    errors.push({ msg: 'Invalid Date : ' + x.recycleOn });
                }
            });
        }

        if (req.body.commonRecycleDays) {
            req.body.commonRecycleDays.forEach(x => {
                var y = x.recycleOn.substr(0, 4);
                var m = x.recycleOn.substr(4, 2) - 1;
                var d = x.recycleOn.substr(6, 2);
                var D = new Date(y, m, d);
                if (x.recycleOn.length > 8 || D.getFullYear() != y || D.getMonth() != m || D.getDate() != d) {
                    errors.push({ msg: 'Invalid Date : ' + x.recycleOn });
                }
            });
        }

        //construct badDays[] along with validation.
        var badDays = [];
        if (req.body.dialerBadDays) {
            req.body.dialerBadDays.forEach(x => {   //loop the dialerBadDays to parse and set the epoch
                var y = x.badDay.substr(0, 4);
                var m = x.badDay.substr(4, 2) - 1;
                var d = x.badDay.substr(6, 2)

                var D = new Date(y, m, d);
                if (x.badDay.length > 8 || D.getFullYear() != y || D.getMonth() != m || D.getDate() != d) {
                    errors.push({ msg: 'Invalid Date : ' + x.badDay });
                }

                var bDay = {}
                bDay.badDay = Math.floor(D.getTime() / 86400000);
                bDay.dialerName = req.body.name;       //set the dialerName to current dialer
                badDays.push(bDay);
            });
        }
        if (req.body.commonBadDays) {
            req.body.commonBadDays.forEach(x => {      //loop the dialerBadDays to parse and set the epoch
                var y = x.badDay.substr(0, 4);
                var m = x.badDay.substr(4, 2) - 1;
                var d = x.badDay.substr(6, 2)

                var D = new Date(y, m, d);
                if (x.badDay.length > 8 || D.getFullYear() != y || D.getMonth() != m || D.getDate() != d) {
                    errors.push({ msg: 'Invalid Date : ' + x.badDay });
                }

                var bDay = {};
                bDay.badDay = Math.floor(D.getTime() / 86400000);
                bDay.dialerName = 'all';           //set the dialerName to 'all'
                badDays.push(bDay);
            }); 
        }

        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }
        log.info('Dialers validation complete');

        if (!req.dialer) req.dialer = {};
        req.dialer.name = req.body.name;
        req.dialer.description = req.body.description;
        req.dialer.timezone = req.body.timezone;
        req.dialer.sunday = (req.body.sunday) ? 1 : 0;
        req.dialer.monday = (req.body.monday) ? 1 : 0;
        req.dialer.tuesday = (req.body.tuesday) ? 1 : 0;
        req.dialer.wednesday = (req.body.wednesday) ? 1 : 0;
        req.dialer.thursday = (req.body.thursday) ? 1 : 0;
        req.dialer.friday = (req.body.friday) ? 1 : 0;
        req.dialer.saturday = (req.body.saturday) ? 1 : 0;
        req.dialer.city = req.body.city;
        req.dialer.dst = (req.body.dst) ? 0 : 1;  // dst value inversely stored in DB.
        req.dialer.dialerRecycleDays = req.body.dialerRecycleDays; // must be an empty array and NOT Null if all dialerRecycleDays are to be deleted on update.
        req.dialer.commonRecycleDays = req.body.commonRecycleDays; // must be an empty array and NOT Null if all commonRecycleDays are to be deleted on update.
        req.dialer.badDays = badDays; //concatenated dialer and common badDays

        next();
    }

    getDialers(req, res) {
        var connection = req.app.get('connection');
        dialerServc.getDialers(connection, req.session.dbConfig, (dialers, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                dialers.forEach(dialer => {
                    dialer.dst = (dialer.dst) ? 0 : 1;
                });
                return res.status(200).json(dialers);
            }
        });
    }

    getDialer(req, res) {
        var connection = req.app.get('connection');
        req.dialer.dst = (req.dialer.dst) ? 0 : 1; // inverse db fetched dst value. 
        //set the below to 0 if null, as it causes validation errors  when dialer is submitted for update.
        req.dialer.sunday = req.dialer.sunday ? 1 : 0;
        req.dialer.monday = req.dialer.monday ? 1 : 0;
        req.dialer.tuesday = req.dialer.tuesday ? 1 : 0;
        req.dialer.wednesday = req.dialer.wednesday ? 1 : 0;
        req.dialer.thursday = req.dialer.thursday ? 1 : 0;
        req.dialer.friday = req.dialer.friday ? 1 : 0;
        req.dialer.saturday = req.dialer.saturday ? 1 : 0;
            
        recycleServc.getDialerRecycleDays(connection, req.session.dbConfig, req.dialer, (dialerRecycleDays, error) => {
            if (error) { /*do nothing */ }
            if (dialerRecycleDays) {
                req.dialer.dialerRecycleDays = dialerRecycleDays;

                recycleServc.getCommonRecycleDays(connection, req.session.dbConfig, (commonRecycleDays, error) => {
                    if (error) { /*do nothing */ }
                    if (commonRecycleDays) {
                        req.dialer.commonRecycleDays = commonRecycleDays;

                        badDaysServc.getBadDays(connection, req.session.dbConfig, req.dialer, (badDays, error) => {
                            if (error) { /* do nothing */ }
                            if (badDays) {
                                req.dialer.dialerBadDays = [];
                                req.dialer.commonBadDays = [];
                                badDays.forEach(x => {
                                    (x.dialerName === "all") ? req.dialer.commonBadDays.push(x) : req.dialer.dialerBadDays.push(x);
                                });
                            }
                            return res.status(200).json(req.dialer);
                        });
                    }
                });
            }
        });
    }

    createDialer(req, res, next) {
        var connection = req.app.get('connection');
        dialerServc.createDialer(connection, req.session.dbConfig, req.dialer, (newDialer, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                newDialer.dst = (newDialer.dst) ? 0 : 1; //return inverse of DB value.
                req.newDialer = newDialer;
                log.info('Dialer created successfully with name :' + req.dialer.name);
                next();
            }
        });
    }

    createDialerRecycleDays(req, res, next) {
        var connection = req.app.get('connection');
        /* create Dialer Recycle Days if any */
        if (req.dialer.dialerRecycleDays && req.dialer.dialerRecycleDays.length > 0) {
            recycleServc.createDialerRecycleDays(connection, req.session.dbConfig, req.dialer.dialerRecycleDays, req.dialer, (dialerRecycleDays, error) => {
                if (error) {
                    log.error('Failed to create dialer recycle days for dialer :' + req.dialer.name);
                    req.errors = [];
                    req.errors.push(error);
                } else {
                    log.info('Dialer Recycle Days created successfully');
                }
                next();
            });
        } else {
            next();
        }
    }

    createCommonRecycleDays(req, res, next) {
        var connection = req.app.get('connection');
        /* create Common Recycle Days if any */
        if (req.dialer.commonRecycleDays && req.dialer.commonRecycleDays.length > 0) {
            recycleServc.createCommonRecycleDays(connection, req.session.dbConfig, req.dialer.commonRecycleDays, (commonRecycleDays, error) => {
                if (error) {
                    log.error('Failed to create common recycle days');
                    req.errors.push(error);
                } else {
                    log.info('Common Recycle Days created successfully');
                }
                next();
            });
        } else {
            next();
        }
    }

    createBadDays(req, res) {
        var connection = req.app.get('connection');
        /* create dialerBadDays if any */
        if (req.dialer.badDays.length > 0) {
            badDaysServc.createBadDays(connection, req.session.dbConfig, req.dialer.badDays, (badDays, error) => {
                if (error) {
                    log.error('Failed to create bad days for dialer :' + req.dialer.name);
                    req.errors.push(error);
                } else {
                    log.info('Bad Days created successfully');
                }
                if (req.errors) {
                    return res.status(201).json({ success: false, message: 'Create successful partially', error: req.errors, dialer: req.newDialer });
                } else {
                    return res.status(201).json({ success: true, message: 'Create successful', dialer: req.newDialer });
                }
            });
        } else {
            return res.status(201).json({ success: true, message: 'Create successful', dialer: req.newDialer });
        }
    }


    updateDialer(req, res, next) {
        var connection = req.app.get('connection');
        dialerServc.updateDialer(connection, req.session.dbConfig, req.dialer, (dialer, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Dialer updated successfully with id :' + req.dialer.id);
            next();
        });
    }

    updateDialerRecycleDays(req, res, next) {
        var connection = req.app.get('connection');

        /* create Dialer Recycle Days if any */
        if (req.dialer.dialerRecycleDays) {
            recycleServc.deleteDialerRecycleDays(connection, req.session.dbConfig, req.dialer, (dialerRecycleDays, error) => {
                if (error) {
                    log.error('Failed to delete existing dialerRecycleDays for dialer :' + req.dialer.name);
                }
                if (req.dialer.dialerRecycleDays.length > 0) {
                    recycleServc.createDialerRecycleDays(connection, req.session.dbConfig, req.dialer.dialerRecycleDays, req.dialer, (dialerRecycleDays, error) => {
                        if (error) {
                            log.error('Failed to create dialer recycle days for dialer :' + req.dialer.name);
                        } else {
                            log.info('Dialer Recycle Days created successfully');
                        }
                        next();
                    });
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    }

    updateCommonRecycleDays(req, res, next) {
        var connection = req.app.get('connection');

        /* create Common Recycle Days if any */
        if (req.dialer.commonRecycleDays) {
            recycleServc.deleteCommonRecycleDays(connection, req.session.dbConfig, (commonRecycleDays, error) => {
                if (error) {
                    log.error('Failed to delete existing commonRecycleDays for dialer :' + req.dialer.name);
                }
                if (req.dialer.commonRecycleDays.length > 0) {
                    recycleServc.createCommonRecycleDays(connection, req.session.dbConfig, req.dialer.commonRecycleDays, (commonRecycleDays, error) => {
                        if (error) {
                            log.error('Failed to create common recycle days');
                        } else {
                            log.info('Common Recycle Days created successfully');
                        }
                        next();
                    });
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    }

    updateBadDays(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.dialer.id.toString();
        var loggedInUser = req.session.user.name;
        var dialerLocks = req.app.get('dialerLocks');

        /* create BadDays if any */
        if (req.dialer.badDays) {
            badDaysServc.deleteBadDays(connection, req.session.dbConfig, req.dialer, (badDays, error) => {
                if (error) {
                    log.error('Failed to delete existing badDays for dialer :' + req.dialer.name);
                }
                if (req.dialer.badDays.length > 0) {
                    badDaysServc.createBadDays(connection, req.session.dbConfig, req.dialer.badDays, (badDays, error) => {
                        if (error) {
                            log.error('Failed to create bad days for dialer :' + req.dialer.name);
                        } else {
                            log.info('Bad Days created successfully');
                        }
                        dialerLocks.delete(lockId);
                        req.app.set('dialerLocks', dialerLocks);
                        log.debug('Released lock for dialer :' + lockId + ' by user :' + loggedInUser);
                        return res.status(200).json({ success: true, message: 'Update successful' });
                    });
                } else {
                    dialerLocks.delete(lockId);
                    req.app.set('dialerLocks', dialerLocks);
                    log.debug('Released lock for dialer :' + lockId + ' by user :' + loggedInUser);
                    return res.status(200).json({ success: true, message: 'Update successful' });
                }
            });
        } else {
            dialerLocks.delete(lockId);
            req.app.set('dialerLocks', dialerLocks);
            log.debug('Released lock for dialer :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Update successful' });
        }
    }


    deleteDialer(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.dialer.id.toString();
        var loggedInUser = req.session.user.name;
        var dialerLocks = req.app.get('dialerLocks');

        dialerServc.deleteDialer(connection, req.session.dbConfig, req.dialer, (dialer, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                recycleServc.deleteDialerRecycleDays(connection, req.session.dbConfig, req.dialer, (recycleDays, error) => {
                    if (error) { /* do nothing */ }

                    badDaysServc.deleteDialerBadDays(connection, req.session.dbConfig, req.dialer, (badDays, error) => {
                        if (error) { /* do nothing */ }

                        ffservice.deleteAllDialerFileFormats(connection, req.session.dbConfig, req.dialer.dialerId, (formats, error) => {
                            if (error) { /* do nothing */ }

                            dialerLocks.delete(lockId);
                            req.app.set('dialerLocks', dialerLocks);
                            log.debug('Released lock for dialer :' + lockId + ' by user :' + loggedInUser);

                            log.info('Dialer deleted successfully with id :' + req.dialer.id);
                            return res.status(200).json({ success: true, message: 'Delete successful' });
                        });
                    });
                });
            }
        });
    }

    releaseLock(req, res) {
        var lockId = req.dialer.id.toString();
        var loggedInUser = req.session.user.name;
        var dialerLocks = req.app.get('dialerLocks');

        if (dialerLocks.get(lockId) !== undefined && dialerLocks.get(lockId) === loggedInUser) {
            dialerLocks.delete(lockId);
            req.app.set('dialerLocks', dialerLocks);
            log.debug('Released lock for dialer :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on dialer id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    copyDialer(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }
        var connection = req.app.get('connection');

        var lockId = req.dialer.id.toString();
        var dialerLocks = req.app.get('dialerLocks');
        dialerLocks.delete(lockId);
        req.app.set('dialerLocks', dialerLocks);
        log.debug('Released lock for dialer :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of dialer :' + req.dialer.id);

        var copyDialer = req.dialer;
        copyDialer.name = req.body.name;

        copyDialer.dialerRecycleDays.forEach(x => {
            x.dialerName = req.body.name;
        });
        copyDialer.dialerBadDays.forEach(x => {
            x.dialerName = req.body.name;

            var y = x.badDay.substr(0, 4);
            var m = x.badDay.substr(4, 2) - 1;
            var d = x.badDay.substr(6, 2)
            var D = new Date(y, m, d);

            x.badDay = Math.floor(D.getTime() / 86400000);
        });

        dialerServc.createDialer(connection, req.session.dbConfig, copyDialer, (newDialer, error) => {
            if (error) {
                log.error('Failed creating copy of dialer :' + req.dialer.id);
                return res.status(500).json(error);
            } else {
                log.info('Copy dialer created successfully');
                recycleServc.createDialerRecycleDays(connection, req.session.dbConfig, copyDialer.dialerRecycleDays, copyDialer, (dialerRecycleDays, error) => {
                    if (error) {
                        log.error('Failed to create dialer recycle days for dialer :' + copyDialer.name);
                    } else {
                        log.info('Copy Dialer Recycle Days created successfully');
                    }
                    badDaysServc.createBadDays(connection, req.session.dbConfig, copyDialer.dialerBadDays, (badDays, error) => {
                        if (error) {
                            log.error('Failed to create bad days for dialer :' + copyDialer.name);
                        } else {
                            log.info('Bad Days created successfully');
                        }
                        return res.status(201).json({ success: true, message: 'Create copy successful', copyDialer: newDialer });
                    });
                });
            }

        });
    }

}

const dialerCntrl = new DialerController();
module.exports = dialerCntrl;