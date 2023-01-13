import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* SubmitButtonGroup consits of a submit and cancel button. Can be used to add to a form.
    
    Requirements - must pass in following functions as props
    - cancelEvent() : event handler for cancel button
    - submitEvent() : event handler for submit button
*/

const SubmitButtonGroup = (props) => {

    return (
        <div className="actions">
            <Button onClick={props.cancelEvent}>
                <FormattedMessage id="action.cancel" defaultMessage="Cancel"/>
            </Button>
            <Button primary={true} onClick={props.submitEvent}>
                <FormattedMessage id="action.submit" defaultMessage="Submit"/>
            </Button>
        </div>
    );
}

export default SubmitButtonGroup;