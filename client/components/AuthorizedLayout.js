import SessionTimer from '../commonsweb/js/SessionManagement/SessionTimer'
import Logout from '../commonsweb/js/SessionManagement/Logout'
import RecordLockNotification from '../commonsweb/js/NotificationModals/RecordLockNotification';
import version from '../version.json';
import NavMenu from "../components/NavMenu";
import Footer from '../commonsweb/js/Footer/Footer';
import React from 'react';
import {
    SignIn,
    Home,
    DialersHome,
    DialersManage,
    DialersConfigure,
    DialersConfigMisc,
    DialersConfigRec,
    CallResultsHome,
    SummarizationHome,
    DownloadHome,
    AssignmentHome,
    ScorecardsHome,
    SchedulesHome,
    HelpHome,
    Scripts,
    About,
    Contents,
    AssignKeepCharacteristics,
    ScoreViewModelDef,
    SumKeepCharacteristics,
    ScoreIncludeSamplePoint,
    ScoreAssignScorecards,
    ScoreAnalysisCharacteristics,
    ScoreDefineTimePeriods,
    DownSegmentPopulation,
    FileFormat,
    ComputeCharacteristics,
    CallResultsKeepCharacteristics,
    ExcludeRecords,
    CallResultsStandardizeData
} from './';
import { Route, Switch, Redirect } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { injectIntl } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;


//Authorized Layout
//to add components, you need to add the path to this file, the guestlayout.js file and index.js
//app will not run if that is not done.
//purpose for Authorized layout and Guest layout was to hide navigation to other components when not logged in

class AuthorizedLayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timeoutMinutes: null,
            userName: '',
            userRole: '',
            dbType: '',
            helpUrl:'',
            dialerId: null,
            allowPWChange: false,
            viewOnly: false,
            dialers: [],
            selectedDialer: {}
        }
    }

    componentDidMount() {
        this.getHelpUrl();
        this.allowPWChange();
        this.isViewOnly();
        this.fetchDialers();
        if (!this.state.userRole) {
            let userName = localStorage.getItem("userName");
            let userRole = localStorage.getItem("userRole");
            let timeoutMinutes = localStorage.getItem("timeoutMinutes");
            let dbType = localStorage.getItem("dbType");
            let dialerId = localStorage.getItem("dialerId");
            if (dialerId != null) {
                dialerId = parseInt(dialerId);
            }
            this.setState({ userName, userRole, timeoutMinutes, dbType, dialerId })
        }
    }

    getHelpUrl = () => {
        axios.get("/api/helpUrl")
          .then(response => {
            this.setState({ helpUrl: response.data.helpUrl });
          })
          .catch(error => {
            console.log("Could not retrieve help URL");
          });
    };

    allowPWChange = () => {
        axios.get("/api/allowPasswordChange")
            .then(response => {
                this.setState({ allowPWChange: response.data.allowPWChange });
            })
            .catch(error => {
                console.log("Could not retrieve password change configuration info");
            });
    }

    fetchDialers = () => {
        axios.get("/api/dialers")
            .then(response => {
                   this.setState( prevState => ({
                        dialers: response.data,
                        selectedDialer: {}
                    }),
                        () => this.updateSelectedDialer(null)
                    );
            })
            .catch(error => {
                console.log("Could not retrieve dialer info");
            });
    }

    updateSelectedDialer = (dialerId) => {
        this.setState({ dialerId });
        localStorage.setItem("dialerId", dialerId);
    }

    handleDialerChange = (e) => {
        const value = e.target.value;
        this.setState(prevState => ({
            selectedDialer: value
        }),
            () => this.updateSelectedDialer(value.dialerId)
        );
    }

    getLocalizedString = (id, values) => {
        const { intl } = this.props;
        if (values) {
            return intl.formatMessage({ id: id }, values);
        }
        return intl.formatMessage({ id: id });
    }

    getVersion = () => {
        return version.major_version + "." + version.minor_version + "." + version.update_version;
    }

    isViewOnly = () => {
        let userRole = localStorage.getItem("userRole");
        if(userRole === "Full Access"){
          this.setState({viewOnly: false});
        }
        if(userRole === "Read Only"){
            this.setState({viewOnly: true});
        }
    }

    loginFooter = <Footer width={'650px'} version={this.getVersion()}/>
    footer = <Footer width={'1200px'} version={this.getVersion()}/>

    render() {
        return (
            <div>
                <NavMenu 
                    dialers={this.state.dialers} 
                    fetchDialers={this.fetchDialers} 
                    updateSelectedDialer={this.updateSelectedDialer} 
                    allowPWChange={this.state.allowPWChange} 
                    userName={this.state.userName} 
                    dialerId={this.state.dialerId}
                    selectedDialer={this.state.selectedDialer}
                    handleChange={this.handleDialerChange}
                />
                <Switch>
                    <Redirect exact from='/' to='/sign-in' />
                    <Route path="/sign-in" component={(props) => <SignIn {...props} footer={this.loginFooter} version={this.getVersion()} />} />
                    <Route exact path='/logout' component={(props) => <Logout {...props} version={this.getVersion()} loginPageRoute="/sign-in" />} />
                    <SessionTimer
                        pingInterval={10000}
                        logoutRouteUrl="/logout"
                        loginRouteUrl="/sign-in"
                        logoutRequestUrl="/api/logout"
                        sessionExpiredUrl="/api/sessionExpired"
                        pingServerUrl="/api/ping"
                        timeoutMinutes={this.state.timeoutMinutes}
                        updateSelectedDialer={this.updateSelectedDialer}
                    >
                        <PrivateRoute path="/home" component={(props) => <Home {...props} footer={this.footer} />} />
                        <PrivateRoute path="/dialershome" component={(props) => <DialersHome {...props} footer={this.footer} viewOnly={this.state.viewOnly} />} />
                        <PrivateRoute path="/dialersmanage" component={(props) => <DialersManage {...props} fetchDialers={this.fetchDialers} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/dialersconfigure" component={(props) => <DialersConfigure {...props} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/dialersconfigmisc" component={(props) => <DialersConfigMisc {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/dialersconfigrec" component={(props) => <DialersConfigRec {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/callresultshome" component={(props) => <CallResultsHome {...props} dialerId={this.state.dialerId} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/summarizationhome" component={(props) => <SummarizationHome {...props} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/downloadhome" component={(props) => <DownloadHome {...props} dialerId={this.state.dialerId} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/assignmenthome" component={(props) => <AssignmentHome {...props} dialerId={this.state.dialerId} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/scorecardshome" component={(props) => <ScorecardsHome {...props} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/scheduleshome" component={(props) => <SchedulesHome {...props} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/helphome" component={(props) => <HelpHome {...props} footer={this.footer} viewOnly={this.state.viewOnly} helpUrl={this.state.helpUrl} />} />
                        <PrivateRoute path="/scripts" component={(props) => <Scripts {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/about" component={(props) => <About {...props} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/contents" component={(props) => <Contents {...props} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/assignkeepcharacteristics" component={(props) => <AssignKeepCharacteristics {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/assigndialeroutput" component={(props) => <FileFormat {...props} dialerId={this.state.dialerId} getLocalizedString={this.getLocalizedString} footer={this.footer} page="assignment" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/scoreviewmodeldef" component={(props) => <ScoreViewModelDef {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/sumcomputecharacteristics" component={(props) => <ComputeCharacteristics {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} page="summarization" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/sumkeepcharacteristics" component={(props) => <SumKeepCharacteristics {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/scoreincludesamplepoint" component={(props) => <ScoreIncludeSamplePoint {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/scoreexcludesamplepoint" component={(props) => <ExcludeRecords {...props} footer={this.footer} page="scorecards"  viewOnly={this.state.viewOnly}/>}/>
                        <PrivateRoute path="/scoreassignscorecards" component={(props) => <ScoreAssignScorecards {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/scoreanalysischaracteristics" component={(props) => <ScoreAnalysisCharacteristics {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/scoredefinetimeperiods" component={(props) => <ScoreDefineTimePeriods {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/downloadfileformat" component={(props) => <FileFormat {...props} dialerId={this.state.dialerId} getLocalizedString={this.getLocalizedString} footer={this.footer} page="dlfileformat" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/downsuppfileformat" component={(props) => <FileFormat {...props} dialerId={this.state.dialerId} getLocalizedString={this.getLocalizedString} footer={this.footer} page="dlsuppfileformat" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/downexcludedata" component={(props) => <ExcludeRecords {...props} footer={this.footer} page="download" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/downsegmentpopulation" component={(props) => <DownSegmentPopulation {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/downcomputecharacteristics" component={(props) => <ComputeCharacteristics {...props} getLocalizedString={this.getLocalizedString} footer={this.footer} page="download" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/callresultsfileformat" component={(props) => <FileFormat {...props} dialerId={this.state.dialerId} getLocalizedString={this.getLocalizedString} footer={this.footer} page="callresult" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/callresultskeepcharacteristics" component={(props) => <CallResultsKeepCharacteristics {...props} footer={this.footer} getLocalizedString={this.getLocalizedString} viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/callresultsexcluderecords" component={(props) => <ExcludeRecords {...props} footer={this.footer} page="callresult" viewOnly={this.state.viewOnly}/>} />
                        <PrivateRoute path="/callresultsstandardizedata" component={(props) => <CallResultsStandardizeData {...props} footer={this.footer} page="callresult" viewOnly={this.state.viewOnly}/>} />
                        <RecordLockNotification />
                    </SessionTimer>
                </Switch>
            </div>
        );
    }
}

export default injectIntl(AuthorizedLayout)
