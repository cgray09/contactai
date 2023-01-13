import React from 'react';
import _ from "lodash";


// This service holds common generic functions that may be used by a wide variety of components


export const commonService = {
    openModal,
    closeModal,
    getResponseErrors,
    formatErrorMessage,
    inlineGridChangesMade,
    isPopulated,
    populateCharDetails,
    itemNameAvailable,
    loginResponseErrors
};

function openModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "block";
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "none";
}

function getResponseErrors(error) {
    let responseErrors = [];
    let status = null;
    if(!error){
        responseErrors.push("Unspecified Error has Occured");
    }
    else if (!error.response) {
        if (error.message) {
            responseErrors.push(error.message);
        }
    }
    else {
        status = error.response.status;
        if (status === 423) {
            openModal("recordLockModal");  //display default message
            return responseErrors; // no need to set server's error message
        }
        if (error.response.data) {
            if (error.response.data.errors) {
                responseErrors = error.response.data.errors;
            }
            else if (error.response.data.error) {
                if (hasStringMessage(error.response.data.error.hint)) {
                    responseErrors.push(error.response.data.error.hint)
                }
                else if (hasStringMessage(error.response.data.error)) {
                    responseErrors.push(error.response.data.error);
                }

            }
            else if (hasStringMessage(error.response.data.message)) {
                responseErrors.push(error.response.data.message);
            }
            else {
                if (hasStringMessage(error.response.data)) {
                    responseErrors.push(error.response.data);
                }
            }
        }
    }
    if (responseErrors.length < 1) {
        let item = "Unspecified Error has Occured: " + status;
        responseErrors.push(item);
    }
    return responseErrors;
}

function loginResponseErrors(error) {
    if(!error) return "Unspecified Error has Occured";
    let response = error.response;
    if (response) {
        if (response.data && response.data.message) {
            return response.data.message;
        }
        else if (response.statusText) {
            return response.statusText;
        }
        else if (response.status) {
            return "Request failed with status " + response.status;
        }
    }
    if (error.message) {
        return error.message
    }
    else {
        return "An unspecified error has occured"
    }
}

const hasStringMessage = (message) => {
    if(message && typeof message === "string"){
      return true;
    }
    return false
  }

function formatErrorMessage(errorMsg) {
    let formattedMsg = <div>
        {errorMsg.split("\n").map((i, key) => {
            return <div key={key}>{i}<br /></div>;
        })}
    </div>
    return formattedMsg;
}

function isPopulated(value) {
    if (value) {
        return true;
    }
    return false;
}

function inlineGridChangesMade(currentItem, data) {
    let prevItem = findItemById(currentItem.id, data);
    if (typeof currentItem.inEdit !== 'undefined') {
        //if inEdit field is set on the current item, it means the user clicked "edit" on its row in the grid. However it doesn't necessarily mean they made changes
        //But the prevItem will never have the inEdit field, meaning that the compare will automatically think the row has been changed
        //so we set prevItem's inEdit field to the currentItem inEdit value so we only compare the other fields for real changes and don't flag differences in inEdit field
        prevItem.inEdit = false;
        currentItem.inEdit = false;
    }
    return !_.isEqual(prevItem, currentItem);
}

function findItemById(id, data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            return data[i];
        }
    }
    return null;
}

function populateCharDetails(chars) {
    let sak = chars.SAKData;
    let acct = chars.acctMastData;
    let genVar = chars.genVarData;
    let hist = chars.histData;
    return sak.concat(acct, genVar, hist);
}

function itemNameAvailable(submittedItem, data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].name?.toUpperCase() === submittedItem.name.toUpperCase() &&
            data[i].id !== submittedItem.id) {
            return true;
        }
        if( i === data.length) return false; // entire array checked.
    }   
}

//TO-DO: Update these to validatate based on CT Admin expectations
function validateDataType(operand, type, operator) {
    if (type === 3) {
        let operandCharType = this.getDDCharType(operand);
        let numericOperators = ["=", "<>", "<", "<=", ">", ">=", "*", "+", "-"];
        let operandIsNumeric = this.isNumericCharType(operandCharType);
        if (numericOperators.includes(operator)) {
            if (!operandIsNumeric) {
                return { isValid: false, expectedType: "numeric", actualType: "character" };
            }
        }
        else {
            //no need to validate if operator is null or not null
            if (operator === "IN SET" || operator === "NOT IN SET") {
                if (operandCharType && operandIsNumeric) {
                    return { isValid: false, expectedType: "character", actualType: "numeric" };
                }
            }
        }
    }
    return { isValid: true, expectedType: null, actualType: null };
}

function getDDCharType(operand) {
    let charDetails = this.state.charDetails;
    for (let charDetail of charDetails) {
        if (charDetail.value === operand) {
            return charDetail.type;
        }
    }
    return null;
}