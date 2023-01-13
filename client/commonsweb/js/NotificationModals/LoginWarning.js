import React, { useEffect } from 'react';
import ModalStateDisplay from '../ModalTemplate/ModalStateDisplay';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';

/* 
 
 This modal should be displayed to the user if any warnings exist as they attempts to login to application. 
 	An example would be an expired license warning. 
 
 Requirements - must pass in following function as a prop
	- handleEvent() : event handler for pressing 'Ok' in LoginWarningModal
    - displayWarning: boolean which determines whether to open/display the warning modal
	- props.children will render any tags or components included within the <LoginWarning> tags. This represents the actual content.

 *NOTE* element id for LoginWarning is 'lwarningModal'. If wanting to open or display this modal in the application, will need to set its
	display to block. Ex) document.getElementById('lwarningModal').style.display = "block"
*/

const LoginWarning = (props) => {
    
    useEffect(() => {
        if(!props.displayWarning) return;

        function keyListener(e) {
            const listener = keyListenersMap.get(e.keyCode);
            return listener && listener(e);
        }
        document.addEventListener("keydown", keyListener);

        return () => document.removeEventListener("keydown", keyListener);
    });

    //If wanting to assign more key handlers, add the key number along with the associated event handler to this array
    //In this case we are mapping the enter key (13) to the passed in handleEvent function
    const keyListenersMap = new Map([[13, props.handleEvent]]);

    const okButton = 
        <div className="rightAlign">
            <Button onClick={props.handleEvent}>
                <FormattedMessage id="action.ok" defaultMessage="Ok"/>
            </Button>
        </div>

    return (
        <ModalStateDisplay
            titleId="login.warningTitle"
            divId="lwarningModal"
            footerButtons={okButton}
            isOpen={props.displayWarning}
        >
        	{props.children}
        </ModalStateDisplay>
    )
};


export default LoginWarning;