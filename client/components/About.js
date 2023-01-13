import React from "react";
import { ContentBox, Footer } from './';
import { Button } from '@progress/kendo-react-buttons';
import ContactsInfo from '../images/ContactsInfo.png';

//Information regarding application. currently has img with contact information

const About = (props) => {

    const backButton = () => {
        props.history.goBack();
    }

    const navHistory = [{ url: "/HelpHome", label: "Home>Help" }]

    const footerButtons =
        <div className="actions">
            <Button className="button actions" onClick={() => backButton()}>
                Go Back
            </Button>
        </div>

    return (
        <div>
            <ContentBox titleString="Contact" divId="home" navHistory={navHistory} footerButtons={footerButtons}>
                <div id="mydiv">
                    <img src={ContactsInfo} width="950" height="950" />
                </div>
            </ContentBox>
            {props.footer}
        </div>
    );
};
export default About;
