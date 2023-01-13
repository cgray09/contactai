import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* Requirements - must pass in following function as a prop
    - logoutEvent() : event handler for logout button
*/

const LogoutButton = (props) => {

    return (
        <div className="rightAlign">
            <Button primary={true} onClick={props.logoutEvent}>
                <FormattedMessage id="action.logOut" defaultMessage="Log Out"/>
            </Button>
        </div>
    );
}

export default LogoutButton;