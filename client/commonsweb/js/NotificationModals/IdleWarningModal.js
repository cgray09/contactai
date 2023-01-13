import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

/* 
 
 This modal should be displayed to the user one minute prior to the user's session timing out. It gives them the option to end their session or continue.
 If the idle time passes, the user will timeout and will be automatically logged out of the application.
 
 Requirements - must pass in following function as a prop
	- logoutEvent: The logout event that will get executed when selecting "No", when prompting the user if they want to extend session

 *NOTE* element id for IdleWarningModal is 'idleWarningModal'. If wanting to open or display this modal in the application, will need to set its
		display to block. Ex) document.getElementById('idleWarningModal').style.display = "block"
 */

const IdleWarningModal = (props) => {

    const closeIdleModal = () => {
        var modal = document.getElementById('idleWarningModal');
        modal.style.display = "none";
    }

    const logout = () => {
        closeIdleModal();
        props.logoutEvent(false);
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeIdleModal}>
                <FormattedMessage id="action.yes" defaultMessage="Yes" />
            </Button>
            <Button onClick={logout}>
                <FormattedMessage id="action.no" defaultMessage="No" />
            </Button>
        </div>

    return (
        <Modal
            titleId="idleWarning.title"
            divId="idleWarningModal"
            footerButtons={footerButtons}
        >
            <div style={{ padding: "10px" }}>
                <FormattedMessage id="idleWarning.message"
                    defaultMessage="Your session is about to time out. Do you want to stay on this page?" />
            </div>
        </Modal>
    );
};


export default IdleWarningModal;