var controller = require('../controllers/fileformat_controller');
var mainCntrl = require('../controllers/main_controller');
const validator =require('./validator');

var express = require('express');
var router = express.Router();

/*dialer (download, download supplement, assignment, callresult ) file format routes*/
router.get('/:dialerId([0-9]+)/:page', mainCntrl.hasReadRights, controller.getFileFormats); //the page field will let us know what page the request is coming from so we query the correct table
router.post('/:dialerId([0-9]+)/:page', mainCntrl.hasModificationRights, validator.fileformat, controller.validateFileFormat, controller.createFileFormat);
router.post('/:dialerId([0-9]+)/import/:page', mainCntrl.hasModificationRights, validator.ffimport, controller.validateImport, controller.importFileFormats);
router.post('/:dialerId([0-9]+)/createDS/:page', mainCntrl.hasModificationRights, controller.createDS);

/*route to get specific fileformat */
router.get('/:dialerId([0-9]+)/:page/:id([0-9]+)', mainCntrl.hasReadRights, controller.lookupFileFormat, controller.getFileFormat); 

/*routes to update and delete file format */
router.put('/:id([0-9]+)/:page', mainCntrl.hasModificationRights, controller.lookupFileFormat, validator.fileformat, controller.validateFileFormat, controller.updateFileFormat);
router.delete('/:id([0-9]+)/:page', mainCntrl.hasModificationRights, controller.lookupFileFormat, controller.deleteFileFormat);

/* route to fileformat releaseLock */
router.post('/:id([0-9]+)/releaseLock/:page', mainCntrl.hasReadRights, controller.lookupFileFormat, controller.releaseLock);

/* File Format Properties (delimiter/record length) */
router.post('/:dialerId([0-9]+)/:page/properties', mainCntrl.hasModificationRights, validator.ffproperties, controller.validateProperties, controller.createProperties);
router.put('/:dialerId([0-9]+)/:page/properties', mainCntrl.hasModificationRights, controller.lookupProperties, validator.ffproperties, controller.validateProperties, controller.updateProperties);


    /*Copy File Format */
router.post('/:id([0-9]+)/copy/:page', mainCntrl.hasModificationRights, controller.lookupFileFormat, controller.copyFileFormat);

/*route to reset order */
router.post('/:id([0-9]+)/resetOrder/:page', mainCntrl.hasModificationRights, controller.lookupFileFormat, controller.resetOrder);



module.exports = router;