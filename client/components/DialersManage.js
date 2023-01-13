import React from 'react';
import { ContentBox } from '.';
import { Button } from '@progress/kendo-react-buttons';
import { Error } from "@progress/kendo-react-labels";
import { staticDataSvc } from '../services/staticDataSvc';
import { commonService } from '../services/commonSvc.js';
import GridForm from '../commonsweb/js/Grid/GridForm';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import CopyModal from './CopyModal';
import InlineError from '../commonsweb/js/ErrorHandling/InlineError'
import { FormattedMessage } from 'react-intl';
import axios from "axios";
import DialersConfigure from './DialersConfigure';
axios.defaults.withCredentials = true;


class DialersManage extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            properties: {},
            data: [], //TO-DO: Remove sample data
            dialer: {},
            selected: 0,
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            submitError: null,
            displayEditModal: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchData();        
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    route = (url) => {
        this.props.history.push(url);
    }

    fetchData = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/dialers")
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

    add = () => {
        const dialer = {
            dst: 1, sunday: 0, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0,
            timezone: 'Eastern',
            dialerBadDays: [], 
            commonBadDays: [], 
            dialerRecycleDays: [], 
            commonRecycleDays: []
        };
        this.setState({dialer: dialer},
            () => this.toggleModal("displayEditModal", true));

    }

    getItem = (dialer) => {
        this.setState({ actionCompleted: false });
        axios.get("/api/dialers/" + dialer.id)
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        dialer: response.data,
                        responseErrors: [],
                        actionCompleted: true
                    }, () => this.toggleModal("displayEditModal", true));
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

    submit = () => {
        this.setState({ actionCompleted: false });
        let postURL = "/api/dialers";
        let putURL = "/api/dialers/" + this.state.dialer.id;
        axios({
            method: this.state.dialer.id ? 'PUT' : 'POST',
            url: this.state.dialer.id ? putURL : postURL,
            data: this.state.dialer
        })
        .then(() => this.handleSuccessfulSubmission())
        .catch(error => this.handleResponseErrors(error))
    }

    id = null;
    openCopyModal = (dialer) => {
        this.id = dialer.id;
        commonService.openModal("copyModal");
    }

    delete = (dialer) => {
        this.setState({ actionCompleted: false });
        axios
            .delete("/api/dialers/" + dialer.id)
            .then(() => this.handleSuccessfulSubmission())
            .catch(error => this.handleResponseErrors(error));
    }

    handleChange = (e) => {
        let value = e.target.value;
        let name = e.target.name;
        this.setState(prevState => ({
            dialer: {
                ...prevState.dialer,
                [name]: value
            }
        }),
        () => { this.validateInput(name, value) })
    }

    handleCheckBox = (e) => {
        let value = e.value ? 1 : 0;
        const name = e.target.element.current.name;
        this.setState(prevState => ({
            dialer: {
                ...prevState.dialer,
                [name]: value
            }
        }));
    }

    handleSelect = (e) => {
        this.setState({ selected: e.selected });
    }

    handleDateAdd = (field, date) => {
        date = this.formatDate(date);
        let dataSet = this.state.dialer[field] || [];
        if(this.duplicateDate(dataSet, this.isBadDay(field) ? "badDay" : "recycleOn", date)) return; //make dynamic
        let model = this.modelData(field, date);
        dataSet.push(model);
        this.setState(prevState => ({
            dialer: {
                ...prevState.dialer,
                [field]: dataSet
            }
        }));
    }

    isBadDay = (field) => field === "dialerBadDays" || field === "commonBadDays";

    modelData = (field, date) => {
        let model = {}
        if(this.isBadDay(field)){
            model = {dialerName: field === "dialerBadDays" ? this.state.dialer.name : "all", badDay: date}
        }
        else{
            model = {recycleOn: date}
        }
        return model;
    }

    handleDateDelete = (date, field, dateField) => {
        this.setState(prevState => ({
            dialer: {
                ...prevState.dialer,
                [field]: this.state.dialer[field].filter(obj => obj[dateField] != date)
            }
        }));
    }

    duplicateDate = (dataSet, field, date) => {
        console.log(dataSet);
        for(let i = 0; i < dataSet.length; i++){
            if(dataSet[i][field] == date) return true;
        }
        return false;
    }

    formatDate = (date) => {
        let month = '' + (date.getMonth() + 1);
        month = month.length < 2 ? '0' + month : month;
        let day = '' + date.getDate();
        day = day.length < 2 ? '0' + day : day;
        return  date.getFullYear() + month + day;
    }

    validateInput = (fieldName, value) => {
        //TO-DO: Implement
    }

    isValidSubmission = (submittedData) => {
        //TO-DO: Add validations
        this.setState({ submitError: null });
        return true;
    }

    //--------------------------------------------------------- UTILITY FUNCTIONS -----------------------------------------------------------------------------------


    resetForm = () => {
        this.setState({
            dialer: {},
            responseErrors: [],
            selected: 0,
            displayEditModal: false,
            actionCompleted: true,
            submitError: null
        })
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            this.fetchData();
            this.resetForm();
            this.props.fetchDialers();
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
                .post("/api/dialers/" + id + "/releaseLock")
                .then(response => { })
                .catch(error => {
                    this.handleResponseErrors(error);
                });
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------

    goBack = () => {
        this.props.history.goBack();
    }

    toggleModal = (modalName, open) => {
        this.setState({ [modalName]: open, responseErrors: []});
        if(modalName === "displayEditModal" && !open) {
            this.releaseLock(this.state.dialer.id); // release lock for selected item            
        }
    }

    sampleData = [{name: "Dialer 1"}, {name: "Dialer 2"}];
    render() {

        let columns = [
            { title: this.props.getLocalizedString("dialer.name"), field: 'name', filter: 'text', show: true },
            { title: this.props.getLocalizedString("dialer.description"), field: 'description', filter: 'text', show: true },
        ];

        let headerButtons =
            <div className="actions">
                <Button onClick={this.goBack}>
                    <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
                </Button>
            </div>

        let gridToolBar = <div>
                {this.props.viewOnly ? null :
                    <Button onClick={this.add}>
                        <FormattedMessage id="action.add" defaultMessage="Add" />
                    </Button>
                }
                </div>

        return (
            <div id="cover">
                <ContentBox titleId="dialer.dialers" divId="dialers" navHistory={staticDataSvc.fileFormatNavHistory(this.props.page)} footerButtons={headerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <Error>{this.state.submitError}</Error>
                    <GridForm
                        data={this.state.data} //TO-DO: Remove sample data
                        columns={columns}
                        getItem={this.getItem}
                        copyItem={this.openCopyModal}
                        delete={this.delete}
                        viewOnly={this.props.viewOnly} 
                        actionCompleted={true} //TO-DO make dynamic
                        enableInlineEdits={false}
                        gridToolBarContent={gridToolBar}
                        deleteConfDivId="deleteDialerConf"
                        deleteConfTitleId="dialer.confirm"
                        deleteConfMessageId="dialer.deleteConfirmation"
                        submitError={this.state.submitError}
                        hideCopy={true} //TO-DO next release
                        hideDelete={this.props.viewOnly}
                    />
                </ContentBox>
                <DialersConfigure 
                    isOpen={this.state.displayEditModal}
                    dialer={this.state.dialer}
                    responseErrors={this.state.responseErrors}
                    selected={this.state.selected}
                    handleSelect={this.handleSelect}
                    handleChange={this.handleChange}
                    handleCheckBox={this.handleCheckBox}
                    handleDateAdd={this.handleDateAdd}
                    handleDateDelete={this.handleDateDelete}
                    toggleModal={this.toggleModal}
                    submit={this.submit}
                    viewOnly={this.props.viewOnly}
                />
                {/* T0-DO: Update viewOnly to be set dynamically */}
                <CopyModal copy={this.copyItem} itemList={this.state.data} viewOnly={false} />
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                {this.props.footer}
            </div>
        );
    }
}

export default DialersManage;