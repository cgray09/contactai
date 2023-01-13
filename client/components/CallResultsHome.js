import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import SelectDialerNotificationModal from './SelectDialerNotificationModal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import axios from 'axios';

//Home page for Call Results
const CallResultsHome = (props) => {

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

    const isDialerSelected = () => {
        if (props.dialerId) {
            routeToSelectedPage('/CallResultsFileFormat');
        } else {
            openDialerNotificationModal();
        }
    }

    const openDialerNotificationModal = () => {
        var modal = document.getElementById('selectDialerNotificationModal');
    	modal.style.display = "block";
    }

    const navHistory = [{ url: "/home", label: "Home" }]

    const headerButtons =
        <div className="actions">
            <Button className="button actions" onClick={() => backButton()}>
                <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>

    return (
        <div>
            <ContentBox titleString="Call Results" titleId="Call Results" divId="home" navHistory={navHistory} footerButtons={headerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> View and edit the format of files </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => isDialerSelected()}>
                            File Format
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Standardize data of the dialer </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/CallResultsStandardizeData')}>
                            Standardize Data
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Edit exclusion information </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/CallResultsExcludeRecords')}>
                            Exclude Records
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> View and change characteristics in dialers </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/CallResultsKeepCharacteristics')}>
                            Keep Characteristics
                        </Button>
                    </div>
                </div>
            </ContentBox> 
            <SelectDialerNotificationModal />       
            {props.footer}
        </div>
    );
};

export default CallResultsHome;