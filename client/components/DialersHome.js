import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import axios from 'axios';

//Dialers Home page
const DialersHome = (props) => {

    useEffect(() => {
        axios.get("/api/dialers") //just a dummy call to dialers api to check if we are authorized to be in application
            .catch((error) => {
                if (error.response.status === 401) {
                    console.log("User is unauthorized. Routing back to login");
                    routeToSelectedPage("/");
                }
            });
    })
    
    const routeToSelectedPage = (url) => {
        props.history.push(url);
    }

    const backButton = () => {
        props.history.goBack();
    }

    const navHistory = [{ url: "/home", label: "home.title" }]

    const headerButtons =
        <div className="actions">
            <Button className="button actions" onClick={() => backButton()}>
                <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>

    return (
        <div>
            <ContentBox titleString="Dialers" divId="home" navHistory={navHistory} headerButtons={headerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Configure Dialers </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/DialersConfigure')}>
                            Configure Dialers
                        </Button>
                    </div>
                </div>
            </ContentBox>
            {props.footer}
        </div>
    );
};

export default DialersHome;