var mainCntrl = require('../controllers/main_controller');
var envCntrl = require('../controllers/env_controller');
const validator =require('./validator');

var express = require('express');
var router = express.Router();


/* Define Env routes */
router.get('/', mainCntrl.hasReadRights, envCntrl.getEnvs);
router.post('/', mainCntrl.hasModificationRights, validator.env, envCntrl.validateEnv, envCntrl.createEnv);
router.get('/:id([0-9]+)', mainCntrl.hasReadRights, envCntrl.lookupEnv, envCntrl.getEnv);
router.put('/:id([0-9]+)',  mainCntrl.hasModificationRights, envCntrl.lookupEnv, validator.env, envCntrl.validateEnv, envCntrl.updateEnv);
router.delete('/:id([0-9]+)', mainCntrl.hasModificationRights, envCntrl.lookupEnv, envCntrl.deleteEnv);
router.post('/:id([0-9]+)/resetOrder', mainCntrl.hasModificationRights, envCntrl.lookupEnv, envCntrl.resetOrder);
router.post('/:id([0-9]+)/releaseLock', mainCntrl.hasReadRights, envCntrl.lookupEnv, envCntrl.releaseLock);

//unused as activate/deactivate is now handled as part of create/update
//router.post('/:id([0-9]+)/activate', mainCntrl.hasModificationRights, envCntrl.lookupEnv, envCntrl.activateEnv);
module.exports = router;