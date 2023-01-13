import React from 'react';
import { ContentBox, Footer } from '.';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import { Input } from "@progress/kendo-react-inputs";
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import { commonService } from '../services/commonSvc.js';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import axios from "axios";
axios.defaults.withCredentials = true;

class ScoreModelDefDisplayModal extends React.PureComponent {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            actionCompleted: true,
            responseErrors: [],
            version: 0,
            scoreIds: [],
            timeperiods: [],
            defTypes: ['RIGHT', 'WRONG', 'PTP'],
            filters : { version: 0,
                        scoreId: 0,
                        timeperiod: 0,
                        type: 'RIGHT'
            },
            details: ''
        }
    }

    defaultNoDefsFound = 
        '<!doctype html public "-//w3c//dtd html 4.0 transitional//en"> <html><head><title>CallTech Scorecard Data</title></head>' +
        '<body text="#000000" bgcolor="#FFFFFF" link="#0000EE" vlink="#551A8B" alink="#FF0000">' +
        '<center><h3><P><BR></P>  No Definitions found<P><BR></P></h3></center>' +
        '<hr WIDTH="100%"><i>Noble Systems Corporation</i></body></html>' ;
    
    componentWillReceiveProps({ version, scoreIds, timeperiods }) {
        this.setState({ scoreIds, timeperiods, version });
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

    fetchData = () => {
        this.setState({actionCompleted: false});
        
        axios.post("/api/scorecards/modelDef", this.state.filters)
            .then(response => {
                if (this._isMounted) {
                    let modelDef = response.data;
                    this.setState({
                        details: !modelDef.modelDefHtml ? this.defaultNoDefsFound : modelDef.modelDefHtml,
                        responseErrors: [],
                        actionCompleted: true
                    });
                }
            })
            .catch(error => {
                if ((error && error.response) && error.response.status === 401) {
                    console.log("User is unauthorized. Routing back to login");
                    this.route("/");
                }
                this.handleResponseErrors(error);
            });
    }

    resetForm = () => {
        this.setState({
            filters: {
                version: 0,
                scoreId: 0,
                timeperiod: 0,
                type: 'RIGHT'
            },
            details: '' 
        }); 
        this.props.toggleModal("displayModelDef");
    }

    handleChange = (e) => {
        let value = e.target.value;
        let name = e.target.name;
        this.setState(prevState => ({
            filters: {
                ...prevState.filters,
                version: this.state.version,
                [name]: value
            }
        }), () => {this.fetchData()})
    }
    
    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={() => this.resetForm()}>
                {this.props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
        </div>
    }

    render() {
        
        return (
            this.props.displayModelDef && 
            <div id="scoreModelDefDisplayModal" className="modalStateManaged">
                <div className="noble-modal-content">
                    <div className="MainContent Outer" style={{ minHeight: '503px' }}>
                        <div className="MainContent Inner">
                            <ContentBox
                                titleId="scorecards.defDetails"
                                titleString="Definition Details"
                                divId=""
                                footerButtons={this.getFooterButtons()}
                            >
                                <ErrorGroup errorMessages={this.state.responseErrors} />
                                
                                <div className="contentBoxRow">
                                    <div className="content"> 
                                        <FormattedMessage id="scorecards.modelDef.version" defaultMessage="Version" />
                                    </div>
                                    <div className="content"> 
                                        <Input name="version" value={this.state.version} disbaled={true}/>
                                    </div>

                                    <div className="content"> 
                                        <FormattedMessage id="scorecards.modelDef.scoreId" defaultMessage="ScoreId" />
                                    </div>
                                    <div className="content"> 
                                        <ComboBox 
                                            name="scoreId" 
                                            data={this.state.scoreIds} 
                                            value={this.state.filters.scoreId} 
                                            allowCustom={false}
                                            onChange={this.handleChange}/>
                                    </div>

                                    <div className="content"> 
                                        <FormattedMessage id="scorecards.modelDef.timeperiod" defaultMessage="Timeperiod" />
                                    </div>
                                    <div className="content"> 
                                        <ComboBox 
                                            name="timeperiod" 
                                            data={this.state.timeperiods} 
                                            value={this.state.filters.timeperiod} 
                                            allowCustom={false}
                                            onChange={this.handleChange}/>
                                    </div>

                                    <div className="content"> 
                                        <FormattedMessage id="scorecards.modelDef.type" defaultMessage="Type" />
                                    </div>
                                    <div className="content"> 
                                        <ComboBox 
                                            name="type" 
                                            data={this.state.defTypes} 
                                            value={this.state.filters.type} 
                                            allowCustom={false}
                                            onChange={this.handleChange}/>
                                    </div>
                                </div>
                                <div className="modal-body" dangerouslySetInnerHTML={{__html: this.state.details}} />
                            
                            </ContentBox>
                        </div>
                    </div>
                </div>
            </div>            
        );
    }
}

export default ScoreModelDefDisplayModal;