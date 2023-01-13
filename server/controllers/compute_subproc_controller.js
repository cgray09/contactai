var subprocServc = require('../services/compute_subproc_service');
const { validationResult } = require('express-validator');
var log = require('../logger')(module);
var HashMap = require('hashmap');

class SubProcController {

    lookupDefinition(req, res, next) {
        var connection = req.app.get('connection');
        subprocServc.getDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page, (def, error) => {
            if (def === null) {
                log.info('Definition does not exists for characteristic :' + req.characteristic.name);
                res.statusCode = 404;
                return res.json({ errors: ['Definitions does not exists for characteristic :' + req.characteristic.name] });
            }
            else if (error) {
                log.info('Failed to get definition for characteristic id :' + req.characteristic.name);
                res.statusCode = 500;
                return res.json({ errors: ['Failed to get definitions for characteristic :' + req.characteristic.name] });
            }
            else {
                req.dbDef = def;
                next();
            }
        });
    }

    validateDefinition(req, res, next) {
        const errors = validationResult(req).errors;
        const delimiters = ['eq', 'ne', 'GT', 'GE', 'LT', 'LE', '==', '<>', '<', '<=', '>', '>='];
        const connectors = ['AND', 'OR'];
        let def = req.body;
        if(def.delim1 && delimiters.indexOf(def.delim1) === -1) {
            errors.push({ msg: 'Delim1 invalid value set'});
        }
        if(def.delim2 && delimiters.indexOf(def.delim2) === -1) {
            errors.push({ msg: 'Delim2 invalid value set'});
        }
        if(def.connector && connectors.indexOf(def.connector) === -1) {
            errors.push({ msg: 'Connector invalid value set'});
        }
        if (errors.length > 0) {
            var response = { errors: [] };
            errors.forEach((err) => {
                response.errors.push(err.msg);
            });
            return res.status(400).json(response);
        }
        log.info(" ComputeChar definition validation complete");
        req.def = def;
        next();
    }

    getDefinition(req, res) {
        res.status(200).json(req.dbDef);
    }

    createDefinition(req, res) {
        var connection = req.app.get('connection');
        subprocServc.createDefinition(connection, req.session.dbConfig, req.characteristic.defName, req.def, req.params.page, (dbDef, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            return res.status(201).json({ success: true, message: 'Create successful', definition: req.dbDef });
        });
    }

    updateDefinition(req, res) {
        var connection = req.app.get('connection');        
        subprocServc.updateDefinition(connection, req.session.dbConfig, req.def, req.params.page, (dbDef, error) => {
            if (error) {
                return res.status(500).json(error);
            }
            log.info('Definition updated successfully with id :' + req.def.id);
            return res.status(200).json({ success: true, message: 'Update successful' });
        });

    }

    deleteDefinition(req, res) {
        var connection = req.app.get('connection');
        subprocServc.deleteDefinitionsByRef(connection, req.session.dbConfig, req.characteristic.defName, req.params.page,  (def, error) => {
            if (error) {
                log.info('Failed to delete existing defintions');
                return res.status(500).json(error);
            } else {
                log.info('Definitions deleted successfully with characteristic id :' + req.characteristic.id);               
                return res.status(200).json({ success: true, message: 'Delete successful' });
            }
        });
    }
}

var subProcController = new SubProcController();
module.exports = subProcController;