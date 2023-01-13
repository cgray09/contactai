import React from "react";
import Modal from "../../commonsweb/js/ModalTemplate/Modal";
import { Button } from "@progress/kendo-react-buttons";
import { FormattedMessage } from "react-intl";

/*
    Generic Confirmaton Modal for CT Admin. Accepts below props -
    messageId - to display local specifc formatted message
    defaultMessage - default message to display
    onConfirm - function to invoke after user clicks on Yes/Confirm.
    messageArgs -  *Optional* Pass any args for translated message string
*/

const ConfirmationModal = (props) => {

    const onConfirm = () => {
        closeConfirmationModal();
        props.onConfirm();
    }

    const closeConfirmationModal = () => {
        var modal = document.getElementById('confirmationModal');
        modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeConfirmationModal}>
                <FormattedMessage id="action.cancel" defaultMessage="Cancel" />
            </Button>
            <Button onClick={onConfirm}>
                <FormattedMessage id="action.yes" defaultMessage="Yes" />
            </Button>
        </div>

    return (
        <Modal
            titleId="action.confirm"
            divId="confirmationModal"
            footerButtons={footerButtons}
        >
            <div className="contentBoxRow">
                <div className="container"></div>
                <div style={{ padding: "10px" }}>
                {props.messageId ? <FormattedMessage id={props.messageId} values={props.messageArgs} /> :  props.defaultMessage }
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmationModal;