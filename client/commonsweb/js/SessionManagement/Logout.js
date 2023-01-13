import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import Footer from '../Footer/Footer';
import { FormattedMessage } from 'react-intl';


/* Logout component is is what renders the logout splash screen once user logs out of application
    Requires the following as props
      - versionNumber
      - title
*/
const Logout = (props) => {

    const routeToLogin = () => {
        props.history.push(props.loginPageRoute);
    }

    return (
        <div>
            <div id="loginBox">
                <div className="contentBox" style={{ width: "650px", minWidth: "650px", maxWidth: "650px" }}>
                    <div className="HeaderLogo">
                        <label className="versionLabel">{props.versionNumber}</label>
                        <div id="contentBoxBreadcrumb"></div>
                        <label className="title">{props.title}</label>
                        <div className="actions">
                            <span></span>
                        </div>
                        <div className="messagetoolbar"></div>
                        <div className="clearboth"></div>
                    </div>
                    <div id="logout" className="contentBoxContent zebrastripe">
                        <span>
                            <div className="lable">
                                <FormattedMessage id="session.successfulLogout" defaultMessage="You have been successfully logged out" />
                            </div>
                            <div align="center">
                                <Button onClick={routeToLogin}>
                                    <FormattedMessage id="session.goToLogin" defaultMessage="Go to Login" />
                                </Button>
                            </div>
                        </span>
                    </div>
                    <div className="contentBoxFooter" style={{ height: "inherit" }}></div>
                </div>
                <Footer width={'650px'} version={props.version}/>
            </div >
        </div>
    )
};

export default Logout;
