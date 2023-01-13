import React from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import { filterBy } from '@progress/kendo-data-query';
import { FormattedMessage } from 'react-intl';

const DiscretizeRule = (props) => {

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

    return (
        <div>
            {props.index === 0 ? <FormattedMessage id="sqlBuilder.if" defaultMessage="IF" /> : <FormattedMessage id="sqlBuilder.elseif" defaultMessage="ELSE IF" />}
            <ComboBox
                name="operand1"
                onChange={props.handleDiscretizeChange(props.index)}
                data={data}
                allowCustom={true}
                style={{ width: "250px", padding: "5px" }}
                value={props.discretizeInFocus.operand1}
                placeholder={'Set Operand 1'}
                title='test tooltip'
                filterable={true}
                onFilterChange={filterChange}
                disabled={props.viewOnly}
            />
            <FormattedMessage id="sqlBuilder.lessThanOrEqualTo" defaultMessage="is less than or equal to" />
            <ComboBox
                name="operand2"
                onChange={props.handleDiscretizeChange(props.index)}
                data={data}
                allowCustom={true}
                style={{ width: "250px", padding: "5px" }}
                value={props.discretizeInFocus.operand2}
                placeholder={'Set Operand 2'}
                filterable={true}
                onFilterChange={filterChange}
                disabled={props.viewOnly}
            />
            <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                <div style={{ display: "inline-block", width: "100%" }}>
                    <div className="label" style={{ display: "inline-block", fontWeight: 700, width: "100%" }}>
                        {"THEN set " + props.name + " equal to  "}
                        <Input name="asgValue" value={props.discretizeInFocus.asgValue} onChange={props.handleDiscretizeChange(props.index)} style={{ width: '250px' }} disabled={props.viewOnly} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiscretizeRule;