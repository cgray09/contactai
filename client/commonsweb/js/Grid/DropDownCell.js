import * as React from 'react';
import { DropDownList } from '@progress/kendo-react-dropdowns';

//This component is used for having a dropdown within a cell when activating inline grid edits
//required to pass in 'data' as a prop. This is what will be what populates the dropdown
//The 'data' prop will need to be in following format: [{text:'<enter_text_representation>' value:<enter_value>}, {text:'<enter_second_text>' value:<enter_second_val>} etc...}]
//The data will be an array of objects which have a text and value field.
//Can optionally sent a "width" prop to size the Dropdown. Otherwise it'll default to 100px

const DropDownCell = props => {

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
        {dataItem.inEdit ? 
            <DropDownList style={{width: props.width ? props.width : "100px"}} 
            onChange={handleChange} 
            value={props.data.find(c => c === dataValue)} 
            data={props.data} /> : dataValue.toString()}
    </td>;
};

export default DropDownCell;