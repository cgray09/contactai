import React from 'react';
import { ContentBox } from './';
import { Button } from '@progress/kendo-react-buttons';
import { Error } from "@progress/kendo-react-labels";
import { commonService } from '../services/commonSvc.js';
import { staticDataSvc } from '../services/staticDataSvc';
import { sqlBuilderSvc } from '../services/sqlBuilderSvc';
import SQLBuilderModal from './SQLBuilderModal';
import ComputeSubProc from './ComputeSubProc';
import GridForm from '../commonsweb/js/Grid/GridForm';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import ComputeCharDropDownCell from './ComputeCharDropDownCell';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
import CommitModal from './Modals/CommitModal';
import { connect } from 'react-redux';
import { setValidation, clearValidation } from '../actions/validation';
axios.defaults.withCredentials = true;

class ComputeCharacteristics extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedItem: {},
            dataDictionary: [],
            sqlInFocus: [],
            discretizeInFocus: [],
            subProcInFocus: {},
            isNewLogic: false,
            logicSubmitted: false,
            responseErrors: [], //response errors from submitting item
            sqlResponseErrors: [],
            actionCompleted: true, //used for loading indicator
            submitError: null,
            displaySQL: false,
            displaySubProc: false,
            lockOn: false,
            editMode: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchData();
        //this.fetchDataDictionary();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    route = (url) => {
        this.props.history.push(url);
    }

    fetchDataDictionary = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/dataDictionary/")
            .then(response => {
                if (this._isMounted) {
                    this.setState({ dataDictionary: response.data });
                    this.fetchData();
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

    fetchData = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/computechars/" + this.props.page)
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
         .get("/api/computechars/" + item.id + "/" + this.props.page)
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
        this.setState({ actionCompleted: false });
        axios
            .post("/api/computechars/" + this.props.page, selectedItem)
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
            .post("/api/computechars/" + this.id + "/copy/", reqBody)
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
                .put("/api/computechars/" + item.id + "/" + this.props.page, item)
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
            .delete("/api/computechars/" + selectedItem.id + "/" + this.props.page)
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
                if (!submittedData[i].name || !submittedData[i].type) {
                    this.props.setValidation("Row(s) exist with missing field(s).");
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

    //--------------------------------------------------------- UTILITY FUNCTIONS -----------------------------------------------------------------------------------

    resetForm = () => {
        this.setState({
            selectedItem: {},
            responseErrors: [],
            actionCompleted: true,
            submitError: null,
            displaySql: false,
            editMode: false
        })
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            this.fetchData();
            this.resetForm();
        }
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    releaseLock = (id) => {       
        if (typeof id !== "undefined" && id !== null) { // doing this instead of if (id) check coz found id with 0 value in test DB
            console.log('inside if for id:' + id);
            axios
                .post("/api/computechars/" + id + "/releaseLock/" + this.props.page)
                .then(response => { })
                .catch(error => {
                    this.handleResponseErrors(error);
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

    getURL = (selectedItem) => {
        if (selectedItem.type.toUpperCase() == "DETAIL") {
            return "/api/computechars/" + selectedItem.id + "/details/" + this.props.page;
        }
        else if (selectedItem.type.toUpperCase() == "DISCRETIZE") {
            return "/api/computechars/" + selectedItem.id + "/discretize/" + this.props.page;
        }
        else {
            return "/api/computechars/" + selectedItem.id + "/subproc/" + this.props.page;
        }

    }

    getAssociatedLogic = (selectedItem) => {
        this.setState({ actionCompleted: false, selectedItem });
        axios
            .get(this.getURL(selectedItem))
            .then(response => {
                this.openAndPopulate(selectedItem, response.data);
            })
            .catch(error => {
                if ((error && error.response) && error.response.status === 404) {
                    this.openAndPopulate(selectedItem, null);
                }
                else {
                    this.handleResponseErrors(error);
                }
            });
    }

    openAndPopulate = (selectedItem, data) => {
        if (selectedItem.type == "DETAIL") {
            this.openAndPopulateSQLBuilder(selectedItem, data);
        }
        else if (selectedItem.type == "DISCRETIZE") {
            this.openAndPopulateDiscretize(selectedItem, data);
        }
        else {
            this.openAndPopulateSubProc(selectedItem, data);
        }
    }

    openAndPopulateSQLBuilder = (selectedItem, sqlInFocus) => {
        let isNewLogic = false;
        if (!sqlInFocus || sqlInFocus.length < 1) {
            isNewLogic = true;
            sqlInFocus = sqlBuilderSvc.getDefaultSql();
        }
        else {
            sqlInFocus = sqlBuilderSvc.parseLogicGroupDataModel(sqlInFocus);
        }
        let displayModal = staticDataSvc.getComputeDefModal(selectedItem.type);
        this.setState({ isNewLogic, selectedItem, sqlInFocus, sqlResponseErrors: [], responseErrors: [], actionCompleted: true, [displayModal]: true });
    }

    openAndPopulateDiscretize = (selectedItem, discretizeInFocus) => {
        let isNewLogic = !discretizeInFocus ? true : false;
        if (isNewLogic) discretizeInFocus = sqlBuilderSvc.getDefaultDiscretizeSql();
        if(discretizeInFocus) {
            //then loop thru the items and set operand1 to selectedItem.inputChar
            for(let i = 0; i < discretizeInFocus.length; i++) {
                let rule = discretizeInFocus[i];
                rule['operand1'] = selectedItem.inputChar;
                discretizeInFocus[i] = rule;
            }
        } 
        let displayModal = staticDataSvc.getComputeDefModal(selectedItem.type);
        this.setState({ isNewLogic, selectedItem, discretizeInFocus, sqlResponseErrors: [], responseErrors: [], actionCompleted: true, [displayModal]: true });
    }

    openAndPopulateSubProc = (selectedItem, subProcInFocus) => {
        let isNewLogic = !subProcInFocus ? true : false;
        subProcInFocus = subProcInFocus != null ? subProcInFocus : { actChar: null, anchor: null, defName: this.state.selectedItem.defName };
        this.setState({ isNewLogic, selectedItem, subProcInFocus, sqlResponseErrors: [], responseErrors: [], actionCompleted: true, displaySubProc: true });
    }

    updateSqlInFocus = (sqlInFocus) => this.setState({ sqlInFocus });

    updateDiscretize = (discretizeInFocus) => this.setState({ discretizeInFocus });

    handleDetailChange = (groupIndex, rowIndex, data) => (e) => {
        let sqlInFocus = [...this.state.sqlInFocus];
        let logicGroup = { ...sqlInFocus[groupIndex] };
        if (e.target.name == 'equals') {
            logicGroup.equals = e.target.value; //make change at group level
        }
        else {
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

    handleDiscretizeChange = (index) => (e) => {
        let discretizeInFocus = [...this.state.discretizeInFocus];
        //if e.target.name is 'operand1' then loop and update all logicRules to set operand1 to e.target.value.
        if(e.target.name === 'operand1') {
            for(let i = 0; i < discretizeInFocus.length; i++) {
                let rule = discretizeInFocus[i];
                rule['operand1'] = e.target.value;
                discretizeInFocus[i] = rule;
            }
        } else {
            let rule = { ...discretizeInFocus[index] };
            rule[e.target.name] = e.target.value;
            discretizeInFocus[index] = rule;
        }
        this.setState({ discretizeInFocus });
    }

    hasValidLogicGroups = (logicGroups) => {
        for (let i = 0; i < logicGroups.length; i++) {
            if (logicGroups[i].statementType !== "else" && !sqlBuilderSvc.hasValidLogicLines(logicGroups[i].logicLines)) {
                return false;
            }
        }
        return true;
    }

    submitDiscretize = () => {
        let discretize = [...this.state.discretizeInFocus];
        this.setState({ logicSubmitted: true });
        if (sqlBuilderSvc.hasValidDiscretizeLogic(discretize)) {
        
            this.setState({ actionCompleted: false });
            discretize.map((item, index) => item.lineNum = index + 1)
            axios
                .post("/api/computechars/" + this.state.selectedItem.id + "/discretize/" + this.props.page, discretize)
                .then(response => {
                    this.setState({ actionCompleted: true });
                    this.toggleModal(staticDataSvc.getComputeDefModal(this.state.selectedItem.type));
                    this.fetchData();
                })
                .catch(error => {
                    console.log(error);
                    this.handleResponseErrors(error);
                });
        }
    }

    submitSQL = () => {
        this.setState({ logicSubmitted: true });
        if (this.hasValidLogicGroups(this.state.sqlInFocus)) {
             let sql = null;
             sql = sqlBuilderSvc.reverseParseLogicGroupDataModel(this.state.sqlInFocus);
             this.updateSQL(sql);
        }
    }

    updateSQL = (sql) => {
        this.setState({ actionCompleted: false });
        axios
            .post("/api/computechars/" + this.state.selectedItem.id + "/details/" + this.props.page, sql)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.toggleModal(staticDataSvc.getComputeDefModal(this.state.selectedItem.type));
            })
            .catch(error => {
                this.handleResponseErrors(error, true);
            });
    }

    resetSQL = () => {
        if (this._isMounted) {
            this.setState({
                logicSubmitted: false,
                sqlInFocus: [],
                discretizeInFocus: [],
                sqlResponseErrors: [],
                responseErrors: []
            });
        }
    }

    getAdditionalButtons = (selectedItem) => {
        let buttons = [];
        buttons.push(<Button key={1} onClick={() => this.getAssociatedLogic(selectedItem)}>SQL Builder</Button>);
        return buttons;
    }

    getArrayOfAllChars = (dd) => {
        if (!dd) return [];

        let sak = dd.SAKData;
        let acct = dd.acctMastData;
        let genVar = dd.genVarData;
        let hist = dd.histData;

        sak = !sak ? [] : sak;
        return sak.concat(acct, genVar, hist);
    }

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------

    CharacteristicsCell = (props) => <ComputeCharDropDownCell {...props} data={this.getArrayOfAllChars(this.state.dataDictionary)} width="400px" />
    TypeDropDownCell = (props) => <ComputeCharDropDownCell {...props} data={staticDataSvc.getCharTypes(this.props.page)} width="190px" />

    goBack = () => {
        this.props.history.goBack();
    }

    toggleModal = (modalName) => {
        this.setState({ [modalName]: ![modalName] });
        if (modalName == "displaySQL") {
            this.resetSQL();
        }
        if(modalName === "displaySQL" || modalName === "displaySubProc") {
            this.releaseLock(this.state.selectedItem.id); // release lock for selected item            
        }
    }

    render() {
        let columns = [
            { title: this.props.getLocalizedString("fileFormat.characteristicName"), field: 'name', filter: 'text', show: true, width: "400px"/*, cell: this.CharacteristicsCell*/ },
            { title: this.props.getLocalizedString("fileFormat.type"), field: 'type', filter: 'text', show: true, cell: this.TypeDropDownCell },
            { title: this.props.getLocalizedString("fileFormat.description"), field: 'description', filter: 'text', show: true, width: "600px" }
        ];

        let headerButtons =
            <div className="actions">
                <Button onClick={this.goBack}>
                    <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
                </Button>
            </div>

        return (
            <div id="cover">
                <ContentBox titleId={staticDataSvc.computeCharTitleId(this.props.page)} divId="computeCharacteristics" navHistory={staticDataSvc.computeCharNavHistory(this.props.page)} footerButtons={headerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <Error>{this.state.submitError}</Error>
                    <GridForm
                        data={this.state.data}
                        columns={columns}
                        getItem={this.getItem}
                        copyItem={this.openCopyModal}
                        delete={this.delete}
                        viewOnly={this.props.viewOnly} //TO-DO make dynamic
                        actionCompleted={true}
                        getAdditionalButtons={this.getAdditionalButtons}
                        enableInlineEdits={true}
                        commitInlineChanges={this.commitInlineChanges}
                        deleteConfDivId="deleteComputeCharConf"
                        deleteConfTitleId="action.confirm"
                        deleteConfMessageId="sqlBuilder.deleteConfirmation"
                        submitError={this.state.submitError}
                        resetForm={this.resetForm}
                        hideEdit={this.props.viewOnly}
                        hideCopy={true} //TO-DO future release
                        hideDelete={this.props.viewOnly}
                        draggable={true}
                        apiUrl="/api/computechars/"
                        fetchData={this.fetchData}
                        page={this.props.page}
                        releaseLocks={this.releaseLocks}
                        lockOn={this.state.lockOn}
                        editMode={this.state.editMode}
                    />
                    <SQLBuilderModal
                        {...this.state}
                        sqlBuilderStyle={this.state.selectedItem.type === 'DETAIL' ? 1 : 3}
                        name={this.state.selectedItem.name}
                        page={this.props.page}
                        dataDictURI='computeCharsData/'
                        logicGroups={this.state.sqlInFocus}
                        discretizeInFocus={this.state.discretizeInFocus}
                        updateSqlInFocus={this.updateSqlInFocus}
                        updateDiscretize={this.updateDiscretize}
                        handleDiscretizeChange={this.handleDiscretizeChange}
                        handleDetailChange={this.handleDetailChange}
                        submitDiscretize={this.submitDiscretize}
                        submitSQL={this.submitSQL}
                        toggleModal={this.toggleModal}
                        sqlResponseErrors={this.state.responseErrors}
                        viewOnly={this.props.viewOnly}
                        sqlSubmitted={this.state.logicSubmitted}
                    />
                    <ComputeSubProc
                        {...this.state}
                        page={this.props.page}
                        dataDictURI='computeCharsData/'
                        getLocalizedString={this.props.getLocalizedString}
                        toggleModal={this.toggleModal}
                        viewOnly={this.props.viewOnly}
                        sqlResponseErrors={this.state.responseErrors}
                    />
                </ContentBox>
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                <CommitModal /> 
                {this.props.footer}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    validation: state.validation
});

export default connect(mapStateToProps, { setValidation, clearValidation })(ComputeCharacteristics);