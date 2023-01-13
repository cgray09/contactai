import * as React from 'react';
import { Checkbox } from "@progress/kendo-react-inputs";

//This component is used for having a checkbox within a cell when activating inline grid edits
const CheckBoxCell = props => {

    const handleChange = e => {
        if (props.onChange) {
            props.onChange({
                dataIndex: 0,
                dataItem: props.dataItem,
                field: props.field,
                syntheticEvent: e.syntheticEvent,
                value: e.target.value
            });
        }
    };

    const { dataItem } = props;
    const field = props.field || '';
    const dataValue = dataItem[field] === null ? '' : dataItem[field];
    return <td>
            <Checkbox onChange={handleChange} value={dataValue} disabled={!dataItem.inEdit} />
        </td>;
};

export default CheckBoxCell;