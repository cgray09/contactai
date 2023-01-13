import React, { Component } from 'react';
import IdleWarningModal from '../NotificationModals/IdleWarningModal';
import TimeoutModal from '../NotificationModals/TimeoutModal';
import LogoutConfirmationModal from '../NotificationModals/LogoutConfirmationModal';
import LostServerConnectionModal from '../NotificationModals/LostServerConnectionModal';
import IdleTimer from 'react-idle-timer'
import { withRouter } from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;

/* This component is used to manage the session time of a user. Once a user goes idle, an idle user warning modal will be displayed 
   to the user.
 If the user fails to respond within a minute, they will be logged out and a session expired modal will be displayed */

/* Requirements - must pass in following as props
    - logoutRouteUrl :   the URL for routing to the logout page. Ex) "/logout"
    - loginRouteUrl:     the URL for routing to the login page. Ex) "/login"
    - logoutRequestUrl:  the URL for hitting the server to do a logout. This will be called idle warning modal if the user opts to end their session when prompted
    - sessionExpiredUrl: the URL for hitting the server when the user does not respond to the idle warning prompt and proceeds to timeout
    - pingServerUrl:     the URL requried to make an axios call to backend to ping server
    - timeoutMinutes:    The minutes the timer will go before timing out

    Optional Props
    - pingInterval: in miliseconds. This is the interval the backend will be pinged. If not specified, default of 10000 will be used
    */

class SessionTimer extends Component {
    constructor(props) {
        super(props);

        this.idleTimer = null
    }

    componentDidMount() {
        //if a ping interval is provided use that, otherwise default to 10000
        let interval = this.props.pingInterval ? this.props.pingInterval : 10000;
        this.countdown = setInterval(this.pingServer, interval);
    }

    componentWillUnmount() {
        clearInterval(this.countdown);
    }

    logout = (isTimedOut) => {
        let requestUrl = isTimedOut ? this.props.sessionExpiredUrl : this.props.logoutRequestUrl;
        axios
            .post(requestUrl)
            .then(response => {
                if(!isTimedOut){
                    //Dont route on session expired just yet. User will get modal notification
                    //which will route them when pressing "ok"
                    this.routeToLogoutPage();
                }
            })
            .catch((error) => {
                this.routeToLogoutPage();
            });
    }


    routeToLogoutPage = () => {
        const { history } = this.props;
        this.props.updateSelectedDialer(null);                    
        history.push(this.props.logoutRouteUrl);
    }

    routeToLoginPage = () => {
        const { history } = this.props;
        this.props.updateSelectedDialer(null);
        history.push(this.props.loginRouteUrl);
    }

    pingServer = () => {
        if (!this.idleTimer.isIdle()) {
            axios.get(this.props.pingServerUrl)
                .catch((error) => {
                    this.openModal('lostServerConnection');
                });
        }
    }

    onActive = (e) => {
        console.log('user is active', e)
        console.log('time remaining', this.idleTimer.getRemainingTime())
    }

    onIdle = (e) => {
        console.log('user is idle', e)
        this.openModal('idleWarningModal');
    }

    onTimeout = (e) => {
        console.log('session timed out');
        this.props.updateSelectedDialer(null);
        this.closeModal("idleWarningModal");
        this.openModal("timeoutModal");
        this.logout(true);
    }

    openModal = (elementId) => {
        var modal = document.getElementById(elementId);
        modal.style.display = "block";
    }

    closeModal = (elementId) => {
        var modal = document.getElementById(elementId);
        modal.style.display = "none";
    }

    retrieveFromLocalStorage = (defaultTimeout) => {
        let timeoutMinutes = localStorage.getItem("timeoutMinutes");
        if (!timeoutMinutes) {
            return defaultTimeout; //if no timeout set in local storage, return default value
        }
        return timeoutMinutes;
    }

    getTimerDuration = (forIdleTime) => {
        let timeInMinutes = this.props.timeoutMinutes ? this.props.timeoutMinutes : this.retrieveFromLocalStorage(30);
        if (forIdleTime) {
            timeInMinutes = timeInMinutes - 1; //if setting timer for idle time, make 1 minute less than time out time
        }

        return this.convertMinutesToMiliseconds(timeInMinutes);
    }

    convertMinutesToMiliseconds = (minutes) => {
        return minutes * 60000;
    }

    render() {
        return (
            <div>
                <div>
                    {/* Timer to check if user has been idle and ability to reset timer if action is provided in alloted time*/}
                    <IdleTimer
                        ref={ref => { this.idleTimer = ref }}
                        element={document}
                        onActive={this.onActive}
                        onIdle={this.onIdle}
                        debounce={250}
                        timeout={this.getTimerDuration(true)}
                    />
                    {/* Timer to check if user has officially timed out */}
                    <IdleTimer
                        ref={ref => { this.timeoutTimer = ref }}
                        element={document}
                        onIdle={this.onTimeout}
                        debounce={250}
                        timeout={this.getTimerDuration(false)}
                    />
                    {this.props.children}
                </div>
                <LogoutConfirmationModal routeToLogoutPage={this.routeToLogoutPage} />
                <IdleWarningModal logoutEvent={this.logout} />
                <TimeoutModal routeToLogoutPage={this.routeToLogoutPage}/>
                <LostServerConnectionModal routeToLoginPage={this.routeToLoginPage}/>
            </div>
        );
    }
}

export default withRouter(SessionTimer);
