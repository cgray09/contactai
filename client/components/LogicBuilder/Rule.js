import React from 'react';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { filterBy } from '@progress/kendo-data-query';

const Rule = (props) => {

    const [data, setData] = React.useState([...props.dictionary]);

    const filterData = (filter) => {
        const data = props.dictionary.slice();
        return filterBy(data, filter);
    };

    const filterChange = (event) => {
        setData(filterData(event.filter));
    };

    React.useEffect(() => {
        setData(props.dictionary);
    }, [props.dictionary])

    const operatorList = ["equal to", "not equal to", "greater than", "greater than or equal to", "less than", "less than or equal to"];
    const connectors = ["AND", "OR"];
    const operatorType = ['String', 'Numeric'];

    const connectorDropdown =
        <DropDownList
            style={{ width: "75px", margin: "5px" }}
            data={connectors}
            name="connector"
            value={props.ruleValues.connector}
            onChange={props.handleDetailChange(props.groupIndex, props.index)}
            disabled={props.viewOnly}
        />

    return (
        <div>
            <ComboBox
                name="operand1"
                onChange={props.handleDetailChange(props.groupIndex, props.index, data)}
                data={data}
                allowCustom={true}
                style={{ width: "250px", padding: "5px" }}
                value={props.ruleValues.operand1}
                placeholder={'Set Operand 1'}
                filterable={true}
                onFilterChange={filterChange}
                disabled={props.viewOnly}
            />
            <DropDownList
                name="operator"
                style={{ width: "165px", margin: "5px" }}
                data={operatorList}
                value={props.ruleValues.operator}
                onChange={props.handleDetailChange(props.groupIndex, props.index, data)}
                disabled={props.viewOnly}
            />
            <DropDownList
                name="operatorType"
                style={{ width: "165px", margin: "5px" }}
                data={operatorType}
                value={props.ruleValues.operatorType}
                onChange={props.handleDetailChange(props.groupIndex, props.index, data)}
                disabled={props.viewOnly}
            />
            <ComboBox
                name="operand2"
                onChange={props.handleDetailChange(props.groupIndex, props.index, data)}
                data={data}
                allowCustom={true}
                style={{ width: "250px", padding: "5px" }}
                value={props.ruleValues.operand2}
                placeholder={'Set Operand 2'}
                filterable={true}
                onFilterChange={filterChange} 
                disabled={props.viewOnly}
            />
            {props.index < props.numOfLogicLines - 1 ? connectorDropdown : null}
        </div>
    );
}

export default Rule;