import * as React from 'react';
import { ComboBox } from '@progress/kendo-react-dropdowns';

//This component is used for having a combo box within a cell when activating inline grid edits
//required to pass in 'data' as a prop. This is what will be what populates the dropdown
//The 'data' prop will need to be in following format: [{text:'<enter_text_representation>' value:<enter_value>}, {text:'<enter_second_text>' value:<enter_second_val>} etc...}]
//The data will be an array of objects which have a text and value field.
//If there is no difference between the text or the value, just enter the same value for both text and value fields
//Can optionally sent a "width" prop to size the Combo Box. Otherwise it'll default to 100px

const ComboBoxCell = props => {

    const handleChange = e => {
        let input = e.target.value;
        
        //If there is text but not value, it means a custom value was entered
        //Update the custom value to be the same as the text
        // if(input && (input.text && !input.value)) {
        //     input.value = input.text;
        // }

        if (props.onChange) {
            props.onChange({
                dataIndex: 0,
                dataItem: props.dataItem,
                field: props.field,
                syntheticEvent: e.syntheticEvent,
                value: input
            });
        }
    };

    const { dataItem } = props;
    const field = props.field || '';
    const dataValue = dataItem[field] === null ? '' : dataItem[field];
    return <td>
        {dataItem.inEdit ? 
            <ComboBox style={{width: props.width ? props.width : "100px"}} 
            onChange={handleChange}
            allowCustom={true} 
            value={dataValue}
            data={props.data} /> : dataValue.toString()}
    </td>;
};

export default ComboBoxCell;