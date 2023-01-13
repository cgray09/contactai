import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* 
 
 This modal should be displayed to the user when attempting to log out of application. Its purpose is to make sure the user actually intended
 to logout and did not do so by accident
 
 Requirements - must pass in following function as a prop
	- logout() : event handler for logging out of the application

*NOTE* element id for LogoutConfirmationModal is 'logoutModal'. If wanting to open or display this modal in the application, will need to set its
		display to block. Ex) document.getElementById('logoutModal').style.display = "block"
*/

const LogoutConfirmationModal = (props) => {

    const logout = () => {
        props.logout(false);
        closeLogoutModal();
    }
    
    const closeLogoutModal = () => {
        var modal = document.getElementById('logoutModal');
    	modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeLogoutModal}>
                <FormattedMessage id="action.cancel" defaultMessage="Cancel"/>
            </Button>
            <Button onClick={logout}>
                <FormattedMessage id="action.yes" defaultMessage="Yes"/>
            </Button>
        </div>

    return (
        <Modal
            titleId="logoutConfirmation.title"
            divId="logoutModal"
            footerButtons={footerButtons}
        >
            <div style={{ padding: "10px" }}>
                <FormattedMessage id="logoutConfirmation.message" 
                    defaultMessage="Are you sure you want to log out?"/>
            </div>
        </Modal>
    )
};


export default LogoutConfirmationModal;