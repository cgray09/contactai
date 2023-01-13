import React from 'react';
import authHeader from './authheader';
import axios from "axios";
axios.defaults.withCredentials = true;

// SECURITY RISK? credentials currently saved to local storage.
// if it is a risk and that needs to be fixed, the Layout.js file uses information that is stored in local storage in order to use the correct render.
// that will need to be fixed. Or a new method for the app the have the correct render.

//example 
/*login = () => {
        axios
            .post("/login", this.state.loginFormModel)
            .then(response => {
                //Put whatever code you want to run after a successful login
                //Here is where I route the user to the home page
            })
            .catch(error => {
                //Put whatever code you want to run if an error occured during login
            });
    }
*/

export const userService = {
    login,
    logout,
    getAll
};

//function login(username, password) {
// function login(props, username, password) {
//     const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//     };

//     return fetch(`/users/authenticate`, requestOptions)
//         .then(handleResponse)
//         .then(user => {
//             // login successful if there's a user in the response
//             if (user) {
//                 // store user details and basic auth credentials in local storage
//                 // to keep user logged in between page refreshes
//                 user.authdata = window.btoa(username + ':' + password);
//                 localStorage.setItem('user', JSON.stringify(user));
//                 props.history.push('/');
//                 window.location.reload(true); //this is the mechanism that allows the app to re render after login
//             }

//             return user;
//         })
//         //catch login attempt errors 
//         .catch((error) => alert("Incorrect username or password"));
// }

function login(props, response, credentials) {
    let user = response.data;
    user.authdata = window.btoa(credentials.username + ':' + credentials.password);
    localStorage.setItem('user', JSON.stringify(user));
    props.history.push('/');
    window.location.reload(true); //this is the mechanism that allows the app to re render after login
    // this.setState({ formSubmitted: true });
    // if (credentials.username && credentials.password) {
    //     // this.setState({ actionCompleted: false })
    //     localStorage.clear(); //clear any stale data
    //     axios
    //         .post("/login", credentials)
    //         .then(response => {
    //             // this.setState({ actionCompleted: true });
    //             // this.handleSuccessfulResponse(response.data.user.right, response.data.timeoutMinutes);
    //             //checks to see if we have any warnings, such as an almost expiring license.
    //             // if (response.data.message) {
    //             //     this.openWarningModal(this.formatErrorMessage(response.data.message), true);
    //             // }
    //             // else {
    //             //     this.routeToHomePage();
    //             // }
    //             console.log("Sucessful Login!");
    //             console.log(response);
    //             let user = response.data;
    //             user.authdata = window.btoa(credentials.username + ':' + credentials.password);
    //             localStorage.setItem('user', JSON.stringify(user));
    //             props.history.push('/');
    //             window.location.reload(true); //this is the mechanism that allows the app to re render after login
    //         })
    //         .catch(error => {
    //             // this.handleError(error);
    //             console.log("Error occured during Login");
    //             console.log(error);
    //         });
    //}
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    window.location.reload(true);
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`/users`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}