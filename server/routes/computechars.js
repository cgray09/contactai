var charCtrl = require('../controllers/computechars_controller');
var subProcCtrl = require('../controllers/compute_subproc_controller');
var detailCtrl = require('../controllers/compute_detail_controller');
var discretizeCtrl = require('../controllers/compute_discretize_controller');
var mainCntrl = require('../controllers/main_controller');
const validator = require('./validator');

var express = require('express');
var router = express.Router();

/* Routes for Compute Characteristics Grid */
router.get('/:page', mainCntrl.hasReadRights, charCtrl.getCharacteristics);
router.get('/:id([0-9]+)/:page', mainCntrl.hasReadRights, charCtrl.lookupCharacteristic, charCtrl.lookupDefinitionsForCopy, charCtrl.getCharacteristic); 
router.post('/:page', mainCntrl.hasModificationRights, validator.computeChar, charCtrl.validateCharacteristic, charCtrl.createCharacteristic);
router.put('/:id([0-9]+)/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, charCtrl.lookupDefinitionsForCopy, validator.computeChar, charCtrl.validateCharacteristic, charCtrl.updateCharacteristic);
router.delete('/:id([0-9]+)/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, charCtrl.deleteCharacteristic);

/*route for resetOrder */
router.post('/:id([0-9]+)/resetOrder/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, charCtrl.resetOrder);

/* Route for releaseLock */
router.post('/:id([0-9]+)/releaseLock/:page',  mainCntrl.hasReadRights, charCtrl.lookupCharacteristic, charCtrl.releaseLock);


/*The following will route the Definitions for Compute Characteristics based on the Characteristic Type Selected (URL determined by client) */

/* Routes for operations on SUBPROC tables (Char types: Average, Ratio, Round, Days Since, Count of, Sum, Value of, Eval) */
router.get('/:id([0-9]+)/subproc/:page', mainCntrl.hasReadRights, charCtrl.lookupCharacteristic, subProcCtrl.lookupDefinition, subProcCtrl.getDefinition);
router.post('/:id([0-9]+)/subproc/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, subProcCtrl.validateDefinition, subProcCtrl.createDefinition);
router.put('/:id([0-9]+)/subproc/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, subProcCtrl.lookupDefinition, subProcCtrl.validateDefinition, subProcCtrl.updateDefinition);
router.delete('/:id([0-9]+)/subproc/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, subProcCtrl.lookupDefinition, subProcCtrl.deleteDefinition);


/* Routes for operations on DETAIL tables (Char types: Detail) */
router.get('/:id([0-9]+)/details/:page', mainCntrl.hasReadRights, charCtrl.lookupCharacteristic, detailCtrl.lookupDefinitions, detailCtrl.getDefinitions);
router.post('/:id([0-9]+)/details/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, validator.definitions, detailCtrl.validateDefinitions, detailCtrl.deleteDefs, detailCtrl.createDefinitions);
router.put('/:id([0-9]+)/details/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, detailCtrl.lookupDefinitions, validator.definitions, detailCtrl.validateDefinitions,
    detailCtrl.deleteDefs, detailCtrl.createDefinitions);
router.delete('/:id([0-9]+)/details/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, detailCtrl.lookupDefinitions, detailCtrl.deleteDefs, detailCtrl.deleteDefinitions);


/* Routes for operations on DISCRETIZE tables (Char types: Discretize) */ 
router.get('/:id([0-9]+)/discretize/:page', mainCntrl.hasReadRights, charCtrl.lookupCharacteristic, discretizeCtrl.lookupDefinitions, discretizeCtrl.getDefinitions);
router.post('/:id([0-9]+)/discretize/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, validator.definitions, discretizeCtrl.validateDefinitions, discretizeCtrl.deleteDefs, discretizeCtrl.createDefinitions);
router.put('/:id([0-9]+)/discretize/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, discretizeCtrl.lookupDefinitions, validator.definitions, discretizeCtrl.validateDefinitions,
    discretizeCtrl.deleteDefs, discretizeCtrl.createDefinitions);
router.delete('/:id([0-9]+)/discretize/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, discretizeCtrl.lookupDefinitions, discretizeCtrl.deleteDefs, discretizeCtrl.deleteDefinitions);

 
/*Copy ComputeChars and its correspoding definitions */
router.post('/:id([0-9]+)/copy/:page', mainCntrl.hasModificationRights, charCtrl.lookupCharacteristic, charCtrl.lookupDefinitionsForCopy, charCtrl.copyCharacteristic);


module.exports = router;