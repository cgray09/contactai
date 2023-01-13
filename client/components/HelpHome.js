import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import { Button } from '@progress/kendo-react-buttons';
import axios from 'axios';

//Help Home Page

const HelpHome = (props) => {

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

    const navHistory = [{ url: "/home", label: "Home" }]

    //const flowchartUrl = ('http://prodmgmt.noblesys.com/proddata/PDM/DN%20-%20Workspace/Contact%20AI/Wireframes/#g=1&p=flowchart')

    const footerButtons =
        <div className="actions">
            <Button className="button actions" onClick={() => backButton()}>
                Go Back
            </Button>
        </div>

    return (
        <div>
            <ContentBox titleString="Contact AI Help" divId="home" navHistory={navHistory} footerButtons={footerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Content help for what is offered in this product </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => window.open(props.helpUrl, "_blank")}>
                            Contents
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Contact information to reach Noble Systems </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/About')}>
                            Contact
                        </Button>
                    </div>
                </div>
            </ContentBox>
            {props.footer}
        </div>
    );
};

export default HelpHome;