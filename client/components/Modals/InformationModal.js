import React from "react";
import Modal from "../../commonsweb/js/ModalTemplate/Modal";
import { Button } from "@progress/kendo-react-buttons";
import { FormattedMessage } from "react-intl";
import ModalStateDisplay from "../../commonsweb/js/ModalTemplate/ModalStateDisplay";

/*
    Generic Information Modal for CT Admin. Accepts below props -
    messageId - to display local specifc formatted message
    defaultMessage - default message to display
    toggleModal - parent function passed as prop to toggle this Modal
    isOpen - determines if the modal would be displayed or not.
    messageArgs -  *Optional* Pass any args for translated message string
*/

const InformationModal = (props) => {

    const footerButtons =
        <div className="actions">
            <Button onClick={props.toggleModal}>
                <FormattedMessage id="action.ok" defaultMessage="Ok" />
            </Button>
        </div>

    return (
        <ModalStateDisplay
            isOpen={props.isOpen}
            titleId="action.information"
            divId="informationModal"
            footerButtons={footerButtons}
        >
            <div className="contentBoxRow">
                <div className="container"></div>
                <div style={{ padding: "10px" }}>
                {props.messageId ? <FormattedMessage id={props.messageId} values={props.messageArgs} /> :  props.defaultMessage }                </div>
            </div>
        </ModalStateDisplay>
    )
}

export default InformationModal;