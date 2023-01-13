import React from 'react';
import DynamicColumnGrid from './DynamicColumnGrid';

const DownSegmentPopulation = (props) => {

    return (
        <DynamicColumnGrid
            {...props}
            API_ENDPOINT='/api/segmentpop/'
            navHistory = {[{ url: "/Home", label: "Home" }, { url: "/DownloadHome", label: "Download" }]}
            addButtonLabel='download.addSegmentPop'
            contentBoxTitleId='download.segmentPopulation'
            history={props.history}
            columns = {[
                { title: props.getLocalizedString("download.description"), field: 'description', filter: 'text', show: true },
                { title: props.getLocalizedString("download.populationNumber"), field: 'spId', filter: 'text', show: true },
            ]}
            page="SEGMENTPOPULATION"
            getLocalizedString={props.getLocalizedString}
            viewOnly={props.viewOnly}
        />
    );
}

export default DownSegmentPopulation;