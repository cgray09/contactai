import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* 

 This modal should automatically be displayed once the user passes the idle user phase and officially times out of their session.
 It only gives them the option of going to the logout screen

 Requirements - must pass in following function as a prop
	- routeToLogoutPage(): This function is in charge of routing user to logout splash screen

*NOTE* element id for TimeoutModalodal is 'timeoutModal'. If wanting to open or display this modal in the application, will need to set its
		display to block. Ex) document.getElementById('timeoutModal').style.display = "block"
*/

const TimeoutModal = (props) => {

    const footerButtons =
        <div className="actions">
            <Button onClick={props.routeToLogoutPage}>
                <FormattedMessage id="action.ok" defaultMessage="Ok" />
            </Button>
        </div>

    return (
        <Modal
            titleId="timeout.title"
            divId="timeoutModal"
            footerButtons={footerButtons}
        >
            <div style={{ padding: "10px" }}>
                <FormattedMessage id="timeout.message"
                    defaultMessage="Your session has expired due to inactivity. Please proceed to logout screen." />
            </div>
        </Modal>
    );
};


export default TimeoutModal;