import React from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import Modal from '../commonsweb/js/ModalTemplate/Modal';
import InlineError from '../commonsweb/js/ErrorHandling/InlineError';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

// The purpose of this modal is to force the user to set a new unique name when copying an item

class CopyModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: '',
            errors: { name: null },
            duplicateNameUsed: null,
            formSubmitted: false
        }
    }

    handleChange = (e) => {
        let value = e.target.value;
        const name = e.target.name;
        this.setState(({
            [name]: value
        }),
            () => { this.validateInput(name, value) })
    }

    closeModal = () => {
        var modal = document.getElementById('copyModal');
        modal.style.display = "none";
        this.resetForm();
    }

    resetForm = () => {
        this.setState({
            name: '',
            errors: { name: null },
            formSubmitted: false,
            duplicateNameUsed: null
        })
    }

    validateInput = (fieldName, value) => {
        let errors = this.state.errors;

        if (fieldName === 'name') {
            if (!value) {
                errors.name = <FormattedMessage id="error.required" defaultMessage="This field is required" />;
            }
            else {
                let nameValid = value.match(/^[a-zA-Z0-9_]*$/);
                errors.name = nameValid ? null :
                    <FormattedMessage
                        id="error.invalidFormat"
                        defaultMessage="Can only contain alphanumeric characters and underscores (_)"
                    />;
            }
        }
        this.setState({
            errors: errors
        });
    }

    nameIsAvailable = (name) => {
        const itemList = this.props.itemList;
        for (let i = 0; i < itemList.length; i++) {
            if (itemList[i].name.toUpperCase() === name.toUpperCase() &&
                itemList[i].id !== itemList.id) {
                this.setState({ duplicateNameUsed: name });
                return false;
            }
        }
        this.setState({ duplicateNameUsed: null });
        return true;
    }

    isValidSubmission = () => {
        return this.state.name && !this.state.errors.name && this.nameIsAvailable(this.state.name)
    }

    submit = () => {
        this.setState({ formSubmitted: true });
        if (this.isValidSubmission()) {
            this.props.copy(this.state.name);
            this.resetForm();
        }
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={this.closeModal}>
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
                <Modal
                    titleId="copyModal.title"
                    divId="copyModal"
                    footerButtons={this.getFooterButtons()}
                >
                    <InlineError
                        errorMessage={
                            this.state.formSubmitted &&
                                (!this.state.name || this.state.errors.name)
                                ? <FormattedMessage id="error.correctFields" defaultMessage="Please correct invalid fields" /> : null
                        }
                    />
                    <InlineError
                        errorMessage={
                            this.state.formSubmitted && this.state.duplicateNameUsed
                                ? <FormattedMessage id="error.duplicateName" values={{ name: this.state.duplicateNameUsed }} /> : null
                        }
                    />
                    <div className="contentBoxRow">
                        <label className="label">
                            <FormattedMessage id="contactAI.name" defaultMessage="Name" />
                        </label>
                        <div className="content">
                            <Input name="name" value={this.state.name} maxLength="32" onChange={this.handleChange} style={{ width: '300px' }} disabled={this.props.viewOnly} />
                            <InlineError
                                errorMessage={
                                    (this.state.formSubmitted && !this.state.name) ?
                                        <FormattedMessage id="error.nameRequired" defaultMessage="Name is Requred" /> : this.state.errors.name
                                }
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
};

export default CopyModal;