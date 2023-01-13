import React from 'react';
import DynamicColumnGrid from './DynamicColumnGrid';

const ScoreIncludeSamplePoint = (props) => {

        return (
            <DynamicColumnGrid
                {...props}
                API_ENDPOINT='/api/scorecards/include/'
                navHistory={[{ url: "/Home", label: "Home" }, { url: "/ScorecardsHome", label: "Scorecards" }]}
                addButtonLabel='scorecards.addSamplePoint'
                contentBoxTitleId='scorecards.includeSamplePoints'
                columns={[
                    { title: props.getLocalizedString("scorecards.description"), field: 'description', filter: 'text', show: true },
                    { title: props.getLocalizedString("scorecards.includeExclude"), field: 'include', filter: 'text', show: true }, //TO-DO: update
                ]}
                page="SAMPLEPOINT"
                getLocalizedString={props.getLocalizedString}
            />
        );
}

export default ScoreIncludeSamplePoint