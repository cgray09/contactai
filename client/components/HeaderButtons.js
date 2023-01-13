import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { userService } from "../services/userSvc";

const HeaderButtons = (props) => {

    const routeToSelectedPage = (url) => {
        props.history.push(url);
    }

    return (
        <div>
            <div className="rightAlign">
                <Button primary={true} onClick={() => routeToSelectedPage('/home')}>
                    Home
                </Button>
            </div>
            <div>
                <Button primary={true} onClick={userService.logout} href="/sign-in">
                    Log out
                </Button>  
            </div>
        </div>
    );
}

export default HeaderButtons;