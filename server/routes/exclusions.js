var controller = require('../controllers/exclusion_controller');
var mainCntrl = require('../controllers/main_controller');
const validator = require('./validator');
var express = require('express');
var router = express.Router();

router.get('/:page', mainCntrl.hasReadRights, controller.lookupDefinitions, controller.getDefinitions);
router.post('/:page', mainCntrl.hasModificationRights, validator.definitions, controller.validateDefinitions, controller.deleteDefs, controller.createDefinitions);
router.put('/:page', mainCntrl.hasModificationRights, controller.lookupDefinitions, validator.definitions, controller.validateDefinitions,  
    controller.deleteDefs, controller.createDefinitions);
router.delete('/:page', mainCntrl.hasModificationRights, controller.lookupDefinitions, controller.deleteDefs, controller.deleteDefinitions);
router.post('/:page/releaseLock', mainCntrl.hasReadRights, controller.lookupDefinitions, controller.releaseLock);
module.exports = router;