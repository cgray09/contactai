import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import Modal from '../../commonsweb/js/ModalTemplate/Modal';
import axios from "axios";
import ErrorIcon from '@material-ui/icons/Error';
import { FormattedMessage } from 'react-intl';
axios.defaults.withCredentials = true;

// The purpose of this modal is to inform the user that an active environment needs to exist when none are active.
class EnvironmentActiveModal extends React.Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        var modal = document.getElementById('activeModal');
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
                    divId="activeModal"
                    footerButtons={this.getFooterButtons()}
                >
                    <div className="contentBoxRow">
                        <div className="container">
                            <ErrorIcon style={{ fontSize: 70, color: 'red' }} />
                            <div style={{ marginLeft: 30 }}>
                                <div>
                                    <FormattedMessage id="error.active" defaultMessage="error.active" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
};

export default EnvironmentActiveModal;