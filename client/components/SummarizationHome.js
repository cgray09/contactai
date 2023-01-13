import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import { Button } from '@progress/kendo-react-buttons';
import axios from 'axios';

//summarizations home page

const SummarizationHome = (props) => {

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

    const footerButtons =
        <div className="actions">
            <Button className="button actions" onClick={() => backButton()}>
                Go Back
            </Button>
        </div>

    return (
        <div>
            <ContentBox titleString="Summarization" divId="home" navHistory={navHistory} footerButtons={footerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Compute characteristics of dialer </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/SumComputeCharacteristics')}>
                            Compute Characteristics
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Keep characteristics of dialer </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/SumKeepCharacteristics')}>
                            Keep Characteristics   
                        </Button>
                    </div>
                </div>
            </ContentBox>
            {props.footer}
        </div>
    );
};

export default SummarizationHome;