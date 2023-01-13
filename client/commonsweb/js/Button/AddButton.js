import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* Requirements - must pass in following function as a prop
    - addEvent() : event handler for add button
*/

const AddButton = (props) => {

    return (
        <div className="rightAlign">
            <Button onClick={props.addEvent}>
                <FormattedMessage id="action.add" defaultMessage="Add"/>
            </Button>
        </div>
    );
}

export default AddButton;