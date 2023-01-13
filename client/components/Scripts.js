import React from 'react';
import { ContentBox } from './';
import ScriptsTabStrip from './ScriptsTabStrip'
import { commonService } from '../services/commonSvc.js';
import GridForm from '../commonsweb/js/Grid/GridForm';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import axios from "axios";
import EnvironmentActiveModal from './Modals/EnvironmentActiveModal';
axios.defaults.withCredentials = true;

export default class Scripts extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            environment: {},
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            submitError: null,
            displayNameModal: false,
            displayTabStrip: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchData();

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
        let value = e.target.value;
        let name = e.target.name;
        this.setState(prevState => ({
            environment: {
                ...prevState.environment,
                [name]: value
            }
        }))
    }

    handleTime = (e) => {
        let dateTime = e.target.value;
        let timeStr = this.convertToDoubleDigitStr(dateTime.getHours()) + ":" + this.convertToDoubleDigitStr(dateTime.getMinutes())
        let name = e.target.name;
        this.setState(prevState => ({
            environment: {
                ...prevState.environment,
                [name]: timeStr
            }
        }))
    }

    convertToDoubleDigitStr = (num) => num < 10 ? '0' + num : num;

    handleCheckBox = (e) => {
        let value = e.value ? 1 : 0;
        const name = e.target.element.current.name;
        this.setState(prevState => ({
            environment: {
                ...prevState.environment,
                [name]: value
            }
        }));
    }

    resetForm = () => {
        this.setState({
            environment: {},
            formSubmitted: false,
            responseErrors: []
        })
    }

    route = (url) => {
        this.props.history.push(url);
    }
    
    fetchData = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/environment/")
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        data: response.data,
                        responseErrors: [],
                        actionCompleted: true
                    });

                    let active = false;

                    // Set to false if condition met, false meaning no error.
                    response.data.forEach(function (arrayItem, index) {
                        if (arrayItem.active === 1) 
                            active = true;
                    });

                    // Displays trues for errors.
                    if (!active) 
                        commonService.openModal("activeModal");
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

    getItem = (environment) => {
        this.setState({ actionCompleted: false });
        axios
            .get("/api/environment/" + environment.id)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.prepAndOpenEditModal(response.data);
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    delete = (environment) => {
        this.setState({ actionCompleted: false });
        axios
            .delete("/api/environment/" + environment.id)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.fetchData();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    prepAndOpenEditModal = (environment) => {
        environment.active = (environment.active) ? 1 : 0;
        environment.runPreSummFlag = (environment.runPreSummFlag) ? 1 : 0;
        environment.runUploadFlag = (environment.runUploadFlag) ? 1 : 0;
        environment.runReSummFlag = (environment.runReSummFlag) ? 1 : 0;
        environment.runDownloadFlag = (environment.runDownloadFlag) ? 1 : 0;
        environment.runScoreCardFlag = (environment.runScoreCardFlag) ? 1 : 0;
        environment.downloadStartTime = (environment.downloadStartTime) ? environment.downloadStartTime : "00:00";
        environment.reSummStartTime = (environment.reSummStartTime) ? environment.reSummStartTime : "00:00";
        environment.scoreCardStartTime = (environment.scoreCardStartTime) ? environment.scoreCardStartTime : "00:00";
        environment.uploadStartTime = (environment.uploadStartTime) ? environment.uploadStartTime : "00:00";
        environment.preSummStartTime = (environment.preSummStartTime)? environment.preSummStartTime : "00:00";
        environment.scheduleFreq = (environment.scheduleFreq) ? environment.scheduleFreq : 'Weekly';
        this.setState({
            environment,
            responseErrors: []
        });
        this.toggleModal("displayTabStrip", true);
    }

    activate = (environment) => {
        // this.setState({ actionCompleted: false });
        // axios
        //     .get("<UPDATE_URL>" + environment.id) //TO-DO: Update URL
        //     .then(response => {
        //         this.setState({ actionCompleted: true });
        //         do stuff
        //     })
        //     .catch(error => {
        //         this.handleResponseErrors(error);
        //     });
    }

    submit = () => {
        this.setState({ actionCompleted: false });
        let postURL = "/api/environment";
        let putURL = "/api/environment/" + this.state.environment.id;
        if (this.isValidSubmission()) {
            axios({
                method: this.state.environment.id ? 'PUT' : 'POST',
                url: this.state.environment.id ? putURL : postURL,
                data: this.state.environment
            })
                .then(() => this.handleSuccessfulSubmission())
                .catch(error => this.handleResponseErrors(error))
        }
    }

    isValidSubmission = () => {
        let environment = this.state.environment;
        let allEnvs = this.state.data;
        let hasActiveEnv = false;
        let errors = [];
        if (!environment.name ) {
            errors.push("Name cannot be empty");
        }
        if (environment.name && commonService.itemNameAvailable(environment, this.state.data)) {
            errors.push(environment.name + " is a duplicate name");
        }
        for(let i = 0; i < allEnvs.length ; i++) {
            if(allEnvs[i].active && allEnvs[i].id !== environment.id) {
                hasActiveEnv = true;
            }                
        }
        if(!environment.active && !hasActiveEnv) {
            errors.push("At least one environment must be active");
        }
        
        if(errors.length > 0) {
            this.setState({responseErrors : errors,  actionCompleted: true});
            return false;
        } else {
            this.setState({ responseErrors: []});
            return true;
        }              
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            this.setState({ actionCompleted: true });
            this.fetchData();
            this.toggleModal("displayTabStrip", false);
        }
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    toggleModal = (modalName, display) => {
        this.setState({ [modalName]: display });
        if(modalName === "displayTabStrip" && !display) {
            this.releaseLock(this.state.environment.id); // release lock for selected item
            this.resetForm();         
        }
    }

    releaseLock = (id) => {
        if (typeof id !== "undefined" && id !== null) { // doing this instead of if (id) check coz found id with 0 value in test DB
            axios
                .post("/api/environment/" + id + "/releaseLock")
                .then(response => { })
                .catch(error => {
                    this.handleResponseErrors(error);
                });
        }
    }

    gridToolBar =
        <div className="actions">
            {this.props.viewOnly ? null : 
                    <Button onClick={() => this.prepAndOpenEditModal({})}><FormattedMessage id="action.add" defaultMessage="Add" />
                    </Button>}
        </div>

    StatusCell = (props) => <td style={{ color: props.dataItem.active === 1 ? "green" : "red", fontWeight: "bold" }}>
        {this.props.getLocalizedString(props.dataItem.active === 1 ? "script.activated" : "script.deactivated")}
    </td> 

    columns = [
        { title: this.props.getLocalizedString("script.environment"), field: 'name', filter: 'text', show: true },
        { title: this.props.getLocalizedString("script.status"), field: 'activate', filter: 'text', show: true, cell: this.StatusCell },
    ]

    render() {

        const navHistory = [{ url: "/Home", label: "Home" }]

        return (
            <>
                <ContentBox titleId="script.schedAndEnvironment" divId="schedAndEnvironment" navHistory={navHistory}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <GridForm
                        data={this.state.data}
                        columns={this.columns}
                        getItem={this.getItem}
                        copyItem={this.openCopyModal}
                        delete={this.delete}
                        viewOnly={this.props.viewOnly} 
                        actionCompleted={this.state.actionCompleted} //TO-DO make dynamic
                        gridToolBarContent={this.gridToolBar}
                        enableInlineEdits={false}
                        deleteConfDivId="envDeleteWarning"
                        deleteConfTitleId="script.deleteWarning"
                        deleteConfMessageId="script.deleteMessage"
                        apiUrl="" //TO-DO: Update
                        fetchData={this.fetchData}
                        submitError={this.state.submitError}
                        hideCopy={true} //TO-DO next release
                        hideDelete={this.props.viewOnly}
                    />
                    <ScriptsTabStrip
                        environment={this.state.environment}
                        responseErrors={this.state.responseErrors}
                        isOpen={this.state.displayTabStrip}
                        toggleModal={this.toggleModal}
                        fetchData={this.fetchData}
                        getLocalizedString={this.props.getLocalizedString}
                        viewOnly={this.props.viewOnly}
                        handleChange={this.handleChange}
                        handleCheckBox={this.handleCheckBox}
                        handleTime={this.handleTime}
                        submit={this.submit}
                    />
                </ContentBox>
                <EnvironmentActiveModal />
                {this.props.footer}
            </>
        );
    }
}