import { NumericTextBox } from '@progress/kendo-react-inputs';
import * as React from 'react';

const FileFormatEndPosCell = props => {

    const { dataItem } = props;

    const handleOnChange = e => {
        props.onChange({
            dataItem: props.dataItem,
            field: props.field,
            syntheticEvent: e.syntheticEvent,
            value: e.value
        });
    };    

    return (
        <td>
            {props.dataItem.inEdit ? (<NumericTextBox
                required={props.required}
                min={props.min ? props.min : null}
                max={props.max ? props.max : null}
                value={ props.dataItem[props.field]}
                onChange={handleOnChange}
            />) : (
                props.dataItem[props.field]
            )}
        </td>
    );
    
};

export default FileFormatEndPosCell;