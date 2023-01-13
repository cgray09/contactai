var ip = require('ip');
var dbUtil = require('../db/db_util');
var trackUserSrvc = require('../services/trackuser_service');
var log = require('../logger')(module);
var config = require('../config.json');
var Request = require('request');
var allRights = ['Read Only', 'Full Access'];
var modificationRight = 'Full Access';

class MainController {

    releaseLocks(req, res, next) {
        if (req.session.user) {
            //release user locks
            var loggedInUser = req.session.user.name;
            var analysisCharLocks = req.app.get('analysisCharLocks');
            if (analysisCharLocks !== undefined) {
                for (var entry of analysisCharLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        analysisCharLocks.delete(entry[0]);
                        req.app.set('analysisCharLocks', analysisCharLocks);
                    }
                }
            }
            var assignSCLocks = req.app.get('assignSCLocks');
            if (assignSCLocks !== undefined) {
                for (var entry of assignSCLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        assignSCLocks.delete(entry[0]);
                        req.app.set('assignSCLocks', assignSCLocks);
                    }
                }
            }
            var variableLocks = req.app.get('variableLocks');
            if (variableLocks !== undefined) {
                for (var entry of variableLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        variableLocks.delete(entry[0]);
                        req.app.set('variableLocks', variableLocks);
                    }
                }
            }
            var characteristicLocks = req.app.get('characteristicLocks');
            if (characteristicLocks !== undefined) {
                for (var entry of characteristicLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        characteristicLocks.delete(entry[0]);
                        req.app.set('characteristicLocks', characteristicLocks);
                    }
                }
            }
            var dialerLocks = req.app.get('dialerLocks');
            if (dialerLocks !== undefined) {
                for (var entry of dialerLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        dialerLocks.delete(entry[0]);
                        req.app.set('dialerLocks', dialerLocks);
                    }
                }
            }
            var envLocks = req.app.get('envLocks');
            if (envLocks !== undefined) {
                for (var entry of envLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        envLocks.delete(entry[0]);
                        req.app.set('envLocks', envLocks);
                    }
                }
            }
            var exclusionLocks = req.app.get('exclusionLocks');
            if (exclusionLocks !== undefined) {
                for (var entry of exclusionLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        exclusionLocks.delete(entry[0]);
                        req.app.set('exclusionLocks', exclusionLocks);
                    }
                }
            }
            var fileFormatLocks = req.app.get('fileFormatLocks');
            if (fileFormatLocks !== undefined) {
                for (var entry of fileFormatLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        fileFormatLocks.delete(entry[0]);
                        req.app.set('fileFormatLocks', fileFormatLocks);
                    }
                }
            }
            var includeSampleLocks = req.app.get('includeSampleLocks');
            if (includeSampleLocks !== undefined) {
                for (var entry of includeSampleLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        includeSampleLocks.delete(entry[0]);
                        req.app.set('includeSampleLocks', includeSampleLocks);
                    }
                }
            }
            var keepCharLocks = req.app.get('keepCharLocks');
            if (keepCharLocks !== undefined) {
                for (var entry of keepCharLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        keepCharLocks.delete(entry[0]);
                        req.app.set('keepCharLocks', keepCharLocks);
                    }
                }
            }
            var scLocks = req.app.get('scLocks');
            if (scLocks !== undefined) {
                for (var entry of scLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        scLocks.delete(entry[0]);
                        req.app.set('scLocks', scLocks);
                    }
                }
            }
            var segmentPopLocks = req.app.get('segmentPopLocks');
            if (segmentPopLocks !== undefined) {
                for (var entry of segmentPopLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        segmentPopLocks.delete(entry[0]);
                        req.app.set('segmentPopLocks', segmentPopLocks);
                    }
                }
            }
            var periodLocks = req.app.get('periodLocks');
            if (periodLocks !== undefined) {
                for (var entry of periodLocks.entries()) {
                    if (entry[1] === loggedInUser) {
                        periodLocks.delete(entry[0]);
                        req.app.set('periodLocks', periodLocks);
                    }
                }
            }
        }
        next();
    }

    login(req, res) {

        if (!req.body.username || !req.body.password) {
            res.status(400).json({ error: 'Missing 1 or more input fields for authentication' });
        }

        var ctUserAdminUrl = 'https://localhost:' + req.app.get('useradmin_port') + '/ctUserAdmin';

        var ipAddr = (req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress || '').split(',')[0].trim();
		if (ipAddr.substr(0, 7) == "::ffff:") {
			ipAddr = ipAddr.substr(7)
        } 
        var requestConfig = {
            url: ctUserAdminUrl + '/api/login',
            form: { username:req.body.username, password:req.body.password, client:"ADMIN", IpAddr:ipAddr },
            rejectUnauthorized: false,
            requestCert: true
        };
        
        //send remote server login request here. 
        Request.post(
            requestConfig, (error, response, body) => {
                if (error) {
                    log.error('Login failed for user : ' + req.body.username + ': ' + error);
                    return res.status(500).send(error);
                }

                var resBody = JSON.parse(body);
                if (response.statusCode !== 200 && response.statusCode !== 412) {
                    log.error('Login failed for user : ' + req.body.username + ': ' + resBody.errorMessage);
                    return res.status(response.statusCode).json({ message: resBody.errorMessage });
                }

                var errorMsg = resBody.errorMessage ;
                if (response.statusCode === 412) {
                    log.error(errorMsg);
                }
                if(response.status === 200 && errorMsg) {
                    log.warn(errorMsg);
                }

                log.info('Login successful for user : ' + req.body.username);

                var dbType = resBody.databaseProperties["com.ali.commons.db.dbtype"];
                var dbDomain = resBody.databaseProperties["com.ali.commons.db.domain"];
                var realmName = resBody.databaseProperties["com.ali.commons.db.realmName"];
                var dbUser = resBody.databaseProperties["com.ali.commons.db.user"];
                var dbPass = resBody.databaseProperties["com.ali.commons.db.password"];
                var dbHost = resBody.databaseProperties["com.ali.commons.db.host"];
                var dbPort = resBody.databaseProperties["com.ali.commons.db.port"];
                var dbName = resBody.databaseProperties["com.ali.commons.db.dbname"];
                var dbSchema = resBody.databaseProperties["com.ali.commons.db.schema"];
                var dbSid = resBody.databaseProperties["com.ali.commons.db.sid"];
                var timeoutMinutes = resBody.databaseProperties["com.ali.commons.inactivity_timeout_minutes"];
                var userRight = resBody.databaseProperties["com.ali.calltechweb.legacy.rights"];

                var dbConfig = {
                    dbType: dbType, dbUser: dbUser, dbPass: dbPass, dbHost: dbHost,
                    dbPort: dbPort, dbName: dbName, dbSchema: dbSchema, dbSid: dbSid,
                    dbDomain: dbDomain, realmName: realmName
                };

                //establish DBConnection here -establish connection only once on first login
                if (!req.app.get('connection')) {
                    if(dbType !== 'sqlserver') {
                        var connection = dbUtil.getConnection(dbConfig);
                        req.app.set('connection', connection);
                        log.info('DB connection established successfully');
                    }
                }

                //set session attributes here
                req.session.dbConfig = dbConfig;
                req.session.user = { name: req.body.username, right: userRight };
                req.session.cookie.maxAge = timeoutMinutes * 60 * 1000;
                req.session.cookie.rolling = true;

                req.app.set('timeout', req.session.cookie.maxAge);
                return res.status(response.statusCode).json({ message: errorMsg, user: req.session.user, timeoutMinutes: timeoutMinutes, dbType: dbConfig.dbType });

            });
    }
   
    logout(req, res) {
        if (req.session.user) {   
            var connection = req.app.get('connection');     
            var dbConfig = req.session.dbConfig;
            var userName = req.session.user.name;
            var ipAddr = (req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress || '').split(',')[0].trim();
            if (ipAddr.substr(0, 7) == "::ffff:") {
                ipAddr = ipAddr.substr(7)
              }      
            var message = "Logout Successful";

            //destroy session
            req.session.destroy(() => {
                log.info('User logged out successfully');

                trackUserSrvc.create(connection, dbConfig, userName, message, ipAddr, (sucess, error) => {
                    if (error) {
                        log.error('Failed to track user logout in track_user_login', error);
                    }
                    return res.status(200).json({ success: true, message: 'User logged out successfully' });
                });
            });
        
        } else {
            return res.status(400).json({ errors: ['Bad Request : You are not logged In'] });
        }
    }

    sessionExpired(req, res) {
        if (req.session.user) {    
            var connection = req.app.get('connection');     
            var dbConfig = req.session.dbConfig;
            var userName = req.session.user.name;
            var ipAddr = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
            if (ipAddr.substr(0, 7) == "::ffff:") {
                ipAddr = ipAddr.substr(7)
              }
            var message = "Session Expired";

            //destroy session
            req.session.destroy(() => {
                log.info('User logged out successfully on session expiry');
                
                trackUserSrvc.create(connection, dbConfig, userName,  message, ipAddr, (sucess, error) => {
                    if (error) {
                        log.error('Failed to track user logout in track_user_login', error);
                    }
                    return res.status(200).json({ success: true, message: 'User logged out successfully' });
                });                
            });

        } else {
            return res.status(400).json({ errors: ['Bad Request : You are not logged In'] });
        }
    }

    resetPassword(req, res) {
        if (!req.body.username || !req.body.password || !req.body.newPassword || !req.body.newPasswordConfirm) {
            return res.status(400).json({ error: 'Missing 1 or more input fields for pasword reset' });
        }

        var ctUserAdminUrl = 'https://localhost:' + req.app.get('useradmin_port') + '/ctUserAdmin';

        var requestConfig = {
            url: ctUserAdminUrl + '/api/reset_password',
            form: { username:req.body.username, password:req.body.password, newPassword:req.body.newPassword, newPasswordConfirm:req.body.newPasswordConfirm },
            rejectUnauthorized: false,
            requestCert: true
        };

        Request.post(
            requestConfig, (error, response, resBody) => {
                if (error) {
                    log.info('Failed reset password for user : ' + req.body.username + ': ' + error);
                    return res.status(500).send(error);
                }

                if (response.statusCode !== 200) {
                    log.info('Failed reset password for user : ' + req.body.username + ': ' + resBody);
                    return res.status(response.statusCode).json({ message: resBody });
                } else {
                    log.info('Successfully reset password for user :' + req.body.username + ': ' + resBody);
                    return res.status(response.statusCode).json({ message: resBody });
                }
            });
    }

    allowPasswordChange(req, res) {
        return res.status(200).json({allowPWChange: config.ALLOW_PASSWORD_CHANGE});
    }

    sessionPing(req, res) {
        return res.status(200).json({ message: 'Success' });
    }

    getHelpUrl(req, res) {
        var helpUrl = 'https://' + ip.address() + ':' + req.app.get('useradmin_port') + '/adminwebhelp/adminhelp.htm';
        return res.status(200).json({helpUrl: helpUrl});
    }

    hasReadRights(req, res, next) {
       var right = req.session.user.right;
        if (allRights.indexOf(right) === -1) {
            return res.status(401).json({ error: 'UnAuthorized Access' });
        } else {  
            next();
        }
    }

    hasModificationRights(req, res, next) {
        var right = req.session.user.right;
        if (right !== modificationRight) {
            return res.status(401).json({ error: 'UnAuthorized Access' });
        } else {  
            next();
        }
    }
}

const mainController = new MainController();
module.exports = mainController;