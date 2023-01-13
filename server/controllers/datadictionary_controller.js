var ddServc = require('../services/dd_service');
var log = require('../logger')(module);

class DataDictionaryCntrl {

    getExcludeInputTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "FAN_OUT";
            case "DOWNLOAD": return "FAN_OUT_1";
            case "SCORECARDS": return "";
            default: return "";
        }
    }

    getExcludeGenerateTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "GENERATE";
            case "DOWNLOAD": return "DL_GENERATE_2";
            case "SCORECARDS": return "";
            default: return "";
        }
    }

    getExcludeVarType(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "3";
            case "DOWNLOAD": return "1";
            case "SCORECARDS": return "";
            default: return "";
        }
    }

    getFileFormatInputTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "";
            case "DLFILEFORMAT": return "";
            case "DLSUPPFILEFORMAT": return "";
            case "ASSIGNMENT": return "FAN_OUT_1";
            default: return "";
        }
    }

    getFileFormatGenerateTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "";
            case "DLFILEFORMAT": return "";
            case "DLSUPPFILEFORMAT": return "";
            case "ASSIGNMENT": return "DL_GENERATE_2";
            default: return "";
        }
    }

    getFileFormatVarType(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "";
            case "DLFILEFORMAT": return "";
            case "DLSUPPFILEFORMAT": return "";
            case "ASSIGNMENT": return "2";
            default: return "";
        }
    }

    getKeepCharsInputTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "FAN_OUT";
            case "SUMMARIZATION": return "";
            case "ASSIGNMENT": return "FAN_OUT_1";
            default: return "";
        }
    }

    getKeepCharsGenerateTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "GENERATE";
            case "SUMMARIZATION": return "";
            case "ASSIGNMENT": return "DL_GENERATE_2";
            default: return "";
        }
    }

    getKeepCharsVarType(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "4";
            case "SUMMARIZATION": return "";
            case "ASSIGNMENT": return "2";
            default: return "";
        }
    }

    getComputeCharsInputTable(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "FAN_OUT";
            case "SUMMARIZATION": return "FAN_OUT";
            case "DOWNLOAD": return "FAN_OUT_1";
            default: return "";
        }
    }

    getComputeCharsVarType(screen) {
        if (!screen) return "";
        switch (screen.toUpperCase()) {
            case "CALLRESULT": return "3";
            case "SUMMARIZATION": return "3";
            case "DOWNLOAD": return "3";
            default: return "";
        }
    }

    /*
    * add Globals by default
    *  0 => None - Input File Formats
    *  1 => Download Generate
    *  2 => Download Save Chars - DB or File
    *  3 => Only Globals chars AND subs
    *  4 => Only Globals chars
    * */
    getSystemVariables(type) {
        var variableList = [];
        if (type !== '') {
            if (type === '1' || type === '2') {
                // Assignment Vars - Generate
                variableList.push('CT_POPULATION_NAME');
                variableList.push('TREATMENT_NAME');
                variableList.push('__DAYOFMONTH__');
                variableList.push('__WEIGHT__');
                variableList.push('__RANDOM__');
                variableList.push('__RANDOMV__');
                variableList.push('__SCOREID__');
                variableList.push('__OTHER_DATA__');
                variableList.push('__FIRSTDL__');
                variableList.push('__LASTDL__');
                variableList.push('p_ptp');
            }
            if (type === '1') {
                variableList.push('is_phone_ok_home(<area code>,<phone>)');
                variableList.push('is_phone_ok_work(<area code>,<phone>)');
            }
            if (type === '2') {
                // Available for DL SAK-File save Keeps
                variableList.push('__INDEX1__');
                variableList.push('__INDEX2__');
                variableList.push('__INDEX3__');
                variableList.push('__INDEX4__');
                variableList.push('__INDEX5__');
                variableList.push('__INDEX6__');
                variableList.push('__INDEX7__');
                variableList.push('__INDEX8__');
                variableList.push('__INDEX9__');
                variableList.push('__INDEX10__');
                variableList.push('__INDEX11__');
                variableList.push('__INDEX12__');
                variableList.push('__INDEX13__');
                variableList.push('__INDEX14__');
                variableList.push('__INDEX15__');
                variableList.push('__INDEX16__');
            }
            if (type !== '0') {
                // Global Vars
                variableList.push('__DIALER__');
                variableList.push('__STRATEGY__');
                variableList.push('__TODAY__');
                variableList.push('__DAYOFWEEK__');
            }
            if (type === '1' || type === '3') {
                // Global Subs
                variableList.push('substr($char,<offset>,<length>)');
                variableList.push('stripws($char)'); // strip white space
                variableList.push('index($char, <substr>)');
            }
        }
        return variableList;
    }


    /*
    * API for Exclude Records data dictionary :
    * Edit -> CallResults/Download -> Exclude Records -> Combobox for operand1 & operand2 
    * */
    getExcludeDataDictVariables(req, res) {
        const pages = ['CALLRESULT', 'DOWNLOAD', 'SCORECARDS'];
        var connection = req.app.get('connection');
        var page = req.params.page;
        var variableList = [];

        if (page && pages.indexOf(page.toUpperCase()) === -1) {
            return res.status(400).json({ errors: ['Incorrect page, Expected 1 of :' + JSON.stringify(pages)] });
        } else {
            ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getExcludeInputTable(page), (data, error) => {
                if (error) {
                    log.error('Failed to get ExcludeInputTable data');
                } else {
                    variableList.push(...data);
                    ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getExcludeGenerateTable(page), (data, error) => {
                        if (error) {
                            log.error('Failed to get ExcludeGenerateTable data');
                        } else {
                            variableList.push(...data);
                            variableList.push(...ddCntrl.getSystemVariables(ddCntrl.getExcludeVarType(page)));
                            return res.status(200).json(variableList);
                        }
                    });
                }
            });
        }
    }

    /*
    * API for FileFormat data dictionary :
    * Edit -> Assignment -> Dialer Output -> <dialer> -> Characteristic Name drop down
    * */
    getFileFormatDataDictVariables(req, res) {
        const pages = ['CALLRESULT', 'DLFILEFORMAT', 'DLSUPPFILEFORMAT', 'ASSIGNMENT'];
        var connection = req.app.get('connection');
        var page = req.params.page;
        var variableList = [];

        if (page && pages.indexOf(page.toUpperCase()) === -1) {
            return res.status(400).json({ errors: ['Incorrect page, Expected 1 of :' + JSON.stringify(pages)] });
        } else {
            ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getFileFormatInputTable(page), (data, error) => {
                if (error) {
                    log.error('Failed to get FileFormatInputTable data');
                } else {
                    variableList.push(...data);
                    ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getFileFormatGenerateTable(page), (data, error) => {
                        if (error) {
                            log.error('Failed to get FileFormatGenerateTable data');
                        } else {
                            variableList.push(...data);
                            variableList.push(...ddCntrl.getSystemVariables(ddCntrl.getFileFormatVarType(page)));
                            return res.status(200).json(variableList);
                        }
                    });
                }
            });
        }
    }

    /*
    * API for KeepChars data dictionary :
    * Edit ->CallResults/Summarization/Assignment -> Keep Characteristics -> Characteristic Name drop down
    * */
    getKeepCharsDataDictVariables(req, res) {
        const pages = ['CALLRESULT', 'SUMMARIZATION', 'ASSIGNMENT'];
        var connection = req.app.get('connection');
        var page = req.params.page;
        var variableList = [];

        if (page && pages.indexOf(page.toUpperCase()) === -1) {
            return res.status(400).json({ errors: ['Incorrect page, Expected 1 of :' + JSON.stringify(pages)] });
        } else {
            ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getKeepCharsInputTable(page), (data, error) => {
                if (error) {
                    log.error('Failed to get KeepCharsInputTable data');
                } else {
                    variableList.push(...data);
                    ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getKeepCharsGenerateTable(page), (data, error) => {
                        if (error) {
                            log.error('Failed to get KeepCharsGenerateTable data');
                        } else {
                            variableList.push(...data);
                            variableList.push(...ddCntrl.getSystemVariables(ddCntrl.getKeepCharsVarType(page)));
                            return res.status(200).json(variableList);
                        }
                    });
                }
            });
        }
    }

    /*
    * API for CallResults Standardized Data data dictionary :
    * Edit -> CallResults/Standardized Data-> Grid item edit logic -> Combobox for operand1 & operand2 
    * 
    * Note:This list contains same data as getExcludeDataDictVariables for CALLRESULT page, 
    * except do not include getExcludeGenerateTable data.
    * */
    getStandardizedDataDictVariables(req, res) {
        const pages = ['CALLRESULT'];
        var connection = req.app.get('connection');
        var page = req.params.page;
        var variableList = [];

        if (page && pages.indexOf(page.toUpperCase()) === -1) {
            return res.status(400).json({ errors: ['Incorrect page, Expected 1 of :' + JSON.stringify(pages)] });
        } else {
            ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getExcludeInputTable(page), (data, error) => {
                if (error) {
                    log.error('Failed to get StandardizedData InputTable data');
                    return res.status(200).json(variableList);
                } else {
                    variableList.push(...data);
                    variableList.push(...ddCntrl.getSystemVariables(ddCntrl.getExcludeVarType(page)));
                    return res.status(200).json(variableList);
                }
            });
        }
    }

    /*
    * API for Compute Characteristic defintions data dictionary :
    * Edit ->  Summarization/Download -> Compute Chars -> definitions (SUBPROC, DETAIL, DISCRETIZE)- > combo boxes
    * 
    * */
    getComputCharsDataDictVariables(req, res) {
        const pages = ['CALLRESULT', 'SUMMARIZATION', 'DOWNLOAD'];
        var connection = req.app.get('connection');
        var page = req.params.page;
        var variableList = [];

        if (page && pages.indexOf(page.toUpperCase()) === -1) {
            return res.status(400).json({ errors: ['Incorrect page, Expected 1 of :' + JSON.stringify(pages)] });
        } else {
            ddServc.getDataDictionaryVariables(connection, req.session.dbConfig, ddCntrl.getComputeCharsInputTable(page), (data, error) => {
                if (error) {
                    log.error('Failed to get ComputChars InputTable data');
                    return res.status(200).json(variableList);
                } else {
                    variableList.push(...data);
                    variableList.push(...ddCntrl.getSystemVariables(ddCntrl.getComputeCharsVarType(page)));
                    return res.status(200).json(variableList);
                }
            });
        }
    }

    /* API for Edit-> ScoreCards-> Set Analysis Characteristics -> Data Dictionary grid */
    getAnalysisCharData(req, res) {
        var connection = req.app.get('connection');
        ddServc.getAnalysisCharData(connection, req.session.dbConfig, (data, error) => {
            if (error) {
                return res.json({ errors: ['Failed to get AnalysisChar Data Dictionary'] });
            } else {
                return res.status(200).json(data);
            }
        });
    }
}

const ddCntrl = new DataDictionaryCntrl();
module.exports = ddCntrl;