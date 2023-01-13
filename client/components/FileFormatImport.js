import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import { Error } from "@progress/kendo-react-labels";
import { CSVReader } from 'react-papaparse';
import { commonService } from '../services/commonSvc.js';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

class FileFormatImport extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            importData: [],
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            submitError: null
        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.setState({
            importData: [],
            responseErrors: [],
            actionCompleted: true,
            ffProperties : {},
            submitError: null
        })

    }

    getFFProperties = (headerLabel) => {
        if(headerLabel) { //decode the headerLabel to fetch fileformat properties
            let ffPropsArray = headerLabel.split("          ");            
            let recordLen = ffPropsArray[0].replace(/^0+/, '');  // remove padded 0's if any
            recordLen = recordLen ? Number(recordLen) : 0;
            let delim = ffPropsArray[1];
            let useDelim = ffPropsArray[2] === "true" ? true : false;

            this.setState({
                ffProperties: {
                    recordLength: recordLen,
                    delimiter: delim,
                    useDelimiter: useDelim
                }
            });
        }
    }

    handleUpload = (rows) => {
        if(rows.length > 0) {
            // get header(row 0) first to determine ff properties.
            this.getFFProperties(rows[0].data[0]);
        }
        
        let importData = [];
        for (let i = 0; i < rows.length; i++) {
            //skip header
            if (i != 0) {
                let fileFormat = {};
                let columns = rows[i].data;
                for (let j = 0; j < columns.length; j++) {
                    columns[j] = columns[j] ? columns[j].trim() : columns[j];
                    switch (j) {
                        case 0:
                            fileFormat.name = columns[j];
                            break;
                        case 1:
                            this.state.ffProperties.useDelimiter ? fileFormat.type = columns[j] : fileFormat.startPos = columns[j];
                            break;
                        case 2:
                            this.state.ffProperties.useDelimiter ? fileFormat.formatter = columns[j] : fileFormat.fieldLength = columns[j];
                            break;
                        case 3:
                            this.state.ffProperties.useDelimiter ? fileFormat.specialInfo = columns[j] : fileFormat.type = columns[j];
                            break;
                        case 4:
                            this.state.ffProperties.useDelimiter ? fileFormat.description = columns[j] : fileFormat.formatter = columns[j];
                            break;
                        case 5:
                            if (!this.state.ffProperties.useDelimiter)  fileFormat.specialInfo = columns[j];
                            break;
                        case 6:
                            if (!this.state.ffProperties.useDelimiter)  fileFormat.description = columns[j];
                            break;
                        default:
                            break;
                    }
                }
                if(fileFormat.fieldLength) {
                    fileFormat.endPos = Number(fileFormat.startPos) + Number(fileFormat.fieldLength) - 1;
                }
                if(fileFormat.name && fileFormat.type) { //add to import only if data exists, avoid error on empty rows
                    importData.push(fileFormat); 
                }
            }
        }
        this.setState({ importData });
    }

    handleOnError = (e) => {
        console.log("error entered");
        console.log(e);
    }

    handleOnRemoveFile = (e) => {
        this.setState({responseErrors: [], importData: [], ffProperties: {}});

        console.log("remove file entered");
        console.log(e);
    }

    submit = () => {
        // submit file formats
        axios
            .post("/api/fileformat/" + this.props.dialerId + "/import/" + this.props.page, this.state.importData)
            .then(response => {
                // now submit file format properties
                if(this.state.ffProperties) {                    
                    axios
                    .post("/api/fileFormat/" + this.props.dialerId + "/" + this.props.page + "/properties", this.state.ffProperties)
                    .then(response => {
                        this.handleSuccessfulSubmission();
                    })
                    .catch(error => {
                        this.handleResponseErrors(error);
                    });
                }
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            this.setState({ actionCompleted: true });
            this.props.fetchData();
            this.props.toggleModal(!this.props.displayImport);
        }
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={() => this.props.toggleModal(!this.props.displayImport)}>
                {this.props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {this.props.viewOnly ? null : <Button primary={true} onClick={this.submit}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    render() {
        return (
            <div>
                <ModalStateDisplay
                    titleId="fileFormat.importFileFormatCSV"
                    divId="fileFormatImport"
                    footerButtons={this.getFooterButtons()}
                    isOpen={this.props.displayImport}
                >
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <Error>{this.state.submitError}</Error>
                    <CSVReader
                        onDrop={this.handleUpload}
                        onError={this.handleOnError}
                        onRemoveFile={this.handleOnRemoveFile}
                        addRemoveButton
                    >
                        <span>Drop CSV file here or click to upload.</span>
                    </CSVReader>
                </ModalStateDisplay>
            </div>
        );
    }

}

export default FileFormatImport;