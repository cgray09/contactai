import React from 'react';
import { CSVLink } from "react-csv";
import { FormattedMessage } from 'react-intl';

const FileFormatExport = (props) => {

    const getHeaderLabels = () => {
        let ffProp = props.properties;
        let recordLength = pad(ffProp.recordLength, 15, null); //pad with enough leading zeros to make 15 characters long
        let label = recordLength + "          " + ffProp.delimiter + "          " + ffProp.useDelimiter;
        //Set all column headers to blank except for the first one
        let headerLabels = [
            { label: label, key: "aColumn" }, { label: "", key: "bColumn" }, { label: "", key: "cColumn" }, { label: "", key: "dColumn" }, { label: "", key: "eColumn" },
            { label: "", key: "fColumn" }, { label: "", key: "gColumn" }, { label: "", key: "hColumn" }, { label: "", key: "iColumn" }
        ]
        return headerLabels;
    }

    const getCSVData = () => {
        let fileFormats = props.data;
        let parsedFormat = [];
        fileFormats.forEach((fileFormat) => {
            parsedFormat.push(parseCSVData(fileFormat, props.properties.useDelimiter));
        })
        return parsedFormat;
    }

    const parseCSVData = (ff, useDelimiter) => {
        //If using a delimiter, do not include the start and end fields
        let parsedFormat = {
            aColumn: ff.name,
            bColumn: useDelimiter ? ff.type : ff.startPos,
            cColumn: useDelimiter ? ff.formatter : (ff.fieldLength ? ff.fieldLength : ff.endPos - ff.startPos + 1), //if fieldLength is null, then set fieldLength based on start/endPos. 
                                                                                        //Found customer data with missing fieldLength values in Database.
            dColumn: useDelimiter ? ff.specialInfo : ff.type,
            eColumn: useDelimiter ? ff.description : ff.formatter,
            fColumn: useDelimiter ? null : ff.specialInfo,
            gColumn: useDelimiter ? null : ff.description,
        }
        return parsedFormat;
    }

    //Used to pad leading zeros. N is the value we want to pad. Width is the number of characters we want the value to have.
    //z argument is optional. If provided, it will be used in the place of zeros when padding
    const pad = (n, width, z) => {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    return (
            <CSVLink
                headers={getHeaderLabels()}
                data={getCSVData()}
                filename="fileformat_export.csv"
                className="k-button"
            >
                <FormattedMessage id="fileFormat.exportCSV" defaultMessage="Export CSV" />
            </CSVLink>
    );
}

export default FileFormatExport;