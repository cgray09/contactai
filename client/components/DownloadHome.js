import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import SelectDialerNotificationModal from './SelectDialerNotificationModal';
import { Button } from '@progress/kendo-react-buttons';
import axios from 'axios';


const DownloadHome = (props) => {

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

    const isDialerSelected = (routeToUrl) => {
        if (props.dialerId) {
            routeToSelectedPage(routeToUrl);
        } else {
            openDialerNotificationModal();
        }
    }

    const openDialerNotificationModal = () => {
        var modal = document.getElementById('selectDialerNotificationModal');
    	modal.style.display = "block";
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
            <ContentBox titleString="Download" divId="home" navHistory={navHistory} footerButtons={footerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Download File Format </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => isDialerSelected('/DownloadFileFormat')}>
                            Download File Format
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Supplementary File Format </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => isDialerSelected('/DownSuppFileFormat')}>
                            Supplementary File Format
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Segment Population </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/DownSegmentPopulation')}>
                            Segment Population
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Compute Characteristics </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/DownComputeCharacteristics')}>
                            Compute Characteristics
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Exclude Records </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/DownExcludeData')}>
                            Exclude Records
                        </Button>
                    </div>
                </div>
            </ContentBox>
            <SelectDialerNotificationModal />
            {props.footer}
        </div>
    );
};

export default DownloadHome;

/*
                  <div className="contentBoxRow">
                    <label className="label">
                        <span> Download File Format </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage()}>
                            Download File Format
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Supplementary File Format </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage()}>
                            Supplementary File Format
                        </Button>
                    </div>
                </div>
*/