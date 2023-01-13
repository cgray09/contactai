import * as React from 'react';
import { DropDownList } from '@progress/kendo-react-dropdowns';

const ComputeCharDropDownCell = props => {

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
        {dataItem.isNew ? 
            <DropDownList style={{width: props.width ? props.width : "100px"}} 
            onChange={handleChange} 
            value={props.data.find(c => c === dataValue)} 
            data={props.data} /> : dataValue && dataValue.toString()}
    </td>;
};

export default ComputeCharDropDownCell;