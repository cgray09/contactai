var fileFormatServc = require('../services/fileformat_service');
var computeCharServc = require('../services/computechars_service');
var computeCharDetailServc = require('../services/compute_detail_service');
const { validationResult } = require('express-validator');
const validator = require('../routes/validator');
const detailService = require('../services/compute_detail_service');
var log = require('../logger')(module);

class FileFormatController {

    lookupFileFormat(req, res, next) {
        var fileFormatId = req.params.id;
        var lockId = req.params.page + fileFormatId.toString();
        var loggedInUser = req.session.user.name;

        var fileFormatLocks = new Map();
        if (req.app.get('fileFormatLocks') !== undefined) {
            fileFormatLocks = req.app.get('fileFormatLocks');
        }

        var connection = req.app.get('connection');

        fileFormatServc.getFileFormat(connection, req.session.dbConfig, fileFormatId, req.params.page, (fileFormat, error) => {
            if (fileFormat === null) {
                log.info('File format does not exists with id:' + fileFormatId);
                res.statusCode = 404;
                return res.json({ errors: ['File format does not exists with id:' + fileFormatId] });
            }
            if (error) {
                log.info('Failed to get file format with id: ' + fileFormatId + '-' + error);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get file format with id: ' + fileFormatId] });
            }

            if (fileFormatLocks.get(lockId) !== undefined) {
                if (fileFormatLocks.get(lockId) !== loggedInUser) {
                    res.statusCode = 423;
                    log.debug('Cannot obtain lock on file format :' + fileFormatId + '. Locked by another user :' + fileFormatLocks.get(lockId));
                    return res.json({ errors: ['File format is locked by another user. Cannot obtain lock.'] });
                }
                if (fileFormatLocks.get(lockId) === loggedInUser) {
                    log.debug('Lock already acquired for file format:' + fileFormatId + ' by user :' + loggedInUser);
                }
            } else {
                fileFormatLocks.set(lockId, loggedInUser);
                req.app.set('fileFormatLocks', fileFormatLocks);
                log.debug('Acquired lock for file format :' + fileFormatId + ' by user :' + loggedInUser);
            }

            req.fileFormat = fileFormat;
            next();
        });
    }

    validateFileFormat(req, res, next) {
        const errors = validationResult(req).errors;
        if (req.body.id && req.fileFormat && (req.fileFormat.id !== req.body.id)) {
            errors.push({ msg: 'FileFormat id mismatch within request body and param' });
        }
        if (req.body.dialerId && req.fileFormat && (req.fileFormat.dialerId !== req.body.dialerId)) {
            errors.push({ msg: 'Dialer id mismatch within request body and existing fileformat dialerId' });
        }
        if (req.body.dialerId && req.params.dialerId && (req.params.dialerId !== req.body.dialerId)) {
            errors.push({ msg: 'Dialer id mismatch within request body and param' });
        }
        if( !req.body.type || validator.ffTypes.indexOf(req.body.type) === -1) {
            errors.push({ msg: req.body.name + ' Type invalid value set' });
        }
        /* commented per IQ-1940. Add in validation after proper research.
        if(req.body.formatter &&
            (req.body.formatter !== ""  && validator.formatters.indexOf(req.body.formatter) === -1)) {
            errors.push({ msg: req.body.name + ' Formatter invalid value set' });
        }
        */
        if(req.body.specialInfo &&
            (req.body.specialInfo !== ""  && validator.specialInfo.indexOf(req.body.specialInfo) === -1)) {
            errors.push({ msg: req.body.name + ' SpecialInfo invalid value set' });
        }
        if (req.body.name && req.body.name.length > 0) {
            if (req.body.name.match(/^\d/) || req.body.name.match(/^\s/)) {
                errors.push({ msg: req.body.name + ' Characteristic names cannot start with a digit or space' });
            }
            if (req.body.name.length > 50 && req.params.page.toUpperCase() !== 'DLFILEFORMAT') {
                errors.push({ msg: req.body.name + 'cannot be longer than 50 characters' });
            }
            if (req.params.page.toUpperCase() === 'DLFILEFORMAT') {
                var format = /[ `~!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/;
                if (format.test(req.body.name)) {
                        errors.push({ msg: req.body.name + ' cannot contain special characters except underscore' });
                } 
                if (req.body.name.length > 32) {
                    errors.push({ msg: req.body.name + 'cannot be longer than 32 characters' });
                }
                if (validator.reservedWords.indexOf(req.body.name) !== -1) {
                    errors.push({ msg: req.body.name + ' is a reserved keyword and must be renamed' });
                }
                if (req.body.name.toUpperCase().includes('INDEX')) {
                    errors.push({ msg: req.body.name + ' contains reserved word INDEX' });
                }
                if (req.body.name === 'ZIP_CODE' && req.body.specialInfo !== 'Zip Code') {
                    errors.push({ msg: 'ZIP_CODE must be marked as a Zip Code' });
                }
                //if ((req.body.specialInfo === 'Zip Code' || req.body.specialInfo.includes('Phone')) 
                //    && req.body.type !== 'NUMERIC') {
                //    errors.push({ msg: req.body.name + ' has an invalid type' });
                //} thick client does not enforce this validation although these 2 field values would be numeric
                if (req.body.specialInfo === 'Zip Code' && req.body.startPos > 0 && req.body.endPos > 0
                    && (req.body.endPos - req.body.startPos) + 1 > 6) {
                        errors.push({ msg: req.body.name + ' zip code field must be less than 6 digits in length'});
                }
                if ( req.body.specialInfo && req.body.specialInfo.includes('Phone') 
                    && req.body.startPos > 0 && req.body.endPos > 0
                    && (req.body.endPos - req.body.startPos) + 1 !== 10) {
                        errors.push({ msg: req.body.name + ' phone field is not 10 digits in length' });
                }
            }
        }
        if(req.body.startPos && req.body.startPos < 1) {
            errors.push({ msg: req.body.name + ' has invalid start position' });
        }    
        if(req.body.endPos && req.body.endPos < 1) {
            errors.push({ msg: req.body.name + ' has invalid end position' });
        }  

        if(req.body.endPos > 0 && req.body.startPos > 0 && (req.body.endPos - req.body.startPos) < 0 ) {
            errors.push({ msg: req.body.name + ' has invalid end position' });
        }
        
        if(req.body.startPos > 0 && req.body.endPos > 0) {
            req.body.fieldLength = req.body.endPos - req.body.startPos + 1;
        }
        
        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }
        log.info('FileFormat validation complete');
        req.fileFormat = req.body;
        next();
    }

    validateImport(req, res, next) {
        const errors = validationResult(req).errors;
        let fileFormats = [];
        let foundAcctnum = false;
        let foundZipCode = false;
        let foundPhone = false;
        req.body.forEach(format => {
            if( !format.type || validator.ffTypes.indexOf(format.type) === -1) {
                errors.push({ msg: format.name + ' Type invalid value set' });
            }
            /* commented per IQ-1940. Add in validation after proper research.
            if(format.formatter &&
                (format.formatter !== ""  && validator.formatters.indexOf(format.formatter) === -1)) {
                errors.push({ msg: format.name + ' Formatter invalid value set' });
            }
            */
            if(format.specialInfo &&
                (format.specialInfo !== ""  && validator.specialInfo.indexOf(format.specialInfo) === -1)) {
                errors.push({ msg: format.name + ' SpecialInfo invalid value set' });
            }
            if (format.name && format.name.length > 0) {
                if (format.name.match(/^\d/) || format.name.match(/^\s/)) {
                    errors.push({ msg: format.name + ' Characteristic names cannot start with a digit or space' });
                }
                if (format.name.length > 50 && req.params.page.toUpperCase() !== 'DLFILEFORMAT') {
                    errors.push({ msg: format.name + ' cannot be longer than 50 characters' });
                }
                if (req.params.page.toUpperCase() === 'DLFILEFORMAT') {
                    var formatter = /[ `~!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/;
                    if (formatter.test(format.name)) {
                            errors.push({ msg: format.name + ' cannot contain special characters except underscore' });
                    } 
                    if (format.name.length > 32) {
                        errors.push({ msg: format.name + ' cannot be longer than 32 characters' });
                    }
                    if (validator.reservedWords.indexOf(format.name) !== -1) {
                        errors.push({ msg: format.name + ' is a reserved keyword and must be renamed' });
                    }
                    if (format.name.toUpperCase().includes('INDEX')) {
                        errors.push({ msg: format.name + ' contains reserved word INDEX' });
                    }
                    if (format.name === 'ZIP_CODE' && format.specialInfo !== 'Zip Code') {
                        errors.push({ msg: 'ZIP_CODE must be marked as a Zip Code' });
                    }
                    //if ((format.specialInfo === 'Zip Code' || format.specialInfo.includes('Phone')) && format.type !== 'NUMERIC') {
                    //    errors.push({ msg: format.name + ' has an invalid type' });
                    //} thick client does not enforce this validation although these 2 field values would be numeric
                    if (format.specialInfo === 'Zip Code' && format.startPos > 0 && format.endPos > 0
                        && (format.endPos - format.startPos) > 6) {
                            errors.push({ msg: format.name + ' zip code field must be less than 6 digits in length'});
                    }
                    if (format.specialInfo.includes('Phone') && format.startPos > 0 && format.endPos > 0
                        && (format.endPos - format.startPos) + 1 !== 10) {
                            errors.push({ msg: format.name + ' phone field is not 10 digits in length' });
                    } 
                    if(format.name === 'ACCTNUM') {
                        foundAcctnum = true;
                    }
                    if(format.name === 'ZIP_CODE') {
                        foundZipCode = true;
                    }
                    if(format.specialInfo.includes('Phone')) {
                        foundPhone = true;
                    }             
                }
            }
            if(format.startPos && format.startPos < 1) {
                errors.push({ msg: format.name + ' has invalid start position' });
            }    
            if(format.endPos && format.endPos < 1) {
                errors.push({ msg: format.name + ' has invalid end position' });
            }    
            if(format.endPos && format.endPos > 0 && format.startPos > 0  && (format.endPos - format.startPos) < 0 ) {
                errors.push({ msg: format.name + ' has invalid end position' });
            }            
            if(format.startPos > 0 && format.endPos > 0) {
                format.fieldLength = format.endPos - format.startPos + 1;
            }
            fileFormats.push(format);
        });

        if (req.params.page.toUpperCase() === 'DLFILEFORMAT') {
            if(!foundAcctnum) {
                errors.push({ msg: 'Charateristic ACCTNUM must be defined'});
            }
            if(!foundZipCode) {
                errors.push({ msg: 'Charateristic ZIP_CODE must be defined'});
            }
            if(!foundPhone) {
                errors.push({ msg: 'At least one characteristic must be designated as a phone number.'});
            }
        }
        
        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            log.info('FileFormat import failed validation with errors :' + JSON.stringify(response.errors));
            return res.status(400).json(response);
        } else {
            log.info('FileFormat import validation complete');
            req.fileFormats = fileFormats;
            next();
        }
    }

    getFileFormats(req, res) {
        var dialerId = req.params.dialerId;
        var page = req.params.page
        var connection = req.app.get('connection');
        fileFormatServc.getFileFormats(connection, req.session.dbConfig, dialerId, page, (fileFormats, error) => {
            if (error) {
                res.status(500).json(error);
            }
            res.status(200).json(fileFormats);
        });
    }

    getFileFormat(req, res) {
        res.json(req.fileFormat);
    }

    createFileFormat(req, res) {
        var page = req.params.page
        var connection = req.app.get('connection');
        req.fileFormat.dialerId = req.params.dialerId;

        fileFormatServc.createFileFormat(connection, req.session.dbConfig, req.fileFormat, req.params.dialerId, page, (fileFormat, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('File format created successfully for characteristic :' + req.fileFormat.name);
            return res.status(201).json({ success: true, message: 'Create successful', fileFormat: fileFormat });
        });
    }

    importFileFormats(req, res) {
        var dialerId = req.params.dialerId;
        var page = req.params.page
        var connection = req.app.get('connection');
        fileFormatServc.deleteFileFormats(connection, req.session.dbConfig, dialerId, page, (fileformats, error) => {
            if (error) {
                log.error('Error occured deleting existing file formats :' + error);
                return res.status(500).json(error);
            } else {
                fileFormatServc.importFileFormats(connection, req.session.dbConfig, req.fileFormats, dialerId, page, (fileFormat, error) => {
                    if (error) {
                        log.error('Error occured importing file formats :' + error);
                        return res.status(500).json(error);
                    } else {
                        log.info('File formats imported successfully');
                        return res.status(201).json({ success: true, message: 'Import successful' });
                    }    
                });
            }
        });
    }

    updateFileFormat(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.params.page + req.fileFormat.id.toString();
        var loggedInUser = req.session.user.name;
        var fileFormatLocks = req.app.get('fileFormatLocks');
        
        fileFormatServc.updateFileFormat(connection, req.session.dbConfig, req.fileFormat, req.params.page ,(fileFormat, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('File Format updated successfully with id:' + req.fileFormat.id);

            fileFormatLocks.delete(lockId);
            req.app.set('fileFormatLocks', fileFormatLocks);
            log.debug('Released lock for file format :' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    deleteFileFormat(req, res) {
        var connection = req.app.get('connection');
        var lockId = req.params.page + req.fileFormat.id.toString();
        var loggedInUser = req.session.user.name;
        var fileFormatLocks = req.app.get('fileFormatLocks');

        fileFormatServc.deleteFileFormat(connection, req.session.dbConfig, req.fileFormat, req.params.page, (fileFormat, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                fileFormatServc.updateLineNumOnDel(connection, req.session.dbConfig, req.fileFormat, req.params.page, (fileFormat, error) => {
                    if (error) {
                        log.info('Updating line number for file formats failed');
                    }
                    log.info('File Format deleted successfully with id :' + req.fileFormat.id);

                    fileFormatLocks.delete(lockId);
                    req.app.set('fileFormatLocks', fileFormatLocks);
                    log.debug('Released lock for file format :' + lockId + ' by user :' + loggedInUser);

                    return res.status(200).json({ success: true, message: 'Delete successful' });
                });
            }
        });
    }

    lookupProperties(req, res, next) {
        var dialerId = req.params.dialerId;
        var page = req.params.page;
        var lockId = dialerId.toString() + page;
        var loggedInUser = req.session.user.name;

        var fileFormatPropsLocks = new Map();
        if (req.app.get('fileFormatPropsLocks') !== undefined) {
            fileFormatPropsLocks = req.app.get('fileFormatPropsLocks');
        }

        var connection = req.app.get('connection');

        if(!req.body.delimId && !req.body.recordLengthId) {
            return res.status(400).json({ errors: ['Missing delimId and recordLengthId in request.'] });
        } else {
            const propIds = [];
            propIds.push(req.body.delimId);
            propIds.push(req.body.recordLengthId);

            fileFormatServc.getProperties(connection, req.session.dbConfig, dialerId, propIds, page, (success, error) => {
                if (!success) {
                    log.info('Fileformat properties does not exists with id: ' + JSON.stringify(propIds));
                    res.statusCode = 404;
                    return res.json({ errors: ['Fileformat properties does not exists with id: ' + JSON.stringify(propIds)] });
                }
                if (error) {
                    log.info('Failed to get fileformat properties for dialerId: ' + dialerId + '-' + error);
                    res.statusCode = 500;
                    return res.json({ errors: ['Failed to get fileformat properties for dialerId: : ' + dialerId] });
                }

                if (fileFormatPropsLocks.get(lockId) !== undefined) {
                    if (fileFormatPropsLocks.get(lockId) !== loggedInUser) {
                        res.statusCode = 423;
                        log.debug('Cannot obtain lock on file format properties for dialer:' + dialerId + '. Locked by another user :' + fileFormatPropsLocks.get(lockId));
                        return res.json({ errors: ['File format properties is locked by another user. Cannot obtain lock.'] });
                    }
                    if (fileFormatPropsLocks.get(lockId) === loggedInUser) {
                        log.debug('Lock already acquired for file format properties for dialer:' + dialerId + ' by user :' + loggedInUser);
                        next();
                    }
                } else {
                    fileFormatPropsLocks.set(lockId, loggedInUser);
                    req.app.set('fileFormatPropsLocks', fileFormatPropsLocks);
                    log.debug('Acquired lock for file format properties for dialer:' + dialerId + ' by user :' + loggedInUser);
                    next();
                }                
            });
        }
    }
    
    validateProperties(req, res, next) {
        const errors = validationResult(req).errors;
        
        if (req.body.useDelimiter && (!req.body.delimiter || req.body.delimiter === "")) {
            errors.push({msg: "Delimiter cannot be emtpy"});
        }

        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }
        log.info('FileFormat properties validation complete');
        req.properties = req.body;
        next();
    }

    createProperties(req, res) {
        var dialerId = req.params.dialerId;
        var page = req.params.page
        var connection = req.app.get('connection');
        fileFormatServc.createProperties(connection, req.session.dbConfig, dialerId, req.properties, page, (properties, error) => {
            if (error) {
                return res.status(500).json(error);
            } else {
                log.info('File format properties created successfully for dialerId :' + dialerId);
                res.status(200).json({ success: true, message: 'Create successful', properties });
            }
        });
    }

    updateProperties(req, res) {
        var connection = req.app.get('connection');
        var dialerId = req.params.dialerId;
        var page = req.params.page;
        var lockId = dialerId.toString() + page;
        var loggedInUser = req.session.user.name;
        var fileFormatPropsLocks = req.app.get('fileFormatPropsLocks');

        fileFormatServc.updateProperties(connection, req.session.dbConfig, req.properties, page, (properties, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('File Format property updated successfully');

            fileFormatPropsLocks.delete(lockId);
            req.app.set('fileFormatPropsLocks', fileFormatPropsLocks);
            log.debug('Released lock for file format properties:' + lockId + ' by user :' + loggedInUser);

            return res.status(200).json({ success: true, message: 'Update successful' });
        });
    }

    releaseLock(req, res) {
        var lockId = req.params.page + req.fileFormat.id.toString(); //lockId based on fileformat/page
        var loggedInUser = req.session.user.name;
        var fileFormatLocks = req.app.get('fileFormatLocks');

        if (fileFormatLocks.get(lockId) !== undefined && fileFormatLocks.get(lockId) === loggedInUser) {
            fileFormatLocks.delete(lockId);
            req.app.set('fileFormatLocks', fileFormatLocks);
            log.debug('Released lock for file format :' + lockId + ' by user :' + loggedInUser);
            return res.status(200).json({ success: true, message: 'Released lock on file format id :' + lockId });
        } else {
            return res.status(423).json({ errors: ['Lock not acquired'] });
        }
    }

    copyFileFormat(req, res) {
        if (!req.body.name || req.body.name === null) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        var connection = req.app.get('connection');

        var lockId = req.params.page + req.fileFormat.id.toString();
        var fileFormatLocks = req.app.get('fileFormatLocks');
        fileFormatLocks.delete(lockId);
        req.app.set('fileFormatLocks', fileFormatLocks);
        log.debug('Released lock for file format :' + lockId + ' by user :' + req.session.user.name);

        log.info('Creating copy of file format :' + req.fileFormat.id);

        var copyFileFormat = req.fileFormat;
        copyFileFormat.name = req.body.name;

        fileFormatServc.createFileFormat(connection, req.session.dbConfig, copyFileFormat, req.params.page, (newFileFormat, error) => {
            if (error) {
                log.error('Failed creating copy of file format :' + req.fileFormat.id);
                return res.status(500).json(error);
            }
            return res.status(201).json({ success: true, message: 'Create copy successful', copyFileFormat: newFileFormat });
        });
    }

    resetOrder(req, res) {
        var connection = req.app.get('connection');
        var errors = [];
        if (isNaN(req.body.order)) {
            errors.push({ msg: 'order is required and must be a valid number' });
            return res.status(400).json({ errors: errors });
        } else {
            fileFormatServc.resetOrder(connection, req.session.dbConfig, req.fileFormat, req.body.order, req.params.page, (fileFormat, error) => {
                if (error) {
                    log.info('Failed reset of fileFormat order');
                    return res.status(500).json(error);
                } else {
                    log.info('FileFormat order reset successful')
                    return res.status(200).json({ success: true, message: 'Reset Order sucessful' });
                }
            });
        }
    }

    createDS(req, res) {
        var dialerId = req.params.dialerId;
        var page = req.params.page;
        var connection = req.app.get('connection');

        if (req.params.page.toUpperCase() !== "DLFILEFORMAT") {
            res.statusCode = 400;
            return res.json({ errors: ['CreateDS does not apply for page :' + page] });
        } else {
            fileFormatServc.getFileFormats(connection, req.session.dbConfig, dialerId, page, (fileFormats, error) => {
                if (error) {
                    res.status(500).json(error);
                }
                computeCharServc.getCharacteristics(connection, req.session.dbConfig, 'download', (characteristics, error) => {
                    if (error) {
                        res.status(500).json(error);
                    }

                    let newCharArr = [];
                    let newCharsDefsMap = new Map();
                    fileFormats.forEach(ff => {
                        if (ff.formatter && ff.formatter.includes('DATE->')) {

                            let foundDS = false;
                            characteristics.forEach(characteristic => {
                                if (characteristic.name === 'DS_' + ff.name) {
                                    foundDS = true;
                                }
                            });

                            if (!foundDS) {
                                let dsName = 'DS_' + ff.name;
                                let dsDefName = 'DS_' + ff.name + '-DL_chars';
                                let newChar = {
                                    name: dsName,
                                    description: dsName,
                                    type: 'DETAIL'
                                };
                                let newCharDefs = [
                                    { lineNum: 1, operand1: ff.name, operator: '==', compare: '0', connector: 'THEN', equals: '0', defName: dsDefName },
                                    { lineNum: 2, operand1: dsName, operator: '>', compare: '0', connector: 'ELSE', equals: '$__TODAY__-$' + ff.name, defName: dsDefName }
                                ]
                                newCharArr.push(newChar);
                                newCharsDefsMap.set(newChar, newCharDefs);
                            }
                        }
                    });
                    if (newCharArr.length > 0) {
                        var i = 0;
                        const recursiveCreateChar = function (char) {

                            computeCharServc.createCharacteristicPromise(connection, req.session.dbConfig, char, 'download')
                                .then(newChar => {
                                    log.info('Characteristic created successfully with name :' + char.name);
                                    i++;
                                    let charDefs = newCharsDefsMap.get(char);
                                    computeCharDetailServc.createDefinitions(connection, req.session.dbConfig, charDefs, 'download', (defs, error) => {
                                        if (error) {
                                            log.error('Failed creating default logic/definitions for characteristic :' + char.name);
                                        }
                                        if (i < newCharArr.length) {
                                            return recursiveCreateChar(newCharArr[i]);
                                        } else {
                                            return res.status(201).json(newCharArr.length);
                                        }
                                    });
                                })
                                .catch(error => {
                                    log.error('Failed creating days since characteristic with name :' + char.name);
                                    i++;
                                    if (i < newCharArr.length) {
                                        return recursiveCreateChar(newCharArr[i]);
                                    } else {
                                        return res.status(201).json(newCharArr.length);
                                    }
                                });
                        };
                        return recursiveCreateChar(newCharArr[0]);

                    } else {
                        res.status(201).json(newCharArr.length);
                    }

                });
            });
        }
    }
    
}

const fileFormatCntrl = new FileFormatController();
module.exports = fileFormatCntrl;