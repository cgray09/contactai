import React from 'react';
import Modal from '../commonsweb/js/ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import { Warning } from '@material-ui/icons';

/* 
    Modal for Select Dialer Notification to let user know that a dialer must be selected before a 
    dialer dependent page can be displayed.
*/

const SelectDialerNotificationModal = (props) => {

    const closeDialerNotificationModal = () => {
        var modal = document.getElementById('selectDialerNotificationModal');
    	modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeDialerNotificationModal}>
                <FormattedMessage id="action.ok" defaultMessage="Ok"/>
            </Button>
        </div>

    return (
        <Modal
            titleId="modal.warning"
            divId="selectDialerNotificationModal"
            footerButtons={footerButtons}
        >
            <div className="contentBoxRow">
                <div className="container"></div>
                <div style={{ padding: "10px" }}>
                    <FormattedMessage id="dialer.selection.warning.message" 
                        defaultMessage="Dialer must be selected in the Top Menu before proceeding."/>
                </div>
            </div>
                
        </Modal>
    )
};


export default SelectDialerNotificationModal;