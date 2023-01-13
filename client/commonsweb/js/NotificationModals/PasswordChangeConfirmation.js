import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* 
 
 This modal should be displayed to the user after attempting to change the user password
 
 Requirements - must pass in following function as a prop
    - successful : boolean representing whether the password change was successful or not

Optional Props:
    - errorMessage: The error message to display if password change was unsuccessful

*/

const PasswordChangeConfirmation = (props) => {

    const closeModal = () => {
        var modal = document.getElementById('pwChangeConfirmModal');
    	modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeModal}>
                <FormattedMessage id="action.ok" defaultMessage="Ok"/>
            </Button>
        </div>
    
    const getMessage = () => {
        if(props.successful){
            return <FormattedMessage id="pwChange.passwordChangeSuccessful" defaultMessage="Password Change Successful!"/>
        }
        else if(props.errorMessage){
            return props.errorMessage;
        }
        return <FormattedMessage id="pwChange.unableToChangePassword" defaultMessage="Error Occured. Unable to change password"/>
    }

    return (
        <Modal
            titleId={props.successful ? "action.success" : "action.error"}
            divId="pwChangeConfirmModal"
            footerButtons={footerButtons}
        >
            <div className={props.successful ? "" : "errorInline"}style={{ padding: "10px" }}>
                {getMessage()}
            </div>
        </Modal>
    )
};


export default PasswordChangeConfirmation;