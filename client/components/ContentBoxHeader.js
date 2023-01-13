import React from 'react';
import NavigationHistory from './NavigationHistory'
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/*Included in ContentBox component
    - Will render the ContentBox title passed to it as a prop
*/

const ContentBoxHeader = (props) => {

    return (
        <div className="contentBoxHeader">
            {/* If no navHistory prop is provided, pass in an empty array to avoid undefined error */}
            <NavigationHistory navHistory={props.navHistory ? props.navHistory : []} />
            <label className="title titleColor">
                {props.titleId ? <FormattedMessage id={props.titleId} /> : props.titleString}
            </label>
            {props.headerButtons}
        </div>
    );
}

export default ContentBoxHeader;

