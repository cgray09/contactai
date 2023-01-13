import React from 'react';
import { commonService } from '../services/commonSvc.js';
import { Input, NumericTextBox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

class FileFormatProperties extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            properties: {},
            formSubmitted: false,
            responseErrors: [],
            actionCompleted: true //used for loading indicator
        }
    }

    componentWillReceiveProps({ properties }) {
        this.setState({ ...this.state, properties, responseErrors: [] })
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.resetForm();
    }

    handleChange = (e) => {
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const name = e.target.name;
        this.setState(prevState => ({
            properties: {
                ...prevState.properties,
                [name]: value
            }
        }));
    }

    resetForm = () => {
        this.setState({
            properties: {},
            formSubmitted: false,
            responseErrors: [],
            actionCompleted: true
        });
        this.props.toggleModal();
    }

    submitProperties = () => {
        let properties = this.state.properties;
        let fileFormatURI = this.props.dialerId + "/" + this.props.page + "/properties";

        this.setState({ formSubmitted: true });
        this.setState({ actionCompleted: false });
        
        if((properties.delimId !== undefined && properties.delimId !== null) && 
            (properties.recordLengthId !== undefined && properties.recordLengthId !== null)) {
            axios
            .put("/api/fileFormat/" + fileFormatURI, properties)
            .then(response => {
                this.handleSuccessfulSubmission();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
        } else {
            axios
            .post("/api/fileFormat/" + fileFormatURI, properties)
            .then(response => {
                this.handleSuccessfulSubmission();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
        }
        
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            this.setState({ actionCompleted: true });
            this.props.fetchData();
            this.props.toggleModal(); 
        }
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({
                responseErrors,
                actionCompleted: true
            });
        }
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={this.resetForm}>
                {this.props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {this.props.viewOnly ? null : <Button primary={true} onClick={this.submitProperties}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    render() {
        return (
            <div>
                <ModalStateDisplay
                    titleId="fileFormat.properties"
                    divId="fileFormatProperties"
                    footerButtons={this.getFooterButtons()}
                    isOpen={this.props.displayProperties}
                >
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <div className="contentBoxRow">
                        <label className="label">
                            <FormattedMessage id="fileFormat.fieldDelimited" defaultMessage="Field Delimited" />:
                        </label>
                        <div className="content">
                            <input type="checkbox"
                                className="k-checkbox"
                                name="useDelimiter"
                                id="useDelimiter"
                                checked={this.state.properties.useDelimiter}
                                onChange={this.handleChange}
                                disabled={this.props.viewOnly} />
                        </div>
                    </div>
                    {this.state.properties.useDelimiter ?<div className="contentBoxRow">
                        <label className="label">
                            <FormattedMessage id="fileFormat.fieldDelimiter" defaultMessage="Field Delimiter" />:
                        </label>
                        <div className="content">
                            <Input
                                name="delimiter"
                                value={this.state.properties.delimiter}
                                maxLength={3}
                                onChange={this.handleChange}
                                style={{ width: '50px' }}
                                disabled={this.props.viewOnly} />
                        </div>
                    </div> : null}
                    <div className="contentBoxRow">
                        <label className="label">
                            <FormattedMessage id="fileFormat.recordLength" defaultMessage="Record Length" />:
                        </label>
                        <div className="content">
                            <NumericTextBox name="recordLength"
                                value={this.state.properties.recordLength}
                                onChange={this.handleChange}
                                style={{ width: '100px' }}
                                disabled={this.props.viewOnly} />
                        </div>
                    </div>
                    <div className="contentBoxRow">
                        <label style={{ marginLeft: "10px"}}>
                            <FormattedMessage id="fileFormat.recordLengthNote" defaultMessage="NOTE: 0 indicates newline terminated" />
                        </label>
                    </div>
                    

                </ModalStateDisplay>
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
            </div>
        );
    }
};

export default FileFormatProperties;