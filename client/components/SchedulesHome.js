import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import { Button } from '@progress/kendo-react-buttons';
import axios from 'axios';

//Schedule Home

const SchedulesHome = (props) => {

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

    const footerButtons =
        <div className="actions">
            <Button className="button actions" onClick={() => backButton()}>
                Go Back
            </Button>
        </div>

    return (
        <div>
            <ContentBox titleString="Schedule" divId="home" footerButtons={footerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Schedules </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/Scripts')}>
                            Open
                        </Button>
                    </div>
                </div>
            </ContentBox>
            {props.footer}
        </div>
    );
};

export default SchedulesHome;