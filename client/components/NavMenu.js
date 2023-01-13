import React from 'react';
import { commonService } from '../services/commonSvc.js';
import { Collapse, Navbar, NavbarToggler, Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { userService } from "../services/userSvc";
import { LinkContainer } from "react-router-bootstrap";
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import LogoutButton from '../commonsweb/js/Button/LogoutButton';
import LogoutConfirmationModal from '../commonsweb/js/NotificationModals/LogoutConfirmationModal.js'
import ChangePasswordButton from '../commonsweb/js/Button/ChangePasswordButton';
import ChangePasswordModal from '../commonsweb/js/SessionManagement/ChangePasswordModal';
import PasswordChangeConfirmation from '../commonsweb/js/NotificationModals/PasswordChangeConfirmation';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;

//This is the only component not built in KendoUI (aside from the buttons). This is built in Reactstrap.
//https://reactstrap.github.io/

//This includes the nav menu, Dialer select, Dialer Edit and Scripts. 
//Scripts may be moved somewhere else. Refer to Jim Texter for this. As of 7/22/2020 it still remains.

//Because the component is built in reactstrap and not Kendo, not all the components are confirming to css.
//the dialer drop down is an example for this.

//TODO: create global state using context API. and use hooks to pull data from the EDIT DIALERS component
// and make the drop down dynamic with the data in the EDIT DIALERS component. 
//Important to know that all data that may be shown in the main content box will also need to be saved to
// store until saved and committed to server. So before user can change dialers, user needs to prompted to
// save date or cancel changes.

class NavMenu extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
            logoutConf: false,
            responseErrors: [], //response errors from submitting item
            displayChangePW: false,
            pwChangeSuccessful: false,
            pwChangeError: '',
            actionCompleted: true, //used for loading indicator
        };
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    route = (url) => {
        this.props.history.push(url);
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    toggleModal = (name, display) => {
        console.log(name);
        console.log(display);
        this.setState({ [name]: display });
    }

    openLogoutModal = () => {
        var modal = document.getElementById('logoutModal');
        modal.style.display = "block";
    };

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    //used to determine if we're on login or logout screen, in order to hide some widgets
    isPastLoginScreen = () => {
        //do not display logout button if on login or log out page
        return this.props.location.pathname !== "/sign-in" && this.props.location.pathname !== "/logout";
    };

    logout = () => {
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        axios
            .post("/api/logout")
            .then(response => {
                this.props.updateSelectedDialer(null);
                this.route("/logout");
            })
            .catch(error => {
                this.route("/logout");
            });
    }

    changePassword = (changePasswordModel) => {
        this.setState({ actionCompleted: false });
        axios
            .post("/api/resetPassword", changePasswordModel)
            .then(response => {
                this.openPasswordChangeConfirmation(true, '');
            })
            .catch(error => {
                let err = commonService.loginResponseErrors(error);
                //expected to get multi lined response message from server, so need to format as such
                let pwChangeError = commonService.formatErrorMessage(err);
                this.openPasswordChangeConfirmation(false, pwChangeError);
            });
    }

    openPasswordChangeConfirmation = (pwChangeSuccessful, pwChangeError) => {
        this.setState({
            pwChangeSuccessful,
            pwChangeError,
            actionCompleted: true
        }, commonService.openModal('pwChangeConfirmModal'));
    }


    render() {
        return (
            <div className="topBanner">
                <div className="topBannerTitleBar">
                    <label><FormattedMessage id="topbanner.contactai" defaultMessage="Contact AI" /></label>
                    <label>{this.props.dialerId ? '--' : null}</label>
                    <label>{this.props.dialerId ? this.props.selectedDialer.name : null}</label>
                </div>
                <div className="topBannerLogo"></div>
                <div>
                    {localStorage.getItem('user') ?
                        <Navbar className="navbar-expand-sm navbar-toggleable-sm" >
                            <NavbarToggler onClick={this.toggle} />
                            {this.isPastLoginScreen() ?
                                <Collapse isOpen={this.state.isOpen} navbar>
                                    <Nav navbar>
                                        <UncontrolledDropdown nav inNavbar>
                                            <div>
                                                <DropDownList
                                                    defaultItem={{ name: '--select dialer--' }}
                                                    data={this.props.dialers}
                                                    textField="name"
                                                    value={this.props.dialerId ? this.props.selectedDialer: { name: '--select dialer--' }}
                                                    onChange={this.props.handleChange}
                                                    style={{ width: "150px" }} />
                                            </div>
                                        </UncontrolledDropdown>
                                        <UncontrolledDropdown nav inNavbar>
                                            <DropdownToggle nav caret>
                                                <FormattedMessage id="topbanner.managedialers" defaultMessage="Manage Dialers" />
                                            </DropdownToggle>
                                            <DropdownMenu left>
                                                <LinkContainer to="/dialersmanage">
                                                    <DropdownItem>
                                                        <FormattedMessage id="topbanner.managedialers" defaultMessage="Manage Dialers" />
                                                    </DropdownItem>
                                                </LinkContainer>
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                        <UncontrolledDropdown nav inNavbar>
                                            <DropdownToggle nav caret>
                                                <FormattedMessage id="topbanner.scripts" defaultMessage="Scripts" />
                                            </DropdownToggle>
                                            <DropdownMenu left>
                                                <LinkContainer to="/scripts">
                                                    <DropdownItem>
                                                        <FormattedMessage id="topbanner.schedule" defaultMessage="Schedule" />
                                                    </DropdownItem>
                                                </LinkContainer>
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                    </Nav>
                                </Collapse>
                                : null}

                            {this.isPastLoginScreen() ?
                                <LinkContainer to="/home">
                                    <Button primary={false} style={{ display: 'inline-block', float: 'right' }}>
                                        <FormattedMessage id="topbanner.home" defaultMessage="Home" />
                                    </Button>
                                </LinkContainer>
                                : null}

                            {this.isPastLoginScreen() ?
                                <LinkContainer to="/helphome">
                                    <Button primary={false} className="rightAlign" >
                                        <FormattedMessage id="topbanner.help" defaultMessage="Help" />
                                    </Button>
                                </LinkContainer>
                                : null}

                            {this.isPastLoginScreen() ?
                                <ChangePasswordButton
                                    displayButton={this.props.allowPWChange}
                                    handleEvent={() => this.toggleModal("displayChangePW", !this.state.displayChangePW)} />
                                : null}
                            {this.isPastLoginScreen() ? <div style={{ display: 'inline-block' }}><LogoutButton logoutEvent={this.openLogoutModal} /> </div> : null}

                            <LogoutConfirmationModal logout={this.logout} />
                            <ChangePasswordModal
                                displayChangePW={this.state.displayChangePW}
                                toggleModal={() => this.toggleModal("displayChangePW", !this.state.displayChangePW)}
                                changePWEvent={this.changePassword}
                                userName={this.props.userName}
                            />
                            <PasswordChangeConfirmation
                                successful={this.state.pwChangeSuccessful}
                                errorMessage={this.state.pwChangeError}
                            />
                        </Navbar>
                        : <Navbar className="navbar-expand-sm navbar-toggleable-sm" ></Navbar>
                    }

                </div>
            </div>
        );
    }
}

export default withRouter(NavMenu);

