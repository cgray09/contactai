var controller = require('../controllers/dialer_controller');
var mainCntrl = require('../controllers/main_controller');
const validator =require('./validator');

var express = require('express');
var router = express.Router();

// routes for dialer - dialer info
router.get('/', mainCntrl.hasReadRights, controller.getDialers);
router.get('/:id([0-9]+)', mainCntrl.hasReadRights, controller.lookupDialer, controller.getDialer);
router.post('/', mainCntrl.hasModificationRights, controller.validateDialerName, validator.dialer, controller.validateDialer, controller.createDialer, controller.createDialerRecycleDays, 
    controller.createCommonRecycleDays, controller.createBadDays);
router.put('/:id([0-9]+)', mainCntrl.hasModificationRights, controller.lookupDialer, controller.validateDialerName, validator.dialer, controller.validateDialer, controller.updateDialer, 
    controller.updateDialerRecycleDays, controller.updateCommonRecycleDays, controller.updateBadDays);
router.delete('/:id([0-9]+)', mainCntrl.hasModificationRights, controller.lookupDialer, controller.deleteDialer);

//route for copy
router.post('/:id([0-9]+)/copy', mainCntrl.hasReadRights, controller.lookupDialer, controller.lookupDialerRecycleDays, controller.lookupDialerBadDays,
    controller.copyDialer);

//route for releaseLock
router.post('/:id([0-9]+)/releaseLock', mainCntrl.hasReadRights, controller.lookupDialer, controller.releaseLock);

module.exports = router;