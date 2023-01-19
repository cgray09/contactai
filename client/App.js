import React, { Component } from "react";
import { Layout } from "./Layout";
import '@progress/kendo-theme-bootstrap/dist/all.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Global.css';
import './css/custom.css';
import './commonsweb/css/KendoOverrides.css';
import './commonsweb/css/RadioButton.css';
import './commonsweb/css/ContentBox.css';
import './commonsweb/css/TopBanner.css';
import './commonsweb/css/common.css';
import './commonsweb/css/login.css';
import './css/contactai.css';
import './css/query-builder.default.min.css';
import './css/queryBuilder.css';
// Redux
import { Provider } from 'react-redux';
import store from './store';

// Renders application. depending on whether user is logged in, menu will be rendered. see layout.js
// this is wrapped by index.js

// Only commons files imported into this application are what is used. Did not bring over all files. If you add components that require a file from the commons folder from previous project, 
// you will need to add that file. If you need access to commons file, reach out to Jim Texter and/or Shawn Jaffee.

const App = () => {
    return (
        <Provider store={store}>
            <React.Fragment>
                <div id="contactai">
                    <div className="MainContent Outer" style={{ minHeight: '503px' }}>
                        <div className="MainContent Inner">
                            <Layout />                            
                        </div>
                    </div>
                </div>
            </React.Fragment>
        </Provider>
    )
};

export default App;

