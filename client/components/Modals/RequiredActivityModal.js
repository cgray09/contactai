import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import Modal from '../../commonsweb/js/ModalTemplate/Modal';
import axios from "axios";
import ErrorIcon from '@material-ui/icons/Error';
import { FormattedMessage } from 'react-intl';
axios.defaults.withCredentials = true;

// The purpose of this modal is to force the user to put the fields in the right order.
class RequiredActivityModal extends React.Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        var modal = document.getElementById('requiredActivityModal');
        modal.style.display = "none";
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={this.closeModal}>
                Ok
            </Button>
        </div>
    }

    render() {
        return (
            <div>
                <Modal
                    titleId="modal.error.title"
                    divId="requiredActivityModal"
                    footerButtons={this.getFooterButtons()}
                >
                    <div className="contentBoxRow">
                        <div className="container">
                            <ErrorIcon style={{ fontSize: 70, color: 'red' }} />
                            <div style={{ marginLeft: 30 }}>
                                <div>
                                    <FormattedMessage id="error.configured" defaultMessage="error.configured" />
                                </div>
                                <div>
                                    <FormattedMessage id="error.position" defaultMessage="error.position" />
                                </div>
                                <div style={{marginLeft : 25}}>
                                    <div>
                                        <FormattedMessage id="error.position.acctnum" defaultMessage="error.position.acctnum" />
                                    </div>
                                    <div>
                                        <FormattedMessage id="error.position.calldate" defaultMessage="error.position.calldate" />
                                    </div>
                                    <div>
                                        <FormattedMessage id="error.position.status" defaultMessage="error.position.status" />
                                    </div>
                                    <div titleId="error.position.result">
                                        <FormattedMessage id="error.position.result" defaultMessage="error.position.result" />
                                    </div>
                                    <div>
                                        <FormattedMessage id="error.position.duration" defaultMessage="error.position.duration" />
                                    </div>
                                    <div>
                                        <FormattedMessage id="error.position.dialtime" defaultMessage="error.position.dialtime" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
};

export default RequiredActivityModal;