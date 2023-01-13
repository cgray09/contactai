import React from 'react';
import DynamicColumnGrid from './DynamicColumnGrid';

const UseCallHistoryCell = props => {

    const { dataItem } = props;
    const field = props.field || '';
    const dataValue = dataItem[field] ? 'Yes' : 'No';
    return <td>{dataValue}</td>;
};
        
const ScoreAssignScorecards = (props) => {

    return (
        <DynamicColumnGrid
            {...props}
            API_ENDPOINT='/api/scorecards/assignsc/'
            navHistory={[{ url: "/Home", label: "Home" }, { url: "/ScorecardsHome", label: "Scorecards" }]}
            addButtonLabel='scorecards.addAssignment'
            contentBoxTitleId='scorecards.assignScorecards'
            columns={[
                { title: props.getLocalizedString("scorecards.description"), field: 'description', filter: 'text', show: true},
                { title: props.getLocalizedString("scorecards.num"), field: 'scoreId', filter: 'text', show: true },
                { title: props.getLocalizedString("scorecards.useCallHistory"), field: 'callHistory', filter: 'text', show: true, cell: UseCallHistoryCell },
            ]}
            page="ASSIGNMENT"
            getLocalizedString={props.getLocalizedString}
        />
    );
}

export default ScoreAssignScorecards;