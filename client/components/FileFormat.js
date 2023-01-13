import React from 'react';
import { connect } from 'react-redux';
import { ContentBox } from './';
import { Input } from "@progress/kendo-react-inputs";
import { Button } from '@progress/kendo-react-buttons';
import { Error } from "@progress/kendo-react-labels";
import { commonService } from '../services/commonSvc.js';
import { staticDataSvc } from '../services/staticDataSvc';
import GridForm from '../commonsweb/js/Grid/GridForm';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import CopyModal from './CopyModal';
import ValidationsModal from './Modals/ValidationsModal';
import CommitModal from './Modals/CommitModal';
import DropDownCell from '../commonsweb/js/Grid/DropDownCell.js';
import ComboBoxCell from '../commonsweb/js/Grid/ComboBoxCell.js';
import FileFormatLengthCell from './FileFormatLengthCell.js';
import FileFormatToolBar from './FileFormatToolBar.js';
import FileFormatProperties from './FileFormatProperties';
import InlineError from '../commonsweb/js/ErrorHandling/InlineError'
import axios from "axios";
import { setValidation, clearValidation } from '../actions/validation';
import NumericCell from '../commonsweb/js/Grid/NumericCell';
import FileFormatEndPosCell from './FileFormatEndPosCell';
import InformationModal from './Modals/InformationModal';

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

/* This is a generic component that is used by four different pages in the application. This includes Download -> Download File Format, Download Supplementary File Format, 
    Call Results -> File Format, and Assignment -> Dialer Output

    The component is able to differentiate between the different pages based on the "this.props.page" that is passed into the component. this.props.page matches the name
    of the api in the server that it will need to hit in the server. So when CRUD operations are performed, it will use this property to append the api url together and 
    do CRUD operations on the correct database tables
*/
class FileFormat extends React.Component {
    _isMounted = false;
    
    constructor(props) {
        super(props);
        this.state = {
            properties: {
                useDelimiter: false,
                delimiter: "",
                recordLength: 0
            },
            data: [],
            selectedItem: {},
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            submitError: null,
            displayProperties: false,
            validation: ['a'],
            lockOn: false,
            displayCreateDSInfo: false,
            newDSCount: 0,
            editMode: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        //TO-DO: Uncomment when ready to hook up grid to real data
        if(this.props.page === 'assignment') {
            this.fetchDataDictionary();
        }
        if (this.props.dialerId) {           
           this.fetchData();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.dialerId !== this.props.dialerId) {
            this.fetchData();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    route = (url) => {
        this.props.history.push(url);
    }

    fetchDataDictionary = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/dataDictionary/fileformatdata/" + this.props.page)
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

    containsSpecialChars(str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return specialChars.test(str);
    }
   
    fetchData = async () => {
        let call_modal = true;
        this.setState({ actionCompleted: false });
        axios.get("/api/fileformat/" + this.props.dialerId + "/" + this.props.page)
            .then(response => {
                if (this._isMounted) {
                    let filteredData = this.parseData(response.data);
                    this.setState({
                        data: filteredData,
                        responseErrors: [],
                        actionCompleted: true
                    });

                    if (this.props.page === 'dlfileformat') { //proceed with validation only for download file.
                        // Starts off with errors, assumes nothing is in tables. 
                        let acctnum_bool = true;
                        let zipcode_bool = true;
                        let phone_bool = true;
                        let gap = '';
                       
                        // Set to false if condition met, false meaning no error.
                        filteredData.forEach(function (arrayItem, index) {
                            if (arrayItem.name === 'ACCTNUM')
                                acctnum_bool = false;
                            if (arrayItem.name === 'ZIP_CODE' && arrayItem.specialInfo === 'Zip Code')
                                zipcode_bool = false;
                            if (arrayItem.specialInfo && arrayItem.specialInfo.includes('Phone'))
                                phone_bool = false;
                        });

                        this.props.clearValidation();
                        if (acctnum_bool) {
                            this.props.setValidation('acctnum');
                        }
                        if (zipcode_bool) {
                            this.props.setValidation('zipcode');
                        }
                        if (phone_bool) {
                            this.props.setValidation('phone');
                        }
                        if (!this.state.properties.useDelimiter) { 
                            //check for gaps only when fixed-length/non-delimited file
                            for (var i = 0; i < filteredData.length - 1; i++) {
                                if (filteredData[i + 1].startPos > (filteredData[i].endPos + 1)) {
                                    gap = "gap " + filteredData[i].name + " " + filteredData[i + 1].name;
                                    this.props.setValidation(gap);
                                }
                            }
                        }

                        // Displays trues for errors.
                        if (acctnum_bool || zipcode_bool || phone_bool || gap)
                            commonService.openModal("validationsModal");
                    }
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

    parseData = (data) => {
        if (!data || data.length === 0) return data;

        //let properties = {
        //    useDelimiter: false,
        //    delimiter: "",
        //    recordLength: 0
        //}
        let properties = this.state.properties;
        /*The first two rows returned from the server should represent the delimiter and record length
        The delimiter info will be stored in row with line num of -1 and record length with line num of 0
        So grab the index where line num is -1 and 0, and use that to retrieve the delimiter and record length*/
        let delIndex = data.map(function (row) { return row.lineNum; }).indexOf(-1);
        if (delIndex !== -1) {  
            properties.delimId = data[delIndex].id;
            properties.useDelimiter = data[delIndex].endPos === 1 ? true : false;
            properties.delimiter = data[delIndex].name;
            data.splice(delIndex, 1); //Remove delimiter info from file format data set
        }

        let recLengthIndex = data.map(function (row) { return row.lineNum; }).indexOf(0);
        if (recLengthIndex !== -1) {
            properties.recordLengthId = data[recLengthIndex].id;
            properties.recordLength = data[recLengthIndex].startPos;
            data.splice(recLengthIndex, 1); //Remove record length info from file format data set
        }
        this.setState({ properties });

        // IQ-1733 : found JPMC to have duplicate data in the DB for lineNum -1 & 0. This web version so far behaves exactly like the thick delphi client -
        // where in, it picks the first record with -1  and 0 lineNum, ignores the others.
        // We need to ensure we do not show those other duplicate records in the data grid, so need 1 more step here to delete them from grid data.
        // trying to achieve the above by looping through remaining data and remove any duplicates (with lineNum -1's and 0's)  from the data grid. 
        // Note: similar to thick client, this will only filter duplicates from the UI grid, and not modify/delete them to clean up DB data.
        let filteredData = [];
        data.forEach( (ff, idx) => {
            if(ff.lineNum !== -1 && ff.lineNum !== 0) filteredData.push(ff);  
        });
        
        return filteredData;
    }

    getItem = (item) => {
        // this call is required despite inline edit to acquire lock.
        axios
        .get("/api/fileformat/" + this.props.dialerId + "/" + this.props.page + "/" + item.id)
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
            .post("/api/fileformat/" + this.props.dialerId + "/" + this.props.page, selectedItem)
            .then(response => {
                this.handleSuccessfulSubmission();
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
            .post("/api/fileformat/" + this.id + "/copy", reqBody)
            .then(response => {
                this.handleSuccessfulSubmission();
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
                .put("/api/fileformat/" + item.id + "/" + this.props.page, item)
                .then(response => {
                    this.handleSuccessfulSubmission();
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
            .delete("/api/fileformat/" + selectedItem.id + "/" + this.props.page)
            .then(response => {
                this.handleSuccessfulSubmission();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    handleInlineChange = (e, data) => {
        return (
        data.map( item => {
            if(item.id === e.dataItem.id) {
              item[e.field] = e.value;
              if(e.field === 'endPos') {
                item.fieldLength = e.value - e.dataItem.startPos + 1;
              }
              if(e.field === 'fieldLength') {
                item.endPos = e.dataItem.startPos + e.value - 1;
              } 
              if(e.field === 'startPos') {
                item.fieldLength = e.dataItem.endPos - e.value + 1;
              }      
            }
            return item;
          })
        );        
    }

    isValidSubmission = (submittedData) => {
        let hasErrors = false;
        var format = /[ `~!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/;
        this.props.clearValidation();
        for (let i = 0; i < submittedData.length; i++) {
            if (submittedData[i].inEdit === true) {
                // required fields check
                if (!submittedData[i].name || !this.state.properties.useDelimiter && ( isNaN(submittedData[i].startPos) || isNaN(submittedData[i].endPos) ) || !submittedData[i].type) {
                    this.props.setValidation("Row(s) exist with missing field(s).");
                    hasErrors = true;
                }
                // duplicate name
                if (submittedData[i].name && commonService.itemNameAvailable(submittedData[i], submittedData)) {
                    var msg = submittedData[i].name + ", is a duplicate name.";
                    this.props.setValidation(msg);
                    hasErrors = true;
                }
                // name cant start with digit or space validation
                if (submittedData[i].name && 
                    (submittedData[i].name.match(/^\d/) || submittedData[i].name.match(/^\s/))) { 
                    var msg = submittedData[i].name + ", characteristic name cannot start with a digit or space.";
                    this.props.setValidation(msg);
                    hasErrors = true;
                }
                //startPos & endPos validations if fixed length file
                if (!this.state.properties.useDelimiter) {
                    if (submittedData[i].endPos < submittedData[i].startPos) {
                        this.props.setValidation("endPos must be greater than startPos.");
                        hasErrors = true;
                    }
                    if  (submittedData[i].enPos < 1 || submittedData[i].startPos < 1) {
                        this.props.setValidation("startPos and endPos must be greater than 0.");
                        hasErrors = true;
                    }
                    if ((submittedData[i].endPos - submittedData[i].startPos) < 0) { 
                        var msg = submittedData[i].name + ", has an invalid end position.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                    // check for zip code/phone length only when fixed length/non-delimited
                    // Zipcode length
                    if (submittedData[i].specialInfo === 'Zip Code' && (submittedData[i].endPos - submittedData[i].startPos) + 1 > 6) { 
                        var msg = submittedData[i].name + ", zip code field must be less than 6 digits in length.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                    // Phone  length validation
                    if (submittedData[i].specialInfo && submittedData[i].specialInfo.includes('Phone') 
                            && (submittedData[i].endPos - submittedData[i].startPos) + 1 !== 10) { 
                        var msg = submittedData[i].name + ", phone field is not 10 digits in length.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                }
                
                if (this.props.page === 'dlfileformat') {
                    // Zipcode validation
                    if (submittedData[i].name === 'ZIP_CODE' && submittedData[i].specialInfo !== 'Zip Code') { 
                        this.props.setValidation("ZIP_CODE must be marked as a Zip Code.");
                        hasErrors = true;
                    }
                    // Reserved words validation
                    if (submittedData[i].name && 
                            staticDataSvc.getReservedWords().indexOf(submittedData[i].name.toUpperCase()) !== -1) { 
                        var msg = submittedData[i].name + ", is a reserved keyword and must be renamed.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                    // INDEX validation
                    if (submittedData[i].name && submittedData[i].name.toUpperCase().includes('INDEX')) { 
                        var msg = submittedData[i].name + ", contains reserved word INDEX.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                    // Length validation
                    if (submittedData[i].name && submittedData[i].name.length > 32) { 
                        var msg = submittedData[i].name + ", is longer than 32 characters.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                    // Special characters validation
                    if (format.test(submittedData[i].name)) {
                        var msg = "Invalid characters detected in characteristic " + submittedData[i].name + ".";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                } else {
                    //length validation
                    if ( submittedData[i].name && submittedData[i].name.length > 50) { 
                        var msg = submittedData[i].name + ", is longer than 50 characters.";
                        this.props.setValidation(msg);
                        hasErrors = true;
                    }
                }
            }
        }

        if (hasErrors) {
            commonService.openModal("commitModal"); 
            //submitError was designed to hold commit error messages and display above the grid. 
            //with the redux validations this not required, but GridForm.js expects submitError to be set to function properly.
            //Since GridForm.js is generic and used at all places, this is a workaround to keep redux validation only in this place.
            // ONce all commit validations are switched over to redux, we should be able to able to get rid ov submitError here as well as in the GridForm.js
            this.setState({ submitError: hasErrors });
        }
        return !hasErrors;  //if hasErrors not a valid Submission
    }

    //--------------------------------------------------------- UTILITY FUNCTIONS -----------------------------------------------------------------------------------


    resetForm = () => {
        this.setState({
            selectedItem: {},
            responseErrors: [],
            actionCompleted: true,
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

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    releaseLock = (id) => {
        if (typeof id !== "undefined" && id !== null) { // doing this instead of if (id) check coz found id with 0 value in test DB
            axios
                .post("/api/fileformat/" + id + "/releaseLock/" + this.props.page)
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

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // MyValidationCell = (props) => <ValidationCell {...props} validationLogic={commonService.isPopulated} />
    NameCell = (props) => <ComboBoxCell {...props} data={this.state.dataDictionary} width="350px" />
    TypeDropDownCell = (props) => <DropDownCell {...props} data={staticDataSvc.getFileFormatTypes()} width="150px" />
    FormatterCell = (props) => <ComboBoxCell {...props} data={staticDataSvc.getFormatters()} width="200px" />
    SpecialInfoCell = (props) => <ComboBoxCell {...props} data={staticDataSvc.getSpecialInfo()} width="150px" />
    LengthCell = (props) => <FileFormatLengthCell {...props} min={1} max={99999} />
    EndPosCell = (props) => <FileFormatEndPosCell {...props} min={1} max={99999}/>
    NumericCell = (props) => <NumericCell {...props} min={1} max={99999} />

    goBack = () => {
        this.props.history.goBack();
    }

    toggleModal = () => {
        let displayProperties = this.state.displayProperties;
        this.setState({ displayProperties: !displayProperties });        
    }

    isViewOnly = () => {
        //If no dialer is selected, automatically true. Otherwise go based on the viewOnly property 
        return !this.props.dialerId ? true : this.props.viewOnly;
    }

    createDS = () => {
        this.setState({ actionCompleted: false });
        axios
            .post("/api/fileformat/" + this.props.dialerId + "/createDS/" + this.props.page)
            .then(response => {
                this.handleSuccessfulCreateDS(response.data);
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });        
    }

    toggleCreateDSModal = () => {
        let displayCreateDSInfo = this.state.displayCreateDSInfo;
        this.setState({ displayCreateDSInfo: !displayCreateDSInfo });
    }

    handleSuccessfulCreateDS = (data) => {
        this.setState({ newDSCount: data });
        this.setState({ actionCompleted: true, displayCreateDSInfo: true });
    }

    render() {

        let columns = [];
        if(this.state.properties.useDelimiter) {
            columns = [
                { title: this.props.getLocalizedString("fileFormat.characteristicName"), field: 'name', filter: 'text', show: true, width: "280px", cell: ((this.props.page === 'assignment') ? this.NameCell : null)},
                { title: this.props.getLocalizedString("fileFormat.type"), field: 'type', filter: 'text', show: true, cell: this.TypeDropDownCell },
                { title: this.props.getLocalizedString("fileFormat.formatter"), field: 'formatter', filter: 'text', show: true, width: "200px", cell: this.FormatterCell},
                { title: this.props.getLocalizedString("fileFormat.specialInfo"), field: 'specialInfo', filter: 'text', width: "150px", show: this.props.page !== "assignment", cell: this.SpecialInfoCell },
                { title: this.props.getLocalizedString("fileFormat.description"), field: 'description', filter: 'text', show: true, width: this.props.page !== "assignment" ? "390px" : "540px" }
            ];
        } else {
            columns = [
                { title: this.props.getLocalizedString("fileFormat.characteristicName"), field: 'name', filter: 'text', show: true, width: "200px", cell: ((this.props.page === 'assignment') ? this.NameCell : null)},
                { title: this.props.getLocalizedString("fileFormat.start"), field: 'startPos', filter: 'text', editor: 'numeric', show: true, width: "100px", cell: this.NumericCell },
                { title: this.props.getLocalizedString("fileFormat.end"), field: 'endPos', filter: 'text', editor: 'numeric', show: true, width: "100px", cell: this.EndPosCell},
                { title: this.props.getLocalizedString("fileFormat.length"), field: 'fieldLength', filter: 'text', editor: 'numeric', show: true, cell: this.LengthCell, width: "75px" },
                { title: this.props.getLocalizedString("fileFormat.type"), field: 'type', filter: 'text', show: true, cell: this.TypeDropDownCell, width: "75px" },
                { title: this.props.getLocalizedString("fileFormat.formatter"), field: 'formatter', filter: 'text', show: true, cell: this.FormatterCell, width: "175px" },
                { title: this.props.getLocalizedString("fileFormat.specialInfo"), field: 'specialInfo', filter: 'text', show: this.props.page !== "assignment", width: "100px", cell: this.SpecialInfoCell },
                { title: this.props.getLocalizedString("fileFormat.description"), field: 'description', filter: 'text', show: true, width: this.props.page !== "assignment" ? "295px" : "395px" }
            ];
        }
        
        let gridToolBar = <FileFormatToolBar
            data={this.state.data}
            dialerId={this.props.dialerId}
            page={this.props.page}
            fetchData={this.fetchData}
            properties={this.state.properties}
            toggleModal={this.toggleModal}
            viewOnly={this.isViewOnly()} 
            createDS={this.createDS}/>

        let footerButtons =
            <div className="actions">
                <Button onClick={this.goBack}>
                    Go Back
                </Button>
            </div>

        return (
            <div id="cover">
                <ContentBox titleId={staticDataSvc.fileFormatTitleId(this.props.page)} divId="fileFormat" navHistory={staticDataSvc.fileFormatNavHistory(this.props.page)} footerButtons={footerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    {/* <Error>{this.state.submitError}</Error> */}
                    <InlineError errorMessage={!this.props.dialerId ? this.props.getLocalizedString("error.selectDialer") : null} />
                    <GridForm
                        data={this.state.data}
                        columns={columns}
                        getItem={this.getItem}
                        copyItem={this.openCopyModal}
                        delete={this.delete}
                        viewOnly={this.isViewOnly()} //TO-DO make dynamic
                        actionCompleted={true} //TO-DO make dynamic
                        gridToolBarContent={gridToolBar}
                        enableInlineEdits={true}
                        commitInlineChanges={this.commitInlineChanges}
                        deleteConfDivId="deleteFileFormatConf"
                        deleteConfTitleId="action.confirm"
                        deleteConfMessageId="deleteConfirmation"
                        submitError={this.state.submitError}
                        resetForm={this.resetForm}
                        hideEdit={this.props.viewOnly}
                        hideCopy={true} //TO-DO in next release
                        hideDelete={this.props.viewOnly}
                        hideGridActions={this.props.viewOnly}
                        draggable={true}
                        apiUrl="/api/fileformat/"
                        page={this.props.page}
                        fetchData={this.fetchData}
                        releaseLocks={this.releaseLocks}
                        customHandleInLineChange={true}
                        handleInlineChange={this.handleInlineChange}
                        lockOn={this.state.lockOn}
                        editMode={this.state.editMode}
                    />
                </ContentBox>
                {/* T0-DO: Update viewOnly to be set dynamically */}
                <CopyModal copy={this.copyItem} itemList={this.state.data} viewOnly={false} />
                <ValidationsModal />
                <CommitModal />
                <FileFormatProperties
                    properties={this.state.properties}
                    dialerId={this.props.dialerId}
                    page={this.props.page}
                    toggleModal={this.toggleModal}
                    fetchData={this.fetchData}
                    displayProperties={this.state.displayProperties}
                    viewOnly={this.props.viewOnly} />
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                <InformationModal 
                        messageId="fileFormat.download.createDS.info"
                        messageArgs={{newDSCount: this.state.newDSCount}}
                        defaultMessage={this.state.newDSCount  + " days since characteristics were created."}
                        toggleModal={this.toggleCreateDSModal}
                        isOpen={this.state.displayCreateDSInfo}
                />
                {this.props.footer}
            </div>
        );
    }
}



const mapStateToProps = state => ({
    validation: state.validation
});

export default connect(mapStateToProps, { setValidation, clearValidation })(FileFormat);