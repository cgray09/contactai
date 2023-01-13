var controller = require('../controllers/callresult_controller');
var dcntrl = require('../controllers/definitions_controller');
var mainCntrl = require('../controllers/main_controller');
const validator = require('./validator');

var express = require('express');
var router = express.Router();

/* Routes for Call Results -> Standardize Data */
router.get('/', mainCntrl.hasReadRights, controller.getVariables);
router.get('/:id([0-9]+)', mainCntrl.hasReadRights, controller.lookupVariable, dcntrl.lookupDefinitionsForCopy, controller.getVariable);
router.post('/', mainCntrl.hasModificationRights, validator.callresult, controller.validateVariable, controller.createVariable);
router.put('/:id([0-9]+)', mainCntrl.hasModificationRights, controller.lookupVariable, dcntrl.lookupDefinitionsForCopy, validator.callresult, controller.validateVariable, controller.updateVariable);
router.delete('/:id([0-9]+)', mainCntrl.hasModificationRights, controller.lookupVariable, controller.deleteVariable);

router.post('/:id([0-9]+)/resetOrder', mainCntrl.hasModificationRights, controller.lookupVariable, controller.resetOrder);
router.post('/:id([0-9]+)/releaseLock', mainCntrl.hasReadRights, controller.lookupVariable, controller.releaseLock);


/* Routes for Call Result -> Standardize Data -> Definitions */
router.get('/:id([0-9]+)/definitions', mainCntrl.hasReadRights, controller.lookupVariable, dcntrl.lookupDefinitions, dcntrl.getDefinitions);
router.post('/:id([0-9]+)/definitions', mainCntrl.hasModificationRights, controller.lookupVariable, validator.definitions, dcntrl.validateDefinitions, dcntrl.createDefinitions);
router.put('/:id([0-9]+)/definitions', mainCntrl.hasModificationRights, controller.lookupVariable, dcntrl.lookupDefinitions, validator.definitions, dcntrl.validateDefinitions,
    dcntrl.deleteDefs, dcntrl.createDefinitions);
router.delete('/:id([0-9]+)/definitions', mainCntrl.hasModificationRights, controller.lookupVariable, dcntrl.lookupDefinitions, dcntrl.deleteDefs, dcntrl.deleteDefinitions);


/*Copy Call Results -> Standardize Data & its definitions */
router.post('/:id([0-9]+)/copy', mainCntrl.hasModificationRights, controller.lookupVariable, dcntrl.lookupDefinitionsForCopy, controller.copyVariable);


module.exports = router;