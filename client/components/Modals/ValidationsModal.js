import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import Modal from '../../commonsweb/js/ModalTemplate/Modal';
import { staticDataSvc } from '../../services/staticDataSvc';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
import { connect } from 'react-redux';
import ErrorIcon from '@material-ui/icons/Error';
axios.defaults.withCredentials = true;

// The purpose of this modal is to inform the user of any errors in the data coming from the backend.
const ValidationsModal = ({ validation: { validations } }) => {
    const closeModal = () => {
        var modal = document.getElementById('validationsModal');
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
                divId="validationsModal"
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
                                {validations.map(val => (
                                    <div>
                                        {val === 'acctnum' &&
                                            <div>
                                                <FormattedMessage id="error.acctnum" defaultMessage="error.acctnum" />
                                            </div>
                                        }
                                        {val === 'zipcode' &&
                                            <div>
                                                <FormattedMessage id="error.zipcode" defaultMessage="error.zipcode" />
                                            </div>                                        }
                                        {val === 'phone' &&
                                            <div>
                                                <FormattedMessage id="error.phone" defaultMessage="error.phone" />
                                            </div>                                        
                                        }
                                        {val.split(' ', 1)[0] === 'gap' && 
                                            <FormattedMessage id="error.gap" values={{ name1: val.split(" ").slice(-2)[0], name2:  val.split(' ').pop()}} />
                                        }
                                    </div>
                                ))}
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

export default connect(mapStateToProps)(ValidationsModal);