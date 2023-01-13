import React from 'react';
import { FormattedMessage } from 'react-intl';

// This service holds helper functions that will be used within the various sql builders


export const sqlBuilderSvc = {
    generateId,
    getDefaultOperandSet,
    getDefaultLastOperandSet,
    getDefaultSql,
    parseFuncArgs,
    updateLogicLineConnector,
    updateLogicLineParenthesis,
    hasLogicLineErrors,
    hasDiscretizeErrors,
    hasGroupErrors,
    getLogicLineErrorMessage,
    getDiscretizeLogicErrorMessage,
    getErrorMessages,
    getDiscretizeErrorMessages,
    getOperandValues,
    getStatementBlockLabel,
    getFuncAdjustedValue,
    getFuncLabel,
    getOperandLabel,
    getCharType,
    getParsedOperandType,
    hideDataDictionaryFields,
    hasBalancedParentheses,
    hasValidLogicLines,
    hasValidDiscretizeLogic,
    parseLogicGroupDataModel,
    reverseParseLogicGroupDataModel,
    adjustToLargestButtonWidth,
    setButtonWidth,
    getDefaultDiscretizeSql
};

function generateId() {
    var shortid = require('shortid');
    return shortid.generate();
}

function createLogicGroup(logicLines, equals) {
    return {
        id: generateId(),
        logicLines: [...logicLines],
        equals: equals
    }
}

function getDefaultOperandSet() {
    let id = generateId()
    return [{ id: id, operand1: '', operator: '', operand2: '', operand1Type: 0, operand2Type: 0, connector: 'AND' }]
}

function getDefaultLastOperandSet() {
    let id = generateId()
    return [{ id: id, connector: 'ELSE', type: 'else' }]
}

function getOperandValues(operandPair, operandInFocus) {
    if (operandInFocus === "operand1") {
        return { value: operandPair.operand1, type: operandPair.operand1Type };
    }
    return { value: operandPair.operand2, type: operandPair.operand2Type };
}

function parseFuncArgs(characteristic, func, funcArgs) {
    if (func === "MOD" || func === "SUBSTR") {
        let funcArgStr = "\"" + characteristic + "\"";
        for (let i = 0; i < funcArgs.length; i++) {
            funcArgStr += "@_@" + funcArgs[i];
        }
        return funcArgStr;
    }
    else if (func === "STRIPWS") {
        return "\"" + characteristic + "_\",' ',''";
    }
    else {
        return null;
    }
}

function updateLogicLineConnector(rowIndex, logicLines, value) {
    if (logicLines.length > rowIndex) {
        logicLines[rowIndex].connector = value;
    }
    return logicLines;
}

function updateLogicLineParenthesis(rowIndex, logicLines, isOpenP) {
    if (logicLines.length > rowIndex) {
        if (isOpenP) {
            let value = logicLines[rowIndex].openP;
            value = value ? "" : "(";
            logicLines[rowIndex].openP = value;
        }
        else {
            let value = logicLines[rowIndex].closeP;
            value = value ? "" : ")";
            logicLines[rowIndex].closeP = value;
        }
    }
    return logicLines;
}

function getDefaultSql() {
    let logicGroup = [
        {
            id: generateId(),
            logicLines: getDefaultOperandSet(),
            rules: getDefaultOperandSet(),
            statementType: "elseif",
        },
        {
            id: generateId(),
            logicLines: getDefaultLastOperandSet(),
            rules: getDefaultLastOperandSet(),
            statementType: "else",
        }
    ]
    return logicGroup;
}

function getDefaultDiscretizeSql() {
    let logicGroup = [
        {
            id: generateId(),
            logicLines: getDefaultOperandSet(),
            rules: getDefaultOperandSet()
        }
    ]
    return logicGroup;
}

function getFuncAdjustedValue(func, val) {
    switch (func) {
        case "MOD":
            return "MOD(" + val + ")";
        case "SUBSTR":
            return "SUBSTR(" + val + ")";
        case "STRIPWS":
            return "STRIPWS(" + val + ")";
        default:
            return val;
    }
}

function getFuncLabel(func) {
    switch (func) {
        case "MOD":
            return "mod()";
        case "SUBSTR":
            return "substr()";
        case "STRIPWS":
            return "Strip Whitespaces"
        default:
            return "none"
    }
}

function getParsedOperandType(operandType) {
    switch (operandType) {
        case 1:
            return { text: "Literal Value", id: 1 }
        case 2:
            return { text: "", id: 2 }
        case 4:
            return { text: "", id: 4 }
        case 5:
            return { text: "Result from Previous Line", id: 5 }
        default:
            return { text: "Data Dictionary", id: 3 }
    }
}

function hasGroupErrors(groups) {
    for (let i = 0; i < groups.length; i++) {
        return hasLogicLineErrors(groups[i].logicLines);
    }
    return false;
}

function hasDiscretizeErrors(lines) {
    for (let i = 0; i < lines.length; i++) {
        let err = getDiscretizeLogicErrorMessage(lines[i]);
        if(err) return true;
    }
    return false;
}

function hasLogicLineErrors(logicLines) {
    for (let i = 0; i < logicLines.length; i++) {
        let err = getLogicLineErrorMessage(logicLines[i]);
        if (err) return true;
    }
    return false;
}

function getLogicLineErrorMessage(line) {
    if (!line.operand1) {
        return getLocalizedMessage("sqlBuilder.operand1Null", "Operand 1 cannot be null");
    }
    if (line.operator !== "NULL" && line.operator !== "NOT NULL" && !line.operand2) {
        return getLocalizedMessage("sqlBuilder.operand2Null", "Operand 2 cannot be null");
    }
    if (!line.operator) {
        return getLocalizedMessage("sqlBuilder.missingOperator", "Missing Operator");
    }
    return null;
}

function getDiscretizeLogicErrorMessage(line) {
    if (!line.operand1) {
        return getLocalizedMessage("sqlBuilder.operand1Null", "Operand 1 cannot be null");
    }
    if (!line.operand2) {
        return getLocalizedMessage("sqlBuilder.operand2Null", "Operand 2 cannot be null");
    }
    /*if (!line.asgValue) {
        return getLocalizedMessage("sqlBuilder.asgValueNull", "Assigned value cannot be null");
    }*/
    return null;
}

function getErrorMessages(definitionSubmitted, logicGroups) {
    if (definitionSubmitted) {
        if (hasGroupErrors(logicGroups)) {
            return getLocalizedMessage("error.correctFields", "Please correct invalid fields");
        }
    }
    return null;
}

function getDiscretizeErrorMessages(definitionSubmitted, logicLines) {
    if (definitionSubmitted) {
        if (hasDiscretizeErrors(logicLines)) {
            return getLocalizedMessage("error.correctFields", "Please correct invalid fields");
        }
    }
    return null;
}

function getStatementBlockLabel(currentIndex, group) {
    if (currentIndex === 0) {
        return getLocalizedMessage("sqlBuilder.if", "IF");
    }
    else if (group.statementType === "elseif") {
        return getLocalizedMessage("sqlBuilder.elseif", "ELSE IF");
    }
    else {
        return getLocalizedMessage("sqlBuilder.else", "ELSE");
    }
}

function getLocalizedMessage(id, defaultMessage, values) {
    if (values) {
        return <FormattedMessage id={id} defaultMessage={defaultMessage ? defaultMessage : ""} values={values} />;
    }
    return <FormattedMessage id={id} defaultMessage={defaultMessage ? defaultMessage : ""} />;
}

function getOperandLabel(rule, isOperand1) {
    const setOperand1 = <FormattedMessage id="sqlBuilder.setOperand1" defaultMessage="Set Operand 1" />
    const setOperand2 = <FormattedMessage id="sqlBuilder.setOperand2" defaultMessage="Set Operand 2" />
    let val = getRuleValue(rule, isOperand1);
    if (!val) {
        return isOperand1 ? setOperand1 : setOperand2;
    }
    return shortenStrIfExceedsMax(val, 18);
}

function getRuleValue(rule, isOperand1) {
    let val = isOperand1 ? rule.operand1 : rule.operand2;
    return getFuncAdjustedValue(rule.detailFunc, val);
}

function shortenStrIfExceedsMax(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + "...";
    }
    return str;
}


function getCharType(char, charDetails) {
    for (let charDetail of charDetails) {
        if (charDetail.value === char) {
            return charDetail.type;
        }
    }
    return null;
}

function hideDataDictionaryFields(operandType) {
    if (operandType && operandType.id !== 3) {
        return true;
    }
    return false;
}

/* -----------------------------------------------------------VALIDATION FUNCTIONS----------------------------------------------------------------------------*/

function hasBalancedParentheses(lines) {
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].openP) {
            count++;
        }
        if (lines[i].closeP) {
            if (count === 0) {
                return false;
            }
            count--;
        }
    }
    return count === 0;
}

function hasValidLogicLines(lines) {
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].operand1 || !lines[i].operator || !lines[i].operatorType || !lines[i].operand2) {
            return false;
        }
        //TO-DO: Uncomment and implement checkForDataTypeErrors - refer to GeneratedVariable component
        // if (checkForDataTypeErrors(lines[i])) {
        //     return false;
        // }
    }
    return true;
}

function hasValidDiscretizeLogic(lines)  {
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].operand1 || !lines[i].operand2) {
            return false;
        }
    }
    return true;
}

/* -----------------------------------------------------------DATA MODEL PARSING FUNCTIONS----------------------------------------------------------------------------*/

//TO-DO: Remove when updating the parseLogicGroupDataModel function to work with CT Admin data
// function parseLogicGroupDataModel(definitions) {
//     let groups = [];
//     let lines = []; //represnets logic lines

//     let prevResultPtr = null;
//     definitions.forEach((def) => {
//         let startOfNewGroup = prevResultPtr !== def.resultPtr;
//         let isFirstGroup = startOfNewGroup && prevResultPtr === null;

//         //Temporarily set connector to default val of "AND". Value is subject to change based on
//         //if user drag/drops the logic line order or adds new logic line below it. We'll automatically assign
//         //the last logic line within a logic group the connector value of "THEN" later
//         if (def.connector === "THEN") def.connector = "AND";

//         //submit the existing logic lines to groups then clean up for next data set
//         if (startOfNewGroup) {
//             if (!isFirstGroup) {
//                 //push the previous logic group and its logic lines to the groups array
//                 let groupModel = createLogicGroup(lines);
//                 groups.push(groupModel);
//                 lines = []; //clear logic lines associated with previous group    
//             }
//             lines.push(def);
//         }
//         else {
//             lines.push(def);
//         }
//         prevResultPtr = def.resultPtr;
//     })
//     //push the last remaining logic group into groups array
//     groups.push(createLogicGroup(lines));
//     return groups;
// }

function parseLogicGroupDataModel(definitions) {
    let groups = [];
    let lines = []; //represents logic lines

    definitions.forEach((def) => {
        //server stores operand 2 value in compare field if literal value, or refName2 field if characterstic value
        let isCharacteristc = def.refName2;
        def.operand2 = isCharacteristc ? def.refName2 : def.compare;
        def.operand2Type = isCharacteristc ? 3 : 1;
        def.operatorType = getOperatorType(def.operator); //set the operator type before operator value changes for UI rendition
        def.operator = parseOperatorForUI(def.operator, isCharacteristc);
        
        lines.push(def);
        if(def.connector === 'THEN' || def.connector === 'ELSE'){
            //Temporarily set connector to "AND". This helps with drag/drop functionality.
            //The final connector in each logic group will automatically get set to "THEN" in the reverseParseLogicGroupDataModel function on submit
            def.connector = def.connector === "ELSE" ? "ELSE" : "AND";
            let groupModel = createLogicGroup(lines, def.equals);
            groupModel.statementType = "elseif";
            groups.push(groupModel);
            lines = [];
        }
    })
    
    // Check if the last line is an else statement. Set statementType appropriately.
    let lastLogicLine = groups[groups.length-1].logicLines[0];
    if ( lastLogicLine.connector == "ELSE" &&
         (!lastLogicLine.operand1 &&
         !lastLogicLine.operand2 ||
         (lastLogicLine.operand1 === "NewVar1" &&
         lastLogicLine.operand2 === "0"))) {
            groups[groups.length-1].statementType = "else";
    }
    
    return groups;
}

function reverseParseLogicGroupDataModel(definitions) {
    let lineNum = 1;
    let lines = [];

    let operand2IsString = true;
    definitions.forEach((def, groupIndex) => {
        let logicLines = def.logicLines;
        logicLines.forEach((line, lineIndex) => {
            if (line.operand2Type === 1) {
                line.compare = line.operand2;
                line.refName2 = null;
            }
            else {
                line.compare = null;
                line.refName2 = line.operand2;                
            }
            // operatorType is used to determine the type of operator.
            operand2IsString = line.operatorType === 'String' ? true : false; 
            line.operator = parseOperatorForDB(line.operator, operand2IsString);

            if (lineIndex === logicLines.length - 1) {
                line.connector = def.statementType === "else" ? "ELSE" : "THEN";
                line.equals = def.equals;
            }

            line.lineNum = lineNum;
            lines.push(line);
            lineNum++;
        })
    })

    return lines;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
}

//parse operator into proper format to store in DB
function parseOperatorForDB(operator, operand2IsString) {
    switch (operator) {
        case "equal to":
            return operand2IsString ? "EQ" : "==";
        case "not equal to":
            return operand2IsString ? "NE" : "!=";
        case "greater than":
            return operand2IsString ? "GT" : ">";
        case "greater than or equal to":
            return operand2IsString ? "GE" : ">=";
        case "less than":
            return operand2IsString ? "LT" : "<";
        case "less than or equal to":
            return operand2IsString ? "LE" : "<=";
        default:
            return operator;
    }
}

//parse operator retrieved from DB into proper format for UI SQL Builder
function parseOperatorForUI(operator) {
    if (operator === "EQ" || operator === "eq" || operator === "==") {
        return "equal to";
    }
    else if (operator === "NE" || operator === "ne" || operator === "!=") {
        return "not equal to";
    }
    else if (operator === "GT" || operator === ">") {
        return "greater than";
    }
    else if (operator === "GE" || operator === ">=") {
        return "greater than or equal to";
    }
    else if (operator === "LT" || operator === "<") {
        return "less than";
    }
    else if (operator === "LE" || operator === "<=") {
        return "less than or equal to";
    }
    return operator;
}

function getOperatorType(operator) {
    if (["==", "!=", "<", "<=", ">", ">="].indexOf(operator) === -1) {
        return 'String';
    }
    return 'Numeric';
}

function adjustToLargestButtonWidth(buttons, minWidth, maxWidth) {
    let widest = 0;
    buttons.forEach((btn) => {
        widest = getLargestButtonWidth(btn, widest, maxWidth);
    })

    if (widest !== 0) {
        //dont allow buttons to be smaller tha the specified min width
        if (widest < minWidth) widest = minWidth;
        setButtonWidth(buttons, `${widest + 5}px`);
    }
}

function getLargestButtonWidth(btn, widest, maxWidth){
    if (btn.element) {
        const width = btn.element.offsetWidth;

        if (widest < width) {
            //return the max width value if the width exceeds the max
            return width < maxWidth ? width : maxWidth;
        }
    }
    return widest; //no change
}

function setButtonWidth(buttons, width) {
    buttons.forEach((btn) => {
        if (btn.element) {
            btn.element.style.width = width;
        }
    })
}