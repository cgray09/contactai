import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* 
 
 This modal should be displayed to the user when attempting to access a page or record which is currently in use or being edited by another user

*NOTE* element id for RecordLockNotification is 'recordLockModal'. If wanting to open or display this modal in the application, will need to set its
		display to block. Ex) document.getElementById('logoutModal').style.display = "block"
*/

const RecordLockNotification = (props) => {
    
    const closeLogoutModal = () => {
        var modal = document.getElementById('recordLockModal');
    	modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeLogoutModal}>
                <FormattedMessage id="action.close" defaultMessage="Close"/>
            </Button>
        </div>

    return (
        <Modal
            titleId="recordLock.title"
            divId="recordLockModal"
            footerButtons={footerButtons}
        >
            <div style={{ padding: "10px" }}>
                <FormattedMessage id="recordLock.message" 
                    defaultMessage="This record is currently in use by another user and has been locked"/>
            </div>
        </Modal>
    )
};


export default RecordLockNotification;