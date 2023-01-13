import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { commonService } from '../services/commonSvc.js';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import InlineError from '../commonsweb/js/ErrorHandling/InlineError';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

class ScoreDefinePeriodEdit extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            period: {},
            description: '',
            errors: { name: null, description: null },
            formSubmitted: false,
            responseErrors: [],
            actionCompleted: true //used for loading indicator
        }
    }

    componentWillReceiveProps({ period }) {
        this.setState({ ...this.state, period, description: period.description })
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
        console.log(e);
        let value = e.target.value;
        let name = e.target.name;
        this.setState(prevState => ({
            period: {
                ...prevState.period,
                [name]: value
            }
        }),
            () => { this.validateInput(name, value) })
    }

    handleDescChange = (e) => { //special handler for textarea only.
        //for some reason, e.target.value is undefined in this case,
        //but e.value has the modified value, hence using e.value.
        this.setState({description: e.value}); 
    }

    toggleModal = () => {
        this.resetForm();
        this.props.toggleModal();
    }

    resetForm = () => {
        this.setState({
            period: {},
            formSubmitted: false,
            responseErrors: []
        })
    }

    validateInput = (fieldName, value) => {
        //TO-DO: Implement
        // let errors = this.state.errors;

        // if (fieldName === 'name') {
        //     if (!value) {
        //         errors.name = <FormattedMessage id="error.required" defaultMessage="This field is required" />;
        //     }
        //     else {
        //         let nameValid = value.match(/^[a-zA-Z0-9_]*$/);
        //         errors.name = nameValid ? null :
        //             <FormattedMessage
        //                 id="error.invalidFormat"
        //                 defaultMessage="Can only contain alphanumeric characters and underscores (_)"
        //             />;
        //     }
        // }
        // else if (fieldName === 'description') {
        //     let descriptionValid = value.match(/^[a-zA-Z0-9_ ]*$/) || !this.state.period.description;
        //     errors.description = descriptionValid ? null :
        //         <FormattedMessage
        //             id="error.invalidDescription"
        //             defaultMessage="Can only contain alphanumeric characters, underscores (_) and spaces"
        //         />;
        // }
        // this.setState({
        //     errors: errors
        // });
    }

    isValidSubmission = () => {
        //TO-DO: Implement
        return true;
    }

    submitPeriod = () => {
        let period = this.state.period;
        period.description = this.state.description;
        this.setState({ formSubmitted: true });
        if (this.isValidSubmission()) {
            if (period.id) {
                console.log("Doing an Update");
                this.updatePeriod(period)
            }
            else {
                console.log("Doing a Save");
                this.savePeriod(period); //if no id is presnt its an add so do a POST
            }
        }
    }

    savePeriod = (period) => {
        this.setState({ actionCompleted: false });
        axios
            .post("/api/scorecards/periods", period)
            .then(response => {
                this.handleSuccessfulSubmission();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    };

    updatePeriod = (period) => {
        this.setState({ actionCompleted: false });
        axios
            .put("/api/scorecards/periods/" + period.id, period)
            .then(response => {
                this.handleSuccessfulSubmission();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            this.setState({ actionCompleted: true });
            this.props.fetchData();
            this.toggleModal();
        }
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={this.toggleModal}>
                {this.props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {this.props.viewOnly ? null : <Button primary={true} onClick={this.submitPeriod}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    daysOfWeek = [this.props.getLocalizedString("scorecards.sunday"), this.props.getLocalizedString("scorecards.monday"), this.props.getLocalizedString("scorecards.tuesday"),
    this.props.getLocalizedString("scorecards.wednesday"), this.props.getLocalizedString("scorecards.thursday"),
    this.props.getLocalizedString("scorecards.friday"), this.props.getLocalizedString("scorecards.saturday")];

    times = ["8am", "9am", "10am", "11am", "12 noon", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm"];

    render() {
        return (
            <div>
                <ModalStateDisplay
                    titleId="scorecards.definePeriodEdit"
                    divId="timePeriodModal"
                    isOpen={this.props.isOpen}
                    footerButtons={this.getFooterButtons()}
                >
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.ifDayEarlierEqual" defaultMessage="IF (Day of Week is earlier than or equal to" />
                        </div>
                        <div className="content">
                            <ComboBox
                                name="day"
                                onChange={this.handleChange}
                                data={this.daysOfWeek}
                                allowCustom={false}
                                value={this.state.period.day}
                                disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">)</div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.timeEarlierEqual" defaultMessage="AND (Time of Day is earlier than or equal to" />
                        </div>
                        <div className="content">
                            <ComboBox
                                name="time"
                                onChange={this.handleChange}
                                data={this.times}
                                allowCustom={false}
                                value={this.state.period.time} 
                                disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">)</div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.scoreCardEqual" defaultMessage="AND (Score Card is equal to" />
                        </div>
                        <div className="content">
                            <Input
                                name="sc"
                                onChange={this.handleChange}
                                maxLength="2"
                                value={this.state.period.sc} 
                                disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">)</div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.timePeriodSetTo" defaultMessage="THEN Time Period is set to" />
                        </div>
                        <div className="content">
                            <Input
                                name="seconds"
                                onChange={this.handleChange}
                                value={this.state.period.seconds} 
                                disabled={this.props.viewOnly} />
                        </div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.description" defaultMessage="Description" />
                        </div>
                    </div>
                    <div className="contentBoxRow">
                        {/* <div className="content">
                            <FormattedMessage id="scorecards.description" defaultMessage="Description" />
                        </div> */}
                        <div className="content">
                            <TextArea name="description" onChange={this.handleDescChange} value={this.state.description} style={{ width: "425px" }} rows={4} disabled={this.props.viewOnly} />
                        </div>
                    </div>
                </ModalStateDisplay>
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
            </div>
        );
    }
};

export default ScoreDefinePeriodEdit;