import React from 'react';
import { Error } from "@progress/kendo-react-labels";
import { commonService } from '../services/commonSvc.js';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox, Footer } from './';
import GridForm from '../commonsweb/js/Grid/GridForm';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import ScoreDefinePeriodEdit from './ScoreDefinePeriodEdit';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

export default class ScoreDefineTimePeriods extends React.PureComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedItem: {},
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            submitError: null,
            displayPeriodModal: false
        }
        this.goBack = this.goBack.bind(this);
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
        axios.get("/api/scorecards/periods")
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

    getItem = (selectedItem) => {
        this.setState({ actionCompleted: false });
        axios
            .get("/api/scorecards/periods/" + selectedItem.id)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.prepAndOpenEditModal(response.data);
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    deletePeriod = (period) => {
        this.setState({ actionCompleted: false });
        axios
            .delete("/api/scorecards/periods/" + period.id)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.fetchData();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    prepAndOpenEditModal = (selectedItem) => {
        this.setState({
            selectedItem: selectedItem,
            responseErrors: []
        });
        this.toggleModal();
    }

    goBack = () => {
        this.props.history.goBack();
    }
    navHistory = [{ url: "/Home", label: "Home" }, { url: "/ScorecardsHome", label: "Scorecards" }]

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    toggleModal = () => {
        if(this.state.displayPeriodModal) {
            this.releaseLock(this.state.selectedItem.id);
            this.setState({selectedItem: {}});
        }
        this.setState({ displayPeriodModal: !this.state.displayPeriodModal });        
    }

    releaseLock = (id) => {
        if (typeof id !== "undefined" && id !== null) { // doing this instead of if (id) check coz found id with 0 value in test DB
            axios
                .post("/api/scorecards/periods/" + id + "/releaseLock")
                .then(response => { })
                .catch(error => {
                    this.handleResponseErrors(error);
                });
        }
    }

    addTimePerButton =
        <div className="actions">
            <Button onClick={this.toggleModal} disabled={this.props.viewOnly}>
                <FormattedMessage id="scorecards.addTimePeriod" defaultMessage="Add Time Period" />
            </Button>
        </div>

    footerButtons =
        <div className="actions">
            <Button className="button actions" onClick={this.goBack}>
                <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>

    render() {

        let columns = [
            // { title: "Characteristic Name", field: 'name', filter: 'text', show: true, cell: this.MyValidationCell },
            { title: this.props.getLocalizedString("scorecards.description"), field: 'description', filter: 'text', show: true, width: "400px" },
            { title: this.props.getLocalizedString("scorecards.timePeriod"), field: 'seconds', filter: 'text', show: true },
            { title: this.props.getLocalizedString("scorecards.dayOfWeek"), field: 'day', filter: 'text', show: true },
            { title: this.props.getLocalizedString("scorecards.lastTime"), field: 'time', filter: 'text', show: true },
            { title: this.props.getLocalizedString("scorecards.sc"), field: 'sc', filter: 'text', show: true }
        ];

        return (
            <div>
                <ContentBox titleId="scorecards.defineTimePeriods" divId="defineTimePeriods" navHistory={this.navHistory} headerButtons={this.addTimePerButton} footerButtons={this.footerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <Error>{this.state.submitError}</Error>
                    <GridForm
                        data={this.state.data}
                        columns={columns}
                        getItem={this.getItem}
                        copyItem={this.openCopyModal}
                        delete={this.deletePeriod}
                        viewOnly={this.props.viewOnly} //TO-DO make dynamic
                        actionCompleted={true} //TO-DO make dynamic
                        enableInlineEdits={false}
                        commitInlineChanges={this.commitInlineChanges}
                        deleteConfDivId="deleteConf"
                        deleteConfTitleId="action.confirm"
                        deleteConfMessageId="deleteConfirmation2"
                        submitError={this.state.submitError}
                        hideCopy={true} //TO-DO future release
                        hideDelete={this.props.viewOnly}
                        draggable={true}
                        apiUrl="/api/scorecards/periods/"
                        fetchData={this.fetchData}
                    />
                    {/* T0-DO: Update viewOnly to be set dynamically */}
                    <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                </ContentBox>
                <ScoreDefinePeriodEdit
                    period={this.state.selectedItem}
                    isOpen={this.state.displayPeriodModal}
                    toggleModal={this.toggleModal}
                    fetchData={this.fetchData}
                    viewOnly={this.props.viewOnly}
                    getLocalizedString={this.props.getLocalizedString}
                />
                {this.props.footer}
            </div >
        );
    }
}