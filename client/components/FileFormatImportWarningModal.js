import React from 'react';
import Modal from '../commonsweb/js/ModalTemplate/Modal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* 
 Modal for FileFormat Import Warning to let user know that existing fileformats will be overwritten and existing if any will be lost.
 
*/

const FileFormatImportWarningModal = (props) => {

    const importFormat = () => {
        props.importFormat();
        closeImportWarningModal();
    }
    
    const closeImportWarningModal = () => {
        var modal = document.getElementById('importWarningModal');
    	modal.style.display = "none";
    }

    const footerButtons =
        <div className="actions">
            <Button onClick={closeImportWarningModal}>
                <FormattedMessage id="action.cancel" defaultMessage="Cancel"/>
            </Button>
            <Button onClick={importFormat}>
                <FormattedMessage id="action.yes" defaultMessage="Yes"/>
            </Button>
        </div>

    return (
        <Modal
            titleId="action.confirm"
            divId="importWarningModal"
            footerButtons={footerButtons}
        >
            <div className="contentBoxRow">
                <div className="container"></div>
                <div style={{ padding: "10px" }}>
                    <FormattedMessage id="fileformat.importWarning.message" 
                        defaultMessage="Existing fileformats will be overwritten by imported rows. Continue?"/>
                </div>
            </div>    
        </Modal>
    )
};


export default FileFormatImportWarningModal;