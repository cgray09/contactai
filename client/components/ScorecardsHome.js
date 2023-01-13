import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import { Button } from '@progress/kendo-react-buttons';
import axios from 'axios';

//Scorecards Home Page

const ScorecardsHome = (props) => {

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
            <ContentBox titleString="Scorecards" divId="home" navHistory={navHistory} footerButtons={footerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Define time periods for call campaigns </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/ScoreDefineTimePeriods')}>
                            Define Time Periods
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Change include sample point information </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/ScoreIncludeSamplePoint')}>
                            Include Sample Point
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> CHange Exclude sample point information </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/ScoreExcludeSamplePoint')}>
                            Exclude Sample Point
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Assign scorecards in call campaign </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/ScoreAssignScorecards')}>
                            Assign Scorecards
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Set analysis characteristics for the dialer </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/ScoreAnalysisCharacteristics')}>
                            Set Analysis Characteristics
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Manage and view Scorecards </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/ScoreViewModelDef')}>
                            Manage/View Scorecards
                        </Button>
                    </div>
                </div>
            </ContentBox>
            {props.footer}
        </div>
    );
};

export default ScorecardsHome;