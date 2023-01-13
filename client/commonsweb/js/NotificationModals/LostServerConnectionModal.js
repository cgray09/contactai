import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* 
 
 This modal should be displayed to the user when losing connection with the server. 
 
 Requirements - must pass in following function as a prop
	- eventHandler() : event handler for the modal
*/

const LostServerConnectionModal = (props) => {

    const routeToLoginPage = () => {
        props.routeToLoginPage();
        closeModal('lostServerConnection');
    }
    
    const closeModal = (modalId) => {
        var modal = document.getElementById(modalId);
    	modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={routeToLoginPage}>
                <FormattedMessage id="action.ok" defaultMessage="Yes"/>
            </Button>
        </div>

    return (
        <Modal
            titleId="lostServerConnection.title"
            divId="lostServerConnection"
            footerButtons={footerButtons}
        >
            <div style={{ padding: "10px" }}>
                <FormattedMessage id="lostServerConnection.message"
                    defaultMessage="The connection to the server has been lost. Please contact your Administrator."/>
            </div>
        </Modal>
    )
};


export default LostServerConnectionModal;