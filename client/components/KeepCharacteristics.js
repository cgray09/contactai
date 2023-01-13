import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@progress/kendo-react-buttons';
import { Error } from "@progress/kendo-react-labels";
import { commonService } from '../services/commonSvc.js';
import { staticDataSvc } from '../services/staticDataSvc';
import GridForm from '../commonsweb/js/Grid/GridForm';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import CopyModal from './CopyModal';
import CommitModal from './Modals/CommitModal';
import RequiredActivityModal from './Modals/RequiredActivityModal';
import DropDownCell from '../commonsweb/js/Grid/DropDownCell.js';
import ComboBoxCell from '../commonsweb/js/Grid/ComboBoxCell.js';
import NumericCell from '../commonsweb/js/Grid/NumericCell.js';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
import { setValidation, clearValidation } from '../actions/validation';
axios.defaults.withCredentials = true;

class KeepCharacteristics extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedItem: {},
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            submitError: null,
            displayVariableModal: false,
            lockOn: false,
            editMode: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        //TO-DO: Uncomment when ready to hook up grid to real data
        this.fetchDataDictionary();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    route = (url) => {
        this.props.history.push(url);
    }

    fetchDataDictionary = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/dataDictionary/" +  this.props.dataDictURI + this.props.page)
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
        //TO-DO: Update URL
        axios.get("/api/keepchars/" + this.props.page)
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        data: response.data,
                        responseErrors: [],
                        actionCompleted: true
                    });

                    if (this.props.page === 'callResult') {
                        //validate only for callresults->keepChars
                        let hasErrors = false;

                        this.state.data.forEach((element, index) => {
                            if ((index === 0 && element.name !== 'ACCTNUM') 
                                || (index === 1 && element.name !== 'CALLDATE')
                                || (index === 2 && element.name !== 'STATUS')
                                || (index === 3 && element.name !== 'RESULT')
                                || (index === 4 && element.name !== 'DURATION')
                                || (index === 5 && element.name !== 'DIALTIME'))
                                hasErrors = true;
                        });

                        if (hasErrors) {
                            commonService.openModal("requiredActivityModal");
                        }
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

    getItem = (item) => {
         // this call is required despite inline edit to acquire lock.
         axios
         .get("/api/keepchars/" + item.id + "/" + this.props.page)
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
            .post("/api/keepchars/" + this.props.page, selectedItem)
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
            .post("/api/keepchars/" + this.id + "/copy", reqBody)
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
                .put("/api/keepchars/" + item.id + "/" + this.props.page, item)
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
            .delete("/api/keepchars/" + selectedItem.id + "/" + this.props.page)
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
                if (!submittedData[i].name || isNaN(submittedData[i].width) || !submittedData[i].type) {
                    this.props.setValidation("Row(s) exist with missing fields(s).");
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
                .post("/api/keepchars/" + id + "/releaseLock/" + this.props.page) 
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

    goBack = () => {
        this.props.history.goBack();
    }

   footerButtons =
        <div className="actions">
            <Button onClick={this.props.goBack}>
                <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>


    NameCell = (props) => <ComboBoxCell {...props} data={this.state.dataDictionary} width="350px" /> //TO-DO: Update with data
    WidthCell = (props) => <NumericCell {...props} max={9999}/>
    TypeDropDownCell = (props) => <DropDownCell {...props} data={staticDataSvc.getKeepCharTypes()} width="200px" />
    
    render() {

        let columns = [
            { title: this.props.getLocalizedString("keepChars.characteristicName"), field: 'name', filter: 'text', show: true, width: "350px", cell: this.NameCell },
            { title: this.props.getLocalizedString("keepChars.width"), field: 'width', filter: 'text', editor: 'numeric', show: true, width: "100px", cell: this.WidthCell },
            { title: this.props.getLocalizedString("keepChars.charType"), field: 'type', filter: 'text', show: true, cell: this.TypeDropDownCell },
            { title: this.props.getLocalizedString("keepChars.description"), field: 'description', filter: 'text', show: true, width: "500px" }
        ];

        let gridToolBar = <div style={{ display: "inline-flex", marginRight: "15px", fontWeight: "bold" }}>
            <FormattedMessage id="keepChars.firstChar" defaultMessage="NOTE: First Characteristic is assumed to be the key field" />
        </div>

        return (
            <div id="cover">
                <ErrorGroup errorMessages={this.state.responseErrors} />
                <Error>{this.state.submitError}</Error>
                <GridForm
                    data={this.state.data}
                    columns={columns}
                    getItem={this.getItem}
                    copyItem={this.openCopyModal}
                    delete={this.delete}
                    viewOnly={this.props.viewOnly} //TO-DO make dynamic
                    actionCompleted={true} //TO-DO make dynamic
                    enableInlineEdits={true}
                    commitInlineChanges={this.commitInlineChanges}
                    gridToolBarContent={gridToolBar}
                    deleteConfDivId="deleteKeepCharConf"
                    deleteConfTitleId="action.confirm"
                    deleteConfMessageId="deleteConfirmation"
                    submitError={this.state.submitError}
                    resetForm={this.resetForm}
                    hideEdit={this.props.viewOnly}
                    hideCopy={true} //TO-DO for future release
                    hideDelete={this.props.viewOnly}
                    hideGridActions={this.props.viewOnly}
                    draggable={true}
                    apiUrl="/api/keepchars/"
                    fetchData={this.fetchData}
                    page={this.props.page}
                    releaseLocks={this.releaseLocks}
                    lockOn={this.state.lockOn}
                    editMode={this.state.editMode}
                />
                {/* T0-DO: Update viewOnly to be set dynamically */}
                <CopyModal copy={this.copyItem} itemList={this.state.data} viewOnly={false} />
                <CommitModal viewOnly={false} />
                <RequiredActivityModal viewOnly={false} />
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                {this.props.footer}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    validation: state.validation
});

export default connect(mapStateToProps, { setValidation, clearValidation })(KeepCharacteristics);