import React from 'react';
import { Input } from "@progress/kendo-react-inputs";
import { Error } from "@progress/kendo-react-labels";

const InputCell = props => {
    
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
            {props.dataItem.inEdit ? (<Input
                required
                value={props.dataItem[props.field]}
                onChange={handleOnChange}
            />) : (
                props.dataItem[props.field].toString()
            )}
            {!props.validationLogic(props.dataItem[props.field]) && <Error>Cannot be empty</Error>}
        </td>
    );
};

export default InputCell;