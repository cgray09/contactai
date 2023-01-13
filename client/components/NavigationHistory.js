import React from 'react';
import { withRouter } from 'react-router-dom'
import { FormattedMessage } from 'react-intl';

/*Included in ConentBoxHeader component
    - Will display the page history as links so user can navigate backwards if needed
    - In order to display, will need an array full of objects containing
        - url: String value of url
        - label: The string resource id which will be used to grab the label from resource file
*/

const NavigationHistory = (props) => {

    const route = (url) => {
        props.history.push(url);
    }

    const navHistory = props.navHistory;
    const navHistoryLinks = navHistory.map((item) =>
        <a key={item.url.toString()} onClick={() => route(item.url)}><FormattedMessage id={item.label} />></a>
    );

    return (
        <div id="contentBoxBreadcrumb" className="nuiBreadcrumb">
            {navHistoryLinks}
        </div>
    );
}

export default withRouter(NavigationHistory)