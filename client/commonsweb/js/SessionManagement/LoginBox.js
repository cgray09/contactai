import React from 'react';
import Footer from '../Footer/Footer';
import LoginButton from '../Button/LoginButton';
// import ChangePasswordButton from '../Button/ChangePasswordButton';
// import ChangePasswordModal from './ChangePasswordModal'; 
// import { FormattedMessage } from 'react-intl';

const LoginBox = (props) => {

    const openChangePWModal = () => {
        var modal = document.getElementById('changePWModal');
        modal.style.display = "block";
    }

    return (
        <div>
            <div id="loginBox">
                <div className="contentBox" style={{ width: "650px", minWidth: "650px", maxWidth: "650px" }}>
                    <div className="HeaderLogo">
                        <label className="versionLabel">
                            {"v " + props.version}
                        </label>
                        <div id="contentBoxBreadcrumb"></div>
                        {/* <label className="title">
                            <FormattedMessage id="login.title" />
                        </label> */}
                        <div className="actions">
                            <span></span>
                        </div>
                        <div className="messagetoolbar"></div>
                        <div className="clearboth"></div>
                    </div>
                    <div className="contentBoxContent zebrastripe">
                        <span>
                            {props.children}
                        </span>
                    </div>
                    <div className="contentBoxFooter" style={{ height: "inherit" }}>
                        <div className="rightAlign">
                            {/* <div style={{ display: "inline-block", marginRight: "10px" }}>
                                <ChangePasswordButton
                                    displayButton={props.displayButton}
                                    handleEvent={openChangePWModal}
                                />
                            </div> */}
                            <div style={{ display: "inline-block" }}>
                                <LoginButton
                                    loginEvent={props.loginEvent}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {props.footer}
            </div >
            {/* <ChangePasswordModal changePWEvent={props.changePWEvent}/> */}
        </div>
    );
};
export default LoginBox;
