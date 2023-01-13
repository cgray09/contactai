var periodCntrl = require('../controllers/timeperiod_controller');
var includeCntrl = require('../controllers/includesample_controller');
var mainCntrl = require('../controllers/main_controller');
var assignscCntrl = require('../controllers/assignsc_controller');
var analysisCharCntrl = require('../controllers/analysischar_controller');
var scCntrl = require('../controllers/scorecard_controller');
var validator = require('./validator');

var express = require('express');
var router = express.Router();

/* Manage/View ScoreCards routes */
router.get('/', mainCntrl.hasReadRights, scCntrl.getScoreCards);
//router.post('/', mainCntrl.hasModificationRights, scCntrl.validateScoreCard, scCntrl.createScoreCard);
router.get('/:id([0-9]+)', mainCntrl.hasReadRights, scCntrl.lookupScoreCard, scCntrl.getScoreCard);
//router.put('/:id([0-9]+)', mainCntrl.hasModificationRights, scCntrl.lookupScoreCard, scCntrl.validateScoreCard, scCntrl.updateScoreCard);
//router.delete('/:id([0-9]+)', mainCntrl.hasModificationRights, scCntrl.lookupScoreCard, scCntrl.deleteScoreCard);
router.post('/:id([0-9]+)/activate', mainCntrl.hasModificationRights, scCntrl.lookupScoreCard, scCntrl.activateSC);

/* SC Model Def routes */
router.get('/:id([0-9]+)/defs', mainCntrl.hasReadRights, scCntrl.lookupScoreCard, scCntrl.getSCDefs);
router.post('/modelDef', mainCntrl.hasReadRights, scCntrl.validateFilters, scCntrl.getSCModelDef);


/* Define Time Periods routes */
router.get('/periods', mainCntrl.hasReadRights, periodCntrl.getPeriods);
router.post('/periods', mainCntrl.hasModificationRights, periodCntrl.validatePeriod, periodCntrl.createPeriod);
router.get('/periods/:id([0-9]+)', mainCntrl.hasReadRights, periodCntrl.lookupPeriod, periodCntrl.getPeriod);
router.put('/periods/:id([0-9]+)',  mainCntrl.hasModificationRights, periodCntrl.lookupPeriod, periodCntrl.validatePeriod, periodCntrl.updatePeriod);
router.delete('/periods/:id([0-9]+)', mainCntrl.hasModificationRights, periodCntrl.lookupPeriod, periodCntrl.deletePeriod);
router.post('/periods/:id([0-9]+)/resetOrder', mainCntrl.hasModificationRights, periodCntrl.lookupPeriod, periodCntrl.resetOrder);
router.post('/periods/:id([0-9]+)/releaseLock',  mainCntrl.hasReadRights, periodCntrl.lookupPeriod, periodCntrl.releaseLock);

/* Include Sample Point routes */
router.get('/include', mainCntrl.hasReadRights, includeCntrl.getIncludeSamples);
router.post('/include', mainCntrl.hasModificationRights, validator.incSample, includeCntrl.validateIncludeSample, includeCntrl.createIncludeSample);
router.get('/include/:id([0-9]+)', mainCntrl.hasReadRights, includeCntrl.lookupIncludeSample, includeCntrl.getIncludeSample);
router.put('/include/:id([0-9]+)', mainCntrl.hasModificationRights, includeCntrl.lookupIncludeSample, validator.incSample, includeCntrl.validateIncludeSample, includeCntrl.updateIncludeSample);
router.delete('/include/:id([0-9]+)', mainCntrl.hasModificationRights, includeCntrl.lookupIncludeSample, includeCntrl.deleteIncludeSample);
router.put('/include/properties', mainCntrl.hasModificationRights, includeCntrl.lookupProperties, validator.properties, includeCntrl.validateProperties, includeCntrl.updateProperties);
router.post('/include/:id([0-9]+)/resetOrder', mainCntrl.hasModificationRights, includeCntrl.lookupIncludeSample, includeCntrl.resetOrder);
router.post('/include/:id([0-9]+)/releaseLock',  mainCntrl.hasReadRights, includeCntrl.lookupIncludeSample, includeCntrl.releaseLock);


/* Assign Scorecards routes */
router.get('/assignsc', mainCntrl.hasReadRights, assignscCntrl.getAssignSCs);
router.post('/assignsc', mainCntrl.hasModificationRights, validator.assignsc, assignscCntrl.validateAssignSC, assignscCntrl.createAssignSC);
router.get('/assignsc/:id([0-9]+)', mainCntrl.hasReadRights, assignscCntrl.lookupAssignSC, assignscCntrl.getAssignSC);
router.put('/assignsc/:id([0-9]+)', mainCntrl.hasModificationRights, assignscCntrl.lookupAssignSC, validator.assignsc, assignscCntrl.validateAssignSC, assignscCntrl.updateAssignSC);
router.delete('/assignsc/:id([0-9]+)', mainCntrl.hasModificationRights, assignscCntrl.lookupAssignSC, assignscCntrl.deleteAssignSC);
router.put('/assignsc/properties', mainCntrl.hasModificationRights, assignscCntrl.lookupProperties, validator.properties, assignscCntrl.validateProperties, assignscCntrl.updateProperties);
router.post('/assignsc/:id([0-9]+)/resetOrder', mainCntrl.hasModificationRights, assignscCntrl.lookupAssignSC, assignscCntrl.resetOrder);
router.post('/assignsc/:id([0-9]+)/releaseLock',  mainCntrl.hasReadRights, assignscCntrl.lookupAssignSC, assignscCntrl.releaseLock);

/* Analysis Characteristics routes */
router.get('/analysisChar', mainCntrl.hasReadRights, analysisCharCntrl.getAnalysisChars);
router.post('/analysisChar', mainCntrl.hasModificationRights, validator.analysisChar, analysisCharCntrl.validateAnalysisChar, analysisCharCntrl.createAnalysisChar);
router.get('/analysisChar/:id([0-9]+)', mainCntrl.hasReadRights, analysisCharCntrl.lookupAnalysisChar, analysisCharCntrl.getAnalysisChar);
router.put('/analysisChar/:id([0-9]+)', mainCntrl.hasModificationRights, analysisCharCntrl.lookupAnalysisChar, validator.analysisChar, analysisCharCntrl.validateAnalysisChar, analysisCharCntrl.updateAnalysisChar);
router.delete('/analysisChar/:id([0-9]+)', mainCntrl.hasModificationRights, analysisCharCntrl.lookupAnalysisChar, analysisCharCntrl.deleteAnalysisChar);
router.post('/analysisChar/:id([0-9]+)/resetOrder', mainCntrl.hasModificationRights, analysisCharCntrl.lookupAnalysisChar, analysisCharCntrl.resetOrder);
router.post('/analysisChar/import', mainCntrl.hasModificationRights, analysisCharCntrl.validateImport, analysisCharCntrl.importAnalysisChars);
router.delete('/analysisChar/deleteAll', mainCntrl.hasModificationRights, analysisCharCntrl.deleteAnalysisChars);
router.post('/analysisChar/:id([0-9]+)/releaseLock',  mainCntrl.hasReadRights, analysisCharCntrl.lookupAnalysisChar, analysisCharCntrl.releaseLock);

module.exports = router;