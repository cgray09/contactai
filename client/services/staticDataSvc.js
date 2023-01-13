import React from 'react';
import _ from "lodash";
import { FormattedMessage } from 'react-intl';

export const staticDataSvc = {
    getFileFormatTypes,
    getKeepCharTypes,
    getFormatters,
    getSpecialInfo,
    fileFormatTitleId,
    fileFormatNavHistory,
    excludeTitleId,
    excludeNavHistory,
    getCharTypes,
    computeCharTitleId,
    computeCharNavHistory,
    getComputeDefModal,
    getSubProcComparators,
    getDisplay2HeaderLabelIds,
    logicRuleEditTitleId,
    logicRuleEditSetValLabelId,
    getReservedWords
};

function getFileFormatTypes() {
    return ['CHAR','NUMERIC'];
}

function getReservedWords() {
    return ['REGION', 'DIALER', 'STATUS', 'RANDOM', 'RANDOMV', 'OTHER_DATA', 'RESULT'];
}

function getKeepCharTypes() {
    return ['CHARACTER','NUMERIC'];
}

function getFormatters(){
    let formatters = [
        'DATE->YYYY*MM*DD',
        'DATE->YYYYMMDD',
        'DATE->YYYYDDD',
        'DATE->YY*MM*DD',
        'DATE->YYMMDD',
        'DATE->MM*DD*YY',
        'DATE->MM*DD*YYYY',
        'DATE->MMDDYYYY',
        'DATE->MMDDYY',
        'DATE->MM*YY',
        'DATE->MMYY',
        'DATE->DD*MM*YY',
        'DATE->DD*MM*YYYY',
        'DATE->DDMMYYYY',
        'DATE->CCCMMDD',
        'TIME->HH*MM*SS',
        'TIME->HHMMSS',
        'TIME->HH*MM',
        'TIMEX->HH*MM*SS',
        'TIMEX->HH*MM',
        'TIME->HHMM',
        'DURATION->HH*MM*SS',
        'DURATION->HHMMSS',
        'DURATION->HH*MM',
        'DURATION->MM',
        'DURATION->HHMM',
        'DOB DATE->YYMMDD',
        'JULIAN->DDD',
        'STATUS',
        'Valid Numeric'
    ];
    return formatters;
}

function getSpecialInfo(){
    let specialInfo = [
        'Ends w/ Newline',
        'Key Field',
        'Zip Code',
        'Phone 1',
        'Phone 2',
        'Phone 3',
        'Phone 4',
        'Phone 5',
        'Phone 6',
        'Phone 7',
        'Phone 8',
        'Phone 9',
        'Phone 10',
        'Phone 11',
        'Phone 12',
        'Phone 13',
        'Phone 14',
        'Phone 15',
        'Phone 16',
        'Phone 17',
        'Phone 18',
        'Phone 19',
        'Phone 20',
    ];
    return specialInfo;
}

function fileFormatTitleId(page){
    page = page ? page.toUpperCase() : page;
    switch(page){
        case "CALLRESULT" :
            return "fileFormat.callResults";
        case "DLFILEFORMAT" :
            return "fileFormat.download";
        case "DLSUPPFILEFORMAT" :
            return "fileFormat.downloadSupp";
        case "ASSIGNMENT" :
            return "fileFormat.assignDialerOutput";
        default:
            return "fileFormat.fileFormat";
    }
}

function fileFormatNavHistory(page){
    page = page ? page.toUpperCase() : page;
    switch(page){
        case "CALLRESULT" :
            return [{ url: "/Home", label: "Home" }, { url: "/CallResultsHome", label: "Call Results" }];
        case "DLFILEFORMAT" :
            return [{ url: "/Home", label: "Home" }, { url: "/DownloadHome", label: "Downloads" }];
        case "DLSUPPFILEFORMAT" :
            return [{ url: "/Home", label: "Home" }, { url: "/DownloadHome", label: "Downloads" }];
        case "ASSIGNMENT" :
            return [{ url: "/Home", label: "Home" }, { url: "/AssignmentHome", label: "Assignment" }];
        default:
            return [{ url: "/Home", label: "Home" }];
    }
}

function excludeTitleId(page){
    page = page ? page.toUpperCase() : page;
    switch(page){
        case "CALLRESULT" :
            return "exclude.crExcludeRecords";
        case "DOWNLOAD" :
            return "exclude.dlExcludeRecords";
        case "SCORECARDS" :
            return "exclude.excludeSPs";
        default:
            return "exclude.excludeRecords";
    }
}

function excludeNavHistory(page){
    page = page ? page.toUpperCase() : page;
    switch(page){
        case "CALLRESULT" :
            return [{ url: "/Home", label: "Home" }, { url: "/CallResultsHome", label: "Call Results" }];
        case "DOWNLOAD" :
            return [{ url: "/Home", label: "Home" }, { url: "/DownloadHome", label: "Downloads" }];
        case "SCORECARDS" :
            return [{ url: "/Home", label: "Home" }, { url: "/ScorecardsHome", label: "Scorecards" }];
        default:
            return [{ url: "/Home", label: "Home" }];
    }
}

function getCharTypes(page) {
    page = page ? page.toUpperCase() : page;
    if(page == "SUMMARIZATION"){
        return ['AVERAGE','COUNT_OF', "DAYS_SINCE", "DETAIL", "DISCRETIZE", "RATIO", "ROUND", "SUM", "VALUE_OF"];
    }
    else if(page == "DOWNLOAD"){
        return ['AVERAGE', "DETAIL", "DISCRETIZE", "EVAL", "RATIO", "ROUND", "DAYS_SINCE"];
    }
    return [];
}

function computeCharTitleId(page){
    page = page ? page.toUpperCase() : page;
    switch(page){
        case "SUMMARIZATION" :
            return "computeChars.sumComputeChars";
        case "DOWNLOAD" :
            return "computeChars.dlComputeChars";
        default:
            return "computeChars.computeChars";
    }
}

function computeCharNavHistory(page){
    page = page ? page.toUpperCase() : page;
    switch(page){
        case "SUMMARIZATION" :
            return [{ url: "/Home", label: "Home" }, { url: "/summarizationhome", label: "Summarization" }];
        case "DOWNLOAD" :
            return [{ url: "/Home", label: "Home" }, { url: "/DownloadHome", label: "Downloads" }];
        default:
            return [{ url: "/Home", label: "Home" }];
    }
}

//Based on the compute characteristic type, return the proper modal to display for its details/definitions
function getComputeDefModal(type){
    if(type.toUpperCase() == "DETAIL" || type.toUpperCase() == "DISCRETIZE"){
        return "displaySQL"
    }
    else{
        return "displaySubProc";
    }
}

function getSubProcComparators(){
    return ["eq", "==", "GT", ">", "LT", "<", "GE", ">=", "LE", "<=", "ne", "<>",];
}

function getDisplay2HeaderLabelIds(type){
    switch(type){
        case "DAYS_SINCE": return "computeChars.daysSince";
        case "COUNT_OF": return "computeChars.countOf";
        case "VALUE_OF": return "computeChars.valueOf";
        case "SUM": return "computeChars.sum";
        default: return "";
    }
}

function logicRuleEditTitleId(page) {
    switch(page){
        case "SEGMENTPOPULATION": return "download.segmentPopulation";
        case "SAMPLEPOINT": return "scorecards.includeSamplePoints";
        case "ASSIGNMENT": return "scorecards.assignScorecards";
        default: return "";
    }
}

function logicRuleEditSetValLabelId(page) {
    switch(page){
        case "SEGMENTPOPULATION": return "download.popNumSetTo";
        case "SAMPLEPOINT": return "scorecards.IncludeExcludeSetTo";
        case "ASSIGNMENT": return "scorecards.scoreIdEqual";
        default: return "";
    }
}

