import React from 'react';
import InlineError from '../commonsweb/js/ErrorHandling/InlineError';
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import { Input } from '@progress/kendo-react-inputs';
import LoginBox from '../commonsweb/js/SessionManagement/LoginBox';
import { commonService } from '../services/commonSvc'
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import axios from "axios";
import LoginWarning from '../commonsweb/js/NotificationModals/LoginWarning';
axios.defaults.withCredentials = true;

// sign in page. this will be modified when the back end is implemented.
// as of 7/23. This file is used with the LoginBox container that Shawn sent.
//TODO: change where the credentials get verified

export default function SignIn(props) {

    const [form, setForm] = React.useState({
        username: '',
        password: '',
        errorMessage: '',
        modalMessage: '',
        displayWarning: false,
        actionCompleted: true,
        submitted: false,
        allowLogin: true
    });

    const updateForm = e => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const login = () => {
        setForm({ ...form, submitted: true });
        if (form.username && form.password) {
            setForm({ ...form, actionCompleted: false })
            localStorage.clear(); //clear any stale data
            let credentials = { username: form.username, password: form.password };
            axios
                .post("/api/login", credentials)
                .then(response => {
                    setForm({ ...form, actionCompleted: true });
                    let user = setupUser(response.data);
                    handleSuccessfulResponse(user);
                    //checks to see if we have any warnings, such as an almost expiring license.
                    if (response.data.message) {
                        openWarningModal(commonService.formatErrorMessage(response.data.message), true);
                    }
                    else {
                        routeToHomePage();
                    }
                })
                .catch(error => {
                    //if error.response.data comes back as a string, then its just an error message and not a user object
                    let user = typeof error.response.data === "string" ? null : setupUser(error.response.data);
                    handleError(error, user);
                });
        }
    }

    const setupUser = (user) => {
        user.authdata = window.btoa(form.username + ':' + form.password);
        return user;
    }

    const handleSuccessfulResponse = (response) => {
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("userRole", response.user.right);
        localStorage.setItem("timeoutMinutes", parseInt(response.timeoutMinutes));
        localStorage.setItem("dbType", response.dbType);
    }

    const handleError = (error, user) => {
        let status = (error && error.response) ? error.response.status : -1; //set status if a status exists
        let errors = commonService.getResponseErrors(error);
        let message = errors[0];
        if (status === 412) {
            handleSuccessfulResponse(user);
            openWarningModal(commonService.formatErrorMessage(message), true);
        }
        else if (status === 403) {
            openWarningModal(commonService.formatErrorMessage(message), false);
        }
        else {
            setForm({
                ...form,
                errorMessage: message,
                actionCompleted: true
            });
        }
    }

    const routeToHomePage = () => {
        //close any notification modals before navigating to home page
        if (form.displayWarning) {
            toggleModal();
        }
        props.history.push('/home');
        window.location.reload(true); //this is the mechanism that allows the app to re render after login
    }

    const handleWarning = () => {
        if (form.allowLogin) {
            routeToHomePage();
        }
        else {
            toggleModal();
            logout();
        }
    }

    const logout = () => {
        axios
            .post("/logout")
            .catch(error => {
                console.log(error);
            });
    }

    const openWarningModal = (modalMessage, allowLogin) => {
        setForm({
            ...form,
            modalMessage,
            allowLogin,
            actionCompleted: true,
            displayWarning: true
        });
    }

    const toggleModal = () => {
        setForm({ ...form, displayWarning: !form.displayWarning });
    }

    const handleEnterKey = (e) => {
        //Want to login if use presses the "Enter key" while a warning modal isn't currently displayed
        if (e.charCode === 13 && !form.modalMessage) {
            login();
        }
    }

    return (
        <div>
            <LoginBox version={props.version} displayButton={false} loginEvent={login} footer={props.footer}>
                <form onSubmit={login} className="k-form">
                    <InlineError errorMessage={form.submitted && (!form.username || !form.password) ? "Please enter required fields" : null} />
                    <InlineError errorMessage={form.errorMessage} />
                    <div className="contentBoxRow"></div>
                    <div className="contentBoxRow">
                        <label className="label">Username:</label>
                        <div className="content">
                            <Input name="username" value={form.username} onChange={updateForm} onKeyPress={handleEnterKey} style={{ width: '200px' }} autoComplete="off"/>
                            <InlineError
                                errorMessage={
                                    // form.submitted && !form.username ? <FormattedMessage id="error.userNameRequired" defaultMessage="Username is required" /> : null
                                    form.submitted && !form.username ? "Username is required" : null
                                }
                            />
                        </div>
                    </div>
                    {/* <label className="k-form-field">
                        <span>Username:</span>
                        <input required type="username" name="username" id="username" value={form.username} onChange={updateForm} autoComplete="off" className="k-textbox" />
                    </label> */}
                    <div className="contentBoxRow">
                        <label className="label">Password: </label>
                        <div className="content">
                            <Input type="password" name="password" value={form.password} onChange={updateForm} onKeyPress={handleEnterKey} style={{ width: '200px' }} autoComplete="off" />
                            <InlineError
                                errorMessage={
                                    // form.submitted && !form.password ? <FormattedMessage id="error.passwordRequired" defaultMessage="Password is required" /> : null
                                    form.submitted && !form.password ? "Password is required" : null
                                }
                            />
                        </div>
                    </div>
                    {/* <label className="k-form-field">
                        <span>Password:</span>
                        <input type="password" name="password" id="password" value={form.password} onChange={updateForm} className="k-textbox" autoComplete="off"/>
                    </label> */}
                </form>
                <LoginWarning
                    handleEvent={handleWarning}
                    displayWarning={form.displayWarning}
                >
                    <div style={{ padding: "10px" }}>{form.modalMessage}</div>
                </LoginWarning>
                {/* {form.displayWarning &&
                    <Dialog title={"Warning"} onClose={toggleModal}>
                        <p style={{ margin: "25px", textAlign: "center" }}>{form.modalMessage}</p>
                        <DialogActionsBar>
                            <button className="k-button" onClick={handleWarning}>Ok</button>
                        </DialogActionsBar>
                    </Dialog>} */}
                <GridLoadingIndicator actionCompleted={form.actionCompleted} />
            </LoginBox>            
        </div>
    )
}