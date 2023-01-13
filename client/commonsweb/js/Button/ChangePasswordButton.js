import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* Requirements - must pass in following as props
- displayButton boolean: This button is automatically included in the LoginBox components footer. However not all login screens support change password
                            So need to determine whether or not to display this button    
*/

const ChangePasswordButton = (props) => {

    if(props.displayButton){
        return (
            <div className="rightAlign">
                <Button onClick={props.handleEvent}>
                    <FormattedMessage id="action.changePassword" defaultMessage="Change Password"/>
                </Button>
            </div>
        );
    }
    else{
        return null;
    }
    
}

export default ChangePasswordButton;