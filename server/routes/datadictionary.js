var controller = require('../controllers/datadictionary_controller');
var mainCntrl = require('../controllers/main_controller');

var express = require('express');
var router = express.Router();

/* route for data dictionary */
router.get('/fileFormatData/:page', mainCntrl.hasReadRights, controller.getFileFormatDataDictVariables);
router.get('/excludeData/:page', mainCntrl.hasReadRights, controller.getExcludeDataDictVariables);
router.get('/keepCharsData/:page', mainCntrl.hasReadRights, controller.getKeepCharsDataDictVariables);
router.get('/standardizedData/:page', mainCntrl.hasReadRights, controller.getStandardizedDataDictVariables);
router.get('/computeCharsData/:page', mainCntrl.hasReadRights, controller.getComputCharsDataDictVariables);
router.get('/analysisCharData', mainCntrl.hasReadRights, controller.getAnalysisCharData);

module.exports = router;