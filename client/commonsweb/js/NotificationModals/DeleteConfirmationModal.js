import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';


/* 
 This modal displays a delete confirmation message when a user attempts to delete something of importance
 
 Requirements - must pass in following function as a prop
	- deleteEvent() : event handler for delete action
    - divId: The element id used to differentiate this delete confirmation modal from others. Required in order to locate modal to open and close.
    
    - messageId: The id of the localized string to use in <FormattedMessage> to grab translated message
        or
    - messageString: The string value to display in the modal message
    
    - titleId: The id of the localized string to use in <FormattedMessage> to grab translated title
        or
    - titleString: The string value to display as the title

    - messageArgs: *Optional* Pass any any args for translated message string
*/

const DeleteConfirmationModal = (props) => {

    const closeDeleteModal = () => {
        var modal = document.getElementById(props.divId);
        modal.style.display = "none";
        props.cancelRemoval();
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeDeleteModal}>
                <FormattedMessage id="action.no" defaultMessage="No" />
            </Button>
            <Button onClick={props.deleteEvent}>
                <FormattedMessage id="action.yes" defaultMessage="Yes" />
            </Button>
        </div>

    return (
        <Modal
            titleId={props.titleId}
            titleString={props.titleString}
            divId={props.divId}
            footerButtons={footerButtons}
        >
            {props.new_row ? (
                <div style={{ padding: "10px" }}>
                    <FormattedMessage id="deleteConfirmation2" defaultMessage="deleteConfirmation2" />
                </div>
            ) : (
                <div style={{ padding: "10px" }}>
                    {props.messageId ? <FormattedMessage id={props.messageId} values={props.messageArgs} /> : props.messageString}
                </div>
            )}
        </Modal>
    );
};


export default DeleteConfirmationModal;