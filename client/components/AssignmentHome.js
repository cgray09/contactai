import React, { useEffect } from 'react';
import { ContentBox, Footer } from './';
import SelectDialerNotificationModal from './SelectDialerNotificationModal';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import axios from 'axios';

//Home page for Assignments

const AssignmentHome = (props) => {

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
            routeToSelectedPage('/AssignDialerOutput');
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
            <ContentBox titleString="Assignment" divId="home" navHistory={navHistory} footerButtons={headerButtons}>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> Edit dialer output campaign and strategy </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => isDialerSelected()}>
                            Dialer Output
                        </Button>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <span> View and change characteristics in dialers </span>
                    </label>
                    <div className="content">
                        <Button className="button" onClick={() => routeToSelectedPage('/AssignKeepCharacteristics')}>
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

export default AssignmentHome;