import { NumericTextBox } from '@progress/kendo-react-inputs';
import * as React from 'react';

const FileFormatLengthCell = props => {

    const { dataItem } = props;

    const handleOnChange = e => {
        props.onChange({
            dataItem: props.dataItem,
            field: props.field,
            syntheticEvent: e.syntheticEvent,
            value: e.value
        });
    }; 
    
    const lengthDisplay = () => {
        let length = null;
        if(dataItem.endPos && dataItem.startPos) 
            length = dataItem.endPos - dataItem.startPos + 1;
        return props.dataItem[props.field] ? props.dataItem[props.field] : length;
    }

    return (
        <td>
            {props.dataItem.inEdit ? (<NumericTextBox
                required={props.required}
                min={props.min ? props.min : null}
                max={props.max ? props.max : null}
                value={ lengthDisplay()}
                onChange={handleOnChange}
            />) : (
                lengthDisplay()
            )}
        </td>
    );
    
};

export default FileFormatLengthCell;