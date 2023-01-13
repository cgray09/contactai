import React from 'react';
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { Error } from "@progress/kendo-react-labels";

const NumericCell = props => {

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
                value={props.dataItem[props.field]}
                onChange={handleOnChange}
            />) : (
                props.dataItem[props.field]
            )}
            {props.validationLogic ?
                !props.validationLogic(props.dataItem[props.field]) : false && <Error>Cannot be empty</Error>}
        </td>
    );
};

export default NumericCell;