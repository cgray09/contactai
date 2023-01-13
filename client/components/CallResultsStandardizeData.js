import React from 'react';
import { Input } from "@progress/kendo-react-inputs";
import { Button } from '@progress/kendo-react-buttons';
import { Error } from "@progress/kendo-react-labels";
import { connect } from 'react-redux';
import { ContentBox, Footer } from './';
import { sqlBuilderSvc } from "../services/sqlBuilderSvc";
import { commonService } from '../services/commonSvc.js';
import GridForm from '../commonsweb/js/Grid/GridForm';
import SQLBuilderModal from './SQLBuilderModal';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import CopyModal from './CopyModal'
import CommitModal from './Modals/CommitModal';
import { FormattedMessage } from 'react-intl';
import { setValidation, clearValidation } from '../actions/validation';
import axios from "axios";
axios.defaults.withCredentials = true;

const ValidationCell = props => {
    const handleOnChange = e => {
        props.onChange({
            dataItem: props.dataItem,
            field: props.field,
            syntheticEvent: e.syntheticEvent,
            value: e.value
        });
    };
    return (
        <td>
            {props.dataItem.inEdit ? (<Input
                required
                value={props.dataItem[props.field]}
                onChange={handleOnChange}
            />) : (
                props.dataItem[props.field].toString()
            )}
            {!props.validationLogic(props.dataItem[props.field]) && <Error>Cannot be empty</Error>}
        </td>
    );
};

class CallResultsStandardizeData extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            sqlInFocus: [],
            selectedItem: {},
            responseErrors: [], //response errors from submitting item
            sqlResponseErrors: [], //response errors from submitting sql
            charDetails: [], //TO-DO: Remove this if not validating char types for CT Admin
            isNewSQL: false,
            actionCompleted: true, //used for loading indicator
            sqlSubmitted: false,
            submitError: null,
            displaySQL: false,
            lockOn: false,
            editMode: false
        }
    }

    navHistory = [{ url: "/Home", label: "Home" }, { url: "/CallResultsHome", label: "Call Results" }]

    componentDidMount() {
        this._isMounted = true;
        //TO-DO: Uncomment the fetch functions below and remove the dummy data
        // this.fetchCharDetails();
        this.fetchData();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    route = (url) => {
        this.props.history.push(url);
    }

    //TO-DO: Remove this if not validating data types for the operands
    fetchCharDetails = () => {
        axios
            .get("/api/dataDictionary/detail")
            .then(response => {
                if (this._isMounted) {
                    let charDetails = commonService.populateCharDetails(response.data);
                    this.setState({ charDetails });
                }
            })
            .catch(error => {
                console.log("error retrieving char details");
                // this.handleResponseErrors(error);
            });
    }

    fetchData = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/callResults")
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        data: response.data,
                        responseErrors: [],
                        actionCompleted: true
                    });
                }                
            })
            .catch(error => {
                if ((error && error.response) && error.response.status === 401) {
                    console.log("User is unauthorized. Routing back to login");
                    this.route("/");
                }
                this.handleResponseErrors(error);
            });
    }

    getItem = (item) => {
        // this call is required despite inline edit to acquire lock.
        axios
            .get("/api/callResults/" + item.id)
            .then(response => {
                this.setState({ lockOn: false, editMode: true });
            })
            .catch(error => {
                this.handleResponseErrors(error);
                this.setState({ lockOn: true });
            });
    }

    commitInlineChanges = (submittedData) => {
        if (this.isValidSubmission(submittedData)) {
            submittedData.map(item =>
                item.isNew ? this.saveItem(item) : this.updateItem(item)
            );
            return true;
        }
        else {
            return false;
        }
    }

    saveItem = (selectedItem) => {

        let item = {
            "name": selectedItem.name,
            "generateName": "UL_generate",
            "description": selectedItem.description,
            "index": selectedItem.index,
            "lineNum": selectedItem.lineNum,
        }

        this.setState({ actionCompleted: false });
        axios
            .post("/api/callResults/", item)
            .then(response => {
                this.handleSuccessfulSubmission()
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    id = null;
    openCopyModal = (selectedItem) => {
        this.id = selectedItem.id;
        commonService.openModal("copyModal");
    }

    copyItem = (name) => {
        let reqBody = {};
        reqBody.name = name;
        this.setState({ actionCompleted: false });
        axios
            .post("/api/callResults/" + this.id + "/copy", reqBody)
            .then(response => {
                this.handleSuccessfulSubmission()
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
        commonService.closeModal("copyModal");
    }

    updateItem = (item) => {
        let inEdit = item.inEdit;
        if (commonService.inlineGridChangesMade(item, this.state.data)) {
            this.setState({ actionCompleted: false });
            axios
                .put("/api/callResults/" + item.id, item)
                .then(response => {
                    this.handleSuccessfulSubmission()
                })
                .catch(error => {
                    this.handleResponseErrors(error);
                });
        } else {
            if (inEdit) this.releaseLock(item.id);
        }
    }

    delete = (selectedItem) => {
        this.setState({ actionCompleted: false });
        axios
            .delete("/api/callResults/" + selectedItem.id)
            .then(response => {
                this.handleSuccessfulSubmission();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    isValidSubmission = (submittedData) => {
        this.props.clearValidation();
        let hasErrors = false;
        for (let i = 0; i < submittedData.length; i++) {
            if (submittedData[i].inEdit === true) {
                if (!submittedData[i].name) {
                    this.props.setValidation("Row(s) exist with missing name field.");
                    hasErrors = true;
                }
                else {
                    //duplicate name.
                    if (commonService.itemNameAvailable(submittedData[i], submittedData)) {
                        var msg = submittedData[i].name + ", is a duplicate name.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                    // Length validation.
                    if (submittedData[i].name.length > 50) { 
                        var msg = submittedData[i].name + ", is longer than 50 characters.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                    // Cant start with digit or space validation
                    if ((submittedData[i].name.match(/^\d/) || submittedData[i].name.match(/^\s/))) { 
                        var msg = submittedData[i].name + ", characteristic name cannot start with a digit or space.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                }                
            }
        }
        if (hasErrors) {
            commonService.openModal("commitModal");
            // Once all commit validations are switched over to redux, we should be able to able to get rid of submitError here as well as in the GridForm.js
            this.setState({ submitError: hasErrors });
        }
        return !hasErrors;        
    }

    //--------------------------------------------------------- SQL BUILDER FUNCTIONS -----------------------------------------------------------------------------------
    getAssociatedSql = (selectedItem) => {
        this.setState({ actionCompleted: false, selectedItem });
        axios
            .get("/api/callResults/" + selectedItem.id + "/definitions")
            .then(response => {
                this.openAndPopulateSQLBuilder(selectedItem, response.data);
            })
            .catch(error => {
                if (error && error.response && error.response.status === 404) {
                    this.openAndPopulateSQLBuilder(selectedItem, null);
                }
                else {
                    this.handleResponseErrors(error);
                }
            });
    }

    openAndPopulateSQLBuilder = (selectedItem, sqlInFocus) => {
        let isNewSQL = false;
        if (!sqlInFocus || sqlInFocus.length < 1) {
            isNewSQL = true;
            sqlInFocus = sqlBuilderSvc.getDefaultSql();
        }
        else {
            sqlInFocus = sqlBuilderSvc.parseLogicGroupDataModel(sqlInFocus);
        }
        this.setState({
            isNewSQL, selectedItem, sqlInFocus, sqlResponseErrors: [],
            responseErrors: [], actionCompleted: true, displaySQL: true
        });
    }

    resetSQL = () => {
        if (this._isMounted) {
            this.releaseLock(this.state.selectedItem.id);
            this.setState({
                sqlSubmitted: false,
                sqlInFocus: []
            });
        }
    }

    updateSqlInFocus = (sqlInFocus) => {
        this.setState({ sqlInFocus });
    }

    handleDetailChange = (groupIndex, rowIndex, data) => (e) => {
        let sqlInFocus = [...this.state.sqlInFocus];
        let logicGroup = { ...sqlInFocus[groupIndex] };
        if(e.target.name == 'equals'){
            logicGroup.equals = e.target.value; //make change at group level
        }
        else{
            logicGroup.logicLines[rowIndex][e.target.name] = e.target.value; //make change at row level
            if(e.target.name === 'operand1') {      //check if operand1 was modified
                if(data.includes(e.target.value)) {  //check if changed value is a Characteristic value (not literal)
                    logicGroup.logicLines[rowIndex]['operand1Type'] = 3  //set operand1Type to 3 - Characteristic
                } else {
                    logicGroup.logicLines[rowIndex]['operand1Type'] = 1  //set operand1Type to 1 - literal
                }
            }
            if(e.target.name === 'operand2') {      //check if operand2 was modified
                if(data.includes(e.target.value)) {  //check if changed value is a Characteristic value (not literal)
                    logicGroup.logicLines[rowIndex]['operand2Type'] = 3 //set operand1Type to 3 - Characteristic
                } else {
                    logicGroup.logicLines[rowIndex]['operand2Type'] = 1  //set operand1Type to 1 - literal
                }
            }   
        }
        
        sqlInFocus[groupIndex] = logicGroup;
        this.setState({ sqlInFocus });
    }

    hasValidLogicGroups = (logicGroups) => {
        for (let i = 0; i < logicGroups.length; i++) {
            if (logicGroups[i].statementType !== "else" && !sqlBuilderSvc.hasValidLogicLines(logicGroups[i].logicLines)) {
                return false;
            }
        }
        return true;
    }

    submitSQL = () => {
        this.setState({ sqlSubmitted: true });
        if (this.hasValidLogicGroups(this.state.sqlInFocus)) {
            let sql = null;
            sql = sqlBuilderSvc.reverseParseLogicGroupDataModel(this.state.sqlInFocus);
            this.saveSQL(this.state.selectedItem.id, sql);
        }
    }

    saveSQL = (id, sql) => {
        this.setState({ actionCompleted: false });
        if (this.state.isNewSQL) {
            axios
                .post("/api/callResults/" + id + "/definitions", sql) 
                .then(response => {
                    this.setState({ actionCompleted: true });
                    this.toggleModal("displaySQL");
                })
                .catch(error => {
                    this.handleResponseErrors(error, true);
                });
        }
        else {
            this.updateSQL(id, sql);
        }
    }

    updateSQL = (id, sql) => {
        axios
            .put("/api/callResults/" + id + "/definitions", sql)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.toggleModal("displaySQL");
            })
            .catch(error => {
                this.handleResponseErrors(error, true);
            });
    }

    //--------------------------------------------------------- UTILITY FUNCTIONS -----------------------------------------------------------------------------------

    resetForm = () => {
        this.setState({
            sqlInFocus: [],
            selectedItem: {},
            responseErrors: [],
            sqlResponseErrors: [],
            isNewSQL: false,
            actionCompleted: true,
            sqlSubmitted: false,
            submitError: null,
            editMode: false
        })
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            this.fetchData();
            this.resetForm();
        }
    }

    handleResponseErrors = (error, isSqlError) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            if (isSqlError) {
                this.setState({ sqlResponseErrors: responseErrors, actionCompleted: true });
            }
            else {
                this.setState({ responseErrors, actionCompleted: true });
            }
        }
    }

    releaseLock = (id) => {
        if (typeof id !== "undefined" && id !== null) { // doing this instead of if (id) check coz found id with 0 value in test DB
            axios
                .post("/api/callResults/" + id + "/releaseLock") 
                .then(response => { })
                .catch(error => {
                    this.handleResponseErrors(error, false);
                });
        }
    }

    releaseLocks = (data) => {
        data.map(item => {
            if (item.inEdit && !item.isNew) {
                this.releaseLock(item.id);
            }   
        });        
    }

    getAdditionalButtons = (selectedItem) => {
        let buttons = [];
        buttons.push(<Button key={1} onClick={() => this.getAssociatedSql(selectedItem)}>SQL Builder</Button>);
        return buttons;
    }

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------

    MyValidationCell = (props) => <ValidationCell {...props} validationLogic={commonService.isPopulated} />

    columns = [
        { title: "Name", field: 'name', filter: 'text', show: true, cell: this.MyValidationCell },
        { title: "Description", field: 'description', filter: 'text', show: true },
    ];

    goBack = () => {
        this.props.history.goBack();
    }

    toggleModal = (modalName) => {
        this.setState({ [modalName]: ![modalName] });
        if (modalName == "displaySQL") {
            this.resetSQL();
            this.releaseLock(this.state.selectedItem.id); // release lock for selected item
        }
    }

    headerButtons =
        <div className="actions">
            <Button onClick={this.goBack}>
                <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>

    render() {
        return (
            <div>
                <ContentBox titleId="callResults.standardizedData" divId="assignScorecards" navHistory={this.navHistory} footerButtons={this.headerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <Error>{this.state.submitError}</Error>
                    <GridForm
                        data={this.state.data}
                        columns={this.columns}
                        getItem={this.getItem}
                        copyItem={this.openCopyModal}
                        delete={this.delete}
                        getAdditionalButtons={this.getAdditionalButtons}
                        viewOnly={this.props.viewOnly} 
                        actionCompleted={true} //TO-DO make dynamic
                        enableInlineEdits={true}
                        commitInlineChanges={this.commitInlineChanges}
                        deleteConfDivId="deleteStandardizeDataConf"
                        deleteConfTitleId="action.confirm"
                        deleteConfMessageId="sqlBuilder.deleteConfirmation"
                        customCell={this.MyValidationCell}
                        submitError={this.state.submitError}
                        resetForm={this.resetForm}
                        hideEdit={this.props.viewOnly}
                        hideCopy={true} //TO-DO future release
                        hideDelete={this.props.viewOnly}
                        draggable={true}
                        apiUrl="/api/callResults/"
                        fetchData={this.fetchData}
                        releaseLocks={this.releaseLocks}
                        lockOn={this.state.lockOn}
                        editMode={this.state.editMode}
                    />
                    <SQLBuilderModal
                        {...this.state}
                        page={this.props.page}
                        dataDictURI='standardizedData/'
                        sqlBuilderStyle={1}
                        name={this.state.selectedItem.name}
                        logicGroups={this.state.sqlInFocus}
                        updateSqlInFocus={this.updateSqlInFocus}
                        handleDetailChange={this.handleDetailChange}
                        submitSQL={this.submitSQL}
                        toggleModal={this.toggleModal}
                        sqlResponseErrors={this.state.sqlResponseErrors}
                        viewOnly={this.props.viewOnly}
                    />
                </ContentBox>
                {/* T0-DO: Update viewOnly to be set dynamically */}
                <CopyModal copy={this.copyItem} itemList={this.state.data} viewOnly={false} />
                <CommitModal />
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                {this.props.footer}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    validation: state.validation
});

export default connect(mapStateToProps, { setValidation, clearValidation })(CallResultsStandardizeData);