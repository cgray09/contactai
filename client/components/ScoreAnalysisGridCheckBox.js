import * as React from 'react';
import { Checkbox } from "@progress/kendo-react-inputs";

//There is a generic CheckBoxCell component in commonsweb, but created a custom one for GroupR since
//It will need to be enabled only when type is 'CHARACTER'
const ScoreAnalysisGridCheckBox = props => {

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

    if(props.field === 'active' || (props.field === 'groupr' && dataItem['type'] === 'CHARACTER')){
        return <td>
            <Checkbox onChange={handleChange} value={dataValue === 1} disabled={!dataItem.inEdit} />
        </td>;
    }
    return <td></td>
    
};

export default ScoreAnalysisGridCheckBox;