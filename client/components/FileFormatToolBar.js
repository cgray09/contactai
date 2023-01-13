import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import FileFormatImport from './FileFormatImport';
import FileFormatExport from './FileFormatExport';
import FileFormatImportWarningModal from './FileFormatImportWarningModal';
import { FormattedMessage } from 'react-intl';
import ConfirmationModal from './Modals/ConfirmationModal';

const FileFormatToolBar = (props) => {

    const [displayImport, toggleModal] = useState(false); 

    const importFormat = () => {
        toggleModal(!displayImport);
    };

    const openImportWarningModal = () => {
        var modal = document.getElementById('importWarningModal');
        modal.style.display = "block";
    };
    
    const openCreateDSConfirmModal = () => {
        var modal = document.getElementById('confirmationModal');
        modal.style.display = "block";
    };

   return (
        <div className="actions">
            <div style={{ display: "inline-flex", marginRight: "15px" }}>
                {/* Field Delimited: {props.properties.useDelimiter ? "Yes" : "No"} */}
                <FormattedMessage id="fileFormat.delimited" defaultMessage="Field Delimited" />: {props.properties.useDelimiter ? "Yes" : "No"}
            </div>
            {props.properties.useDelimiter ? <div style={{ display: "inline-flex", marginRight: "15px" }}>
                {/* Delimiter: "{props.properties.delimiter}" */}
                <FormattedMessage id="fileFormat.delimiter" defaultMessage="Delimiter" />: "{props.properties.delimiter}"
            </div> : null}
            <div style={{ display: "inline-flex", marginRight: "15px" }}>
                {/* Record Length: {props.properties.recordLength} */}
                <FormattedMessage id="fileFormat.recordLength" defaultMessage="Record Length" />: {props.properties.recordLength}
            </div>
            <Button onClick={props.toggleModal} disabled={props.viewOnly}>
                <FormattedMessage id="fileFormat.setProperties" defaultMessage="Set Properties" />
            </Button>
            <Button onClick={openImportWarningModal} disabled={props.viewOnly}>
                <FormattedMessage id="fileFormat.importCSV" defaultMessage="Import CSV" />
            </Button>
            <FileFormatImportWarningModal importFormat={importFormat} />
            { displayImport ? 
                <FileFormatImport 
                    fetchData={props.fetchData} 
                    displayImport={displayImport} 
                    toggleModal={toggleModal} 
                    dialerId={props.dialerId} 
                    page={props.page}/> 
            : null }
            <FileFormatExport data={props.data} properties={props.properties}/>
            { props.page === "dlfileformat" ?
               <Button onClick={openCreateDSConfirmModal} disabled={props.viewOnly}>
                   <FormattedMessage id="fileFormat.download.createDS" defaultMessage="Create DS" />
               </Button>
            : null}
            <ConfirmationModal 
                messageId="fileFormat.download.createDS.confirm" 
                defaultMessge="Automatically create Days Since generated characteristic for Dates?"
                onConfirm ={props.createDS}
            />           
        </div>
    );
}

export default FileFormatToolBar;