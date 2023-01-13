var mainController = require('../controllers/main_controller');

var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'ContactAI' });
});

/*routes for login-logout-resetpassword */
router.post('/login', mainController.login);
router.post('/logout', mainController.releaseLocks, mainController.logout);
router.post('/sessionExpired', mainController.releaseLocks, mainController.sessionExpired);
router.post('/resetPassword', mainController.resetPassword);
router.get('/allowPasswordChange', mainController.allowPasswordChange);
router.get('/ping', mainController.sessionPing);
router.get('/helpUrl', mainController.getHelpUrl);

module.exports = router;