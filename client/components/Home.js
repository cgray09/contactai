import React, { useEffect } from 'react';
import { ContentBox, Footer, HomeFooterButtons } from './';
import { Button } from '@progress/kendo-react-buttons';
import axios from 'axios';

//Home Page. Will be the first page the content box loads once logged in. for the first Dialer.

const Home = (props) => {

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

    return (
        <div>
            <ContentBox titleString="Home" divId="home">
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Edit call results for the dialer</span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/CallResultsHome')}>
                            Call Results
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Edit summarizations for the dialer </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/SummarizationHome')}>
                            Summarizations
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Download dialer information </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/DownloadHome')}>
                            Downloads
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Edit assignments for the dialer </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/AssignmentHome')}>
                            Assignments
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Edit scorecards for the dialer </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/ScorecardsHome')}>
                            Scorecards
                        </Button>
                    </div>
                </div>
            </ContentBox>
            {props.footer}
        </div>
    );
};

export default Home;