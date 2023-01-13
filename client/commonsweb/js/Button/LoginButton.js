import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* Requirements - must pass in following function as a prop
    - loginEvent() : event handler for login button
*/

const LoginButton = (props) => {

    return (
        <div className="rightAlign">
            <Button primary={true} onClick={props.loginEvent}>
                <FormattedMessage id="action.logIn" defaultMessage="Login" />
            </Button>
        </div>
    );
}

export default LoginButton;