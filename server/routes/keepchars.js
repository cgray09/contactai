var controller = require('../controllers/keepchars_controller');
var mainCntrl = require('../controllers/main_controller');
const validator = require('./validator');
var express = require('express');
var router = express.Router();

router.get('/:page', mainCntrl.hasReadRights, controller.getKeepChars); //the page field will let us know what page the request is coming from so we query the correct table
router.get('/:id([0-9]+)/:page', mainCntrl.hasReadRights, controller.lookupKeepChar, controller.getKeepChar);
router.post('/:page', mainCntrl.hasModificationRights, validator.keepChar, controller.validateKeepChar, controller.createKeepChar);
router.put('/:id([0-9]+)/:page', mainCntrl.hasModificationRights, controller.lookupKeepChar, validator.keepChar, controller.validateKeepChar, controller.updateKeepChar);
router.delete('/:id([0-9]+)/:page', mainCntrl.hasModificationRights, controller.lookupKeepChar, controller.deleteKeepChar);

/*Copy Keep Characteristic */
router.post('/:id([0-9]+)/copy/:page', mainCntrl.hasModificationRights, controller.lookupKeepChar, controller.copyKeepChar);

/* Reset Order */
router.post('/:id([0-9]+)/resetOrder/:page', mainCntrl.hasModificationRights, controller.lookupKeepChar, controller.resetOrder);

/* releaseLock */
router.post('/:id([0-9]+)/releaseLock/:page', mainCntrl.hasReadRights, controller.lookupKeepChar, controller.releaseLock);

module.exports = router;