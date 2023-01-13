var mainCntrl = require('../controllers/main_controller');
var segmentpopCntrl = require('../controllers/segmentpop_controller');
const validator =require('./validator');

var express = require('express');
var router = express.Router();

/* Download Segment Population routes */
router.get('/', mainCntrl.hasReadRights, segmentpopCntrl.getSegmentPops);
router.post('/', mainCntrl.hasModificationRights, validator.segPop, segmentpopCntrl.validateSegmentPop, segmentpopCntrl.createSegmentPop);
router.get('/:id([0-9]+)', mainCntrl.hasReadRights, segmentpopCntrl.lookupSegmentPop, segmentpopCntrl.getSegmentPop);
router.put('/:id([0-9]+)', mainCntrl.hasModificationRights, segmentpopCntrl.lookupSegmentPop, validator.segPop, segmentpopCntrl.validateSegmentPop, segmentpopCntrl.updateSegmentPop);
router.delete('/:id([0-9]+)', mainCntrl.hasModificationRights, segmentpopCntrl.lookupSegmentPop, segmentpopCntrl.deleteSegmentPop);
router.post('/:id([0-9]+)/releaseLock', mainCntrl.hasReadRights, segmentpopCntrl.lookupSegmentPop, segmentpopCntrl.releaseLock);
router.post('/:id([0-9]+)/resetOrder', mainCntrl.hasModificationRights, segmentpopCntrl.lookupSegmentPop, segmentpopCntrl.resetOrder);

router.put('/properties', mainCntrl.hasModificationRights, segmentpopCntrl.lookupProperties, validator.properties, segmentpopCntrl.validateProperties, segmentpopCntrl.updateProperties);


module.exports = router;