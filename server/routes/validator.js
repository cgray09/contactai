//const { query } = require('express');
const { body, check, param } = require('express-validator');

const frequency = ['Weekly', 'Monthly'];
const timezones = ['Atlantic', 'Eastern', 'Central', 'Mountain', 'Pacific', 'Alaska', 'Hawaii', 'Greenwich', 'Guam'];
exports.ffTypes = ['CHAR', 'NUMERIC'];
const keepCharTypes = ['CHARACTER', 'NUMERIC'];
const computeCharTypes = ['AVERAGE','COUNT_OF', "DAYS_SINCE", "DETAIL", "DISCRETIZE", "EVAL", "RATIO", "ROUND", "SUM", "VALUE_OF", "DAYS_SINCE"];

exports.reservedWords = ['REGION', 'DIALER', 'STATUS', 'RANDOM', 'RANDOMV', 'OTHER_DATA', 'RESULT'];

exports.SUMMCharTypes = ['AVERAGE','COUNT_OF', "DAYS_SINCE", "DETAIL", "DISCRETIZE", "RATIO", "ROUND", "SUM", "VALUE_OF"];

exports.DLCharTypes = ['AVERAGE', "DETAIL", "DISCRETIZE", "EVAL", "RATIO", "ROUND", "DAYS_SINCE"];

exports.defOperators = ["==", "!=", "<", "<=", ">", ">=", "EQ", "NE", "LT", "LE", "GT", "GE"];

exports.defOperatorTypes = ["String", "Numeric"];

exports.defConnectors = ['AND', 'OR', 'THEN', 'ELSE'];

exports.INCValues = ['INCLUDE', 'EXCLUDE'];

exports.formatters = [
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

exports.specialInfo = [
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

exports.assignsc = [
    //body('scoreId', 'scoreId cannot be empty').notEmpty(),
    //body('callHistory', 'callHistory must be a boolean').isBoolean()
];

exports.properties = [
    body('refName', 'refName cannot be empty').notEmpty(),
    body('refNameValueId', 'refNameValueId must be integer').isNumeric()
];

exports.analysisChar = [
    body('name', 'name cannot be empty').notEmpty(),
    body('source', 'source cannot be empty').notEmpty(),
    body('type', 'type cannot be empty').notEmpty(),
    body('active', ' active must be a boolean').isBoolean(),
    body('groupr', ' groupr must be a boolean').isBoolean()
];

exports.incSample = [
];

exports.segPop = [
    body('spId', 'spId cannot be empty').notEmpty()
];

exports.env = [
    body('name', 'Name cannot be empty').notEmpty(),
    body('active', 'active must be a boolean').isBoolean(),
    body('runPreSummFlag', 'runPreSummFlag must be a boolean').isBoolean(),
    body('runUploadFlag', 'runUploadFlag must be a boolean').isBoolean(),
    body('runReSummFlag', 'runReSummFlag must be a boolean').isBoolean(),
    body('runDownloadFlag', 'runDownloadFlag must be a boolean').isBoolean(),
    body('runScoreCardFlag', 'runScoreCardFlag must be a boolean').isBoolean(),
    body('scheduleFreq').isIn(frequency).withMessage('scheduleFreq invalid value set'),
    body('preSummStartTime')
    .matches('^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$').withMessage('preSummStartTime must be hh:mm value'),
    body('uploadStartTime')
    .matches('^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$').withMessage('uploadStartTime must be hh:mm value'),
    body('reSummStartTime')
    .matches('^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$').withMessage('reSummStartTime must be hh:mm value'),
    body('downloadStartTime')
    .matches('^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$').withMessage('downloadStartTime must be hh:mm value'),
    body('scoreCardStartTime')
    .matches('^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$').withMessage('scoreCardStartTime must be hh:mm value')
];

exports.dialer = [
    body('name', 'Name cannot be empty').notEmpty(),
    body('timezone').isIn(timezones).withMessage('timezone invalid value set'),
    body('sunday', 'sunday must be a boolean').isBoolean(),
    body('monday', 'monday must be a boolean').isBoolean(),
    body('tuesday', 'tuesday must be a boolean').isBoolean(),
    body('wednesday', 'wednesday must be a boolean').isBoolean(),
    body('thursday', 'thursday must be a boolean').isBoolean(),
    body('friday', 'friday must be a boolean').isBoolean(),
    body('saturday', 'saturday must be a boolean').isBoolean()    
];


exports.fileformat = [
    body('name', 'Name cannot be empty').notEmpty(),
    //body('startPos', 'startPos must be valid number').isNumeric(),
    //body('endPos', 'endPos must be valid number').isNumeric()
    // .custom((value, {req}) => value >= req.body.startPos).withMessage('endPos must be greater than or equal to startPos'),
    //body('type', 'Type invalid value set').isIn(ffTypes)
];

exports.ffimport = [
    body().isArray().withMessage('Array input expected'),
    body('*.name', 'Name cannot be empty').notEmpty(),
    //body('*.startPos', 'startPos must be valid number').isNumeric(),
    //body('*.endPos', 'endPos must be valid number').isNumeric(),
    //body('*.type', 'Type invalid value set').isIn(ffTypes)    
];

exports.ffproperties = [
    body('useDelimiter', 'useDelimiter must be a boolean').isBoolean(),
    body('recordLength', 'recordLength must be a valid number').isNumeric()
];

exports.callresult = [
    body('name', 'Name cannot be empty').notEmpty()
];

//used bycallresult standardizedData definitions, exclusion definitions,
//computChar Detail and Discretize definitions. 
//If any specific validations must be added then, create its own validator array and update the routes
exports.definitions = [
    body().isArray().withMessage('Array input expected')    
];

exports.keepChar = [
    body('name', 'Name cannot be empty'),
    body('type', 'Type invalid value set').isIn(keepCharTypes),
    body('width', 'Width must be a valid number').isNumeric()
];

exports.computeChar = [
    body('name', 'Name cannot be empty'),
    body('type', 'Type invalid value set').isIn(computeCharTypes)
];