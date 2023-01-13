import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input, TextArea, Checkbox } from "@progress/kendo-react-inputs";
import { commonService } from '../services/commonSvc.js';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import InlineError from '../commonsweb/js/ErrorHandling/InlineError';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
import { DropDownList } from '@progress/kendo-react-dropdowns';
axios.defaults.withCredentials = true;

class ScoreAnalysisCharEdit extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            analsysChar: {},
            errors: { name: null, description: null },
            formSubmitted: false,
            responseErrors: [],
            actionCompleted: true //used for loading indicator
        }
    }

    componentWillReceiveProps({ analsysChar }) {
        this.setState({ analsysChar })
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
        let value = e.target.value;
        let name = e.target.name;
        this.setState(prevState => ({
            analsysChar: {
                ...prevState.analsysChar,
                [name]: value
            }
        }),
            () => { this.validateInput(name, value) })
    }

    handleCheckBox = (e) => {
        let value = e.value ? 1 : 0;
        const name = e.target.element.current.name;
        this.setState(prevState => ({
            analsysChar: {
                ...prevState.analsysChar,
                [name]: value
            }
        }));
    }

    toggleModal = () => {
        this.resetForm();
        this.props.toggleModal();
    }

    resetForm = () => {
        this.setState({
            analsysChar: {},
            formSubmitted: false,
            responseErrors: []
        })
    }

    validateInput = (fieldName, value) => {
        //TO-DO: Implement
    }

    isValidSubmission = () => {
        //TO-DO: Implement
        return true;
    }

    submit = () => {
        this.setState({ formSubmitted: true });
        if (this.isValidSubmission()) {
            this.setState({ actionCompleted: false });
            axios
                .put("/api/scorecards/analysisChar/" + this.state.analsysChar.id, this.state.analsysChar)
                .then(() => this.handleSuccessfulSubmission())
                .catch(error => this.handleResponseErrors(error));
        }
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
            {this.props.viewOnly ? null : <Button primary={true} onClick={this.submit}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    render() {
        return (
            <div>
                <ModalStateDisplay
                    titleId="scorecards.setAnalysisChars"
                    divId="analysisCharModal"
                    isOpen={this.props.isOpen}
                    footerButtons={this.getFooterButtons()}
                >
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.active" defaultMessage="Active" />:
                        </div>
                        <div className="content">
                            <Checkbox name="active" onChange={this.handleCheckBox} value={this.state.analsysChar && this.state.analsysChar.active === 1} />
                        </div>
                    </div>
                    {/* Only display Group R if type is Character */}
                    {this.state.analsysChar.type === "CHARACTER" && 
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.groupr" defaultMessage="GroupR" />:
                        </div>
                        <div className="content">
                            <Checkbox name="groupr" onChange={this.handleCheckBox} value={this.state.analsysChar && this.state.analsysChar.groupr === 1} />
                        </div>
                    </div>}
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.characteristic" defaultMessage="Characteristic" />:
                        </div>
                        <div className="content">{this.state.analsysChar.name}</div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.source" defaultMessage="Source" />:
                        </div>
                        <div className="content">{this.state.analsysChar.source}</div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.type" defaultMessage="Type" />:
                        </div>
                        <div className="content">
                            <DropDownList
                                name="type"
                                style={{ width: "150px" }}
                                onChange={this.handleChange}
                                value={this.state.analsysChar.type}
                                data={['NUMERIC', 'CHARACTER']} />
                        </div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <FormattedMessage id="scorecards.description" defaultMessage="Description" />:
                        </div>
                    </div>
                    <div className="contentBoxRow">
                        <div className="content">
                            <Input
                                name="description"
                                onChange={this.handleChange}
                                value={this.state.analsysChar.description}
                                style={{ width: "425px" }}
                            />
                        </div>
                    </div>
                </ModalStateDisplay>
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
            </div>
        );
    }
};

export default ScoreAnalysisCharEdit;