import React from 'react';
import Modal from '../ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import ErrorGroup from './ErrorGroup';
import { FormattedMessage } from 'react-intl';

const ErrorGroupModal = (props) => {

    const closeErrorModal = () => {
        var modal = document.getElementById('errorGroupModal');
        modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeErrorModal}>
                <FormattedMessage id="action.close" defaultMessage="Close" />
            </Button>
        </div>

    return (
        <Modal
            titleId={props.customTitleId ? props.customTitleId : "errorGroupModal.title"}
            divId="errorGroupModal"
            footerButtons={footerButtons}
        >
            {props.children}
            <ErrorGroup errorMessages={props.errorMessages} />
        </Modal>
    );
};


export default ErrorGroupModal;