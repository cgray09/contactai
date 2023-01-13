import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import Modal from '../../commonsweb/js/ModalTemplate/Modal';
import axios from "axios";
import { connect } from 'react-redux';
import ErrorIcon from '@material-ui/icons/Error';
import { FormattedMessage } from 'react-intl';
axios.defaults.withCredentials = true;

// The purpose of this modal is to inform the user of any input errors.
const CommitModal = ({ validation: { validations } }) => {
    const closeModal = () => {
        var modal = document.getElementById('commitModal');
        modal.style.display = "none";
    }

    const getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={() => closeModal()}>
                Ok
            </Button>
        </div>
    }

    return (
        <div>
            <Modal
                titleId="validationsModal.title"
                divId="commitModal"
                footerButtons={getFooterButtons()}
            >
                <div className="contentBoxRow">
                    <div className="container">
                        <ErrorIcon style={{ fontSize: 70, color: 'red' }} />
                        <div style={{ marginLeft: 30 }}>
                            <div>
                                <FormattedMessage id="error.detected" defaultMessage="error.detected" />
                            </div>
                            <div>
                                <FormattedMessage id="error.prompt" defaultMessage="error.prompt" />
                            </div>
                            <div style={{marginLeft : 25}}> 
                                <div>
                                {validations.map(val => (
                                    <div>
                                        {val}
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
   
};

const mapStateToProps = state => ({
    validation: state.validation
});

export default connect(mapStateToProps)(CommitModal);