import React from 'react';
import { commonService } from '../services/commonSvc.js';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox, Footer } from '.';
import GridForm from '../commonsweb/js/Grid/GridForm';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
import ScoreDefDisplayModal from './ScoreDefDisplayModal';
import ScoreModelDefDisplayModal from './ScoreModelDefDisplayModal';
import moment from 'moment';
axios.defaults.withCredentials = true;

class ScoreViewModelDef extends React.PureComponent {
    
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            displayDetails: false,
            details: '',
            displayModelDef: false,
            scVersion: 0,
            scoreIds: [],
            timeperiods: []
        }        
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchData();

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    route = (url) => {
        this.props.history.push(url);
    }
    
    fetchData = () => {
        this.setState({ actionCompleted: false });
        axios.get("/api/scorecards")
            .then(response => {
                if (this._isMounted) {
                    this.setState({
                        data: response.data,
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

    activateScoreCard = (selectedItem) => {
        this.setState({ actionCompleted: false });
        axios.post("/api/scorecards/" + selectedItem.id + "/activate")
            .then(response => {
                if (this._isMounted) {
                    this.fetchData();
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

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    prepAndOpenDisplayModal = (details) => {
        this.setState({ details, displayDetails: true });
    }

    prepAndOpenSCModelDefsModal = (selectedItem) => {
        axios.get("/api/scorecards/" + selectedItem.id + "/defs")
            .then(response => {
                if (this._isMounted) {
                    let modelDefs = response.data;
                    let scoreIds = [];
                    let timeperiods = [];
                        
                    if(modelDefs && modelDefs.length  > 0)  {
                        modelDefs.forEach(element => {
                            //store values as Strings, as a value of 0 does not show up in kendo dropdown/combobox. This is a workaround 
                            //for bug in kendo-react.
                            if(scoreIds.indexOf(String(element.scoreId)) === -1) scoreIds.push(String(element.scoreId));
                            if(timeperiods.indexOf(String(element.timeperiod)) === -1) timeperiods.push(String(element.timeperiod));
                        });

                    }
                    this.setState({ scoreIds, timeperiods, scVersion: selectedItem.version, displayModelDef: true });
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

    goBack = () => {
        this.props.history.goBack();
    }

    resetForm = () => {
        this.setState( {
            scoreIds: [],
            timeperiods: [],
            scVersion: 0,
            displayModelDef: !this.state.displayModelDef
        });
    }

    toggleModal = (modalName) => {
        if(modalName === 'displayModelDef') {
            this.resetForm();
        } else {
            this.setState({ [modalName]: ![modalName] });
        }
    }
    
    getAdditionalButtons = (selectedItem) => {
        let buttons = [];
        buttons.push(<Button key={1} onClick={() => this.activateScoreCard(selectedItem)}>Activate</Button>);
        return buttons;
    }

    navHistory = [{ url: "/Home", label: "Home" }, { url: "/ScorecardsHome", label: "Scorecards" }]

    footerButtons =
        <div className="actions">
            <Button className="button actions" onClick={this.goBack}>
                <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>

    ActiveVersionCell = props => {
        const { dataItem } = props;
        const field = props.field || '';
        const dataValue = dataItem[field] ? 'Yes' : 'No';
        return <td>{dataValue}</td>;
    };

    ViewDetailsCell = props => {
        const { dataItem } = props;
        const field = props.field || '';
        if (field === 'details') {
            return <td><Button onClick={() => this.prepAndOpenSCModelDefsModal(dataItem)}>View Details</Button></td> 
        } else {
            const dataValue = dataItem[field];
            return <td><Button onClick={() => this.prepAndOpenDisplayModal(dataValue)}>View Details</Button></td>
        }
    };

    DateCell = props => {
        const { dataItem } = props;
        const field = props.field || '';
        const fieldValue = dataItem[field];
        let dataValue = '';
        if(fieldValue) {
            dataValue = moment(fieldValue).format('MM/DD/YYYY, hh:mm:ss A');
        }
        return <td>{dataValue}</td>
    }

    render() {
        let columns = [
            { title: this.props.getLocalizedString("scorecards.active"), field: 'activeVersion', filter: 'text', show: true, width: 100, cell: this.ActiveVersionCell },
            { title: this.props.getLocalizedString("scorecards.version"), field: 'version', filter: 'text', show: true, width: 100 },
            { title: this.props.getLocalizedString("scorecards.dateActive"), field: 'activeDate', filter: 'text', show: true, width: 150, cell: this.DateCell },
            { title: this.props.getLocalizedString("scorecards.dateBuilt"), field: 'buildDate', filter: 'text', show: true, width: 150, cell: this.DateCell },
            { title: this.props.getLocalizedString("scorecards.scDefinition"), field: 'scDefsHTML', filter: 'text', show: true, cell: this.ViewDetailsCell },
            { title: this.props.getLocalizedString("scorecards.timePeriodDefinition"), field: 'tpDefsHTML', filter: 'text', show: true, cell: this.ViewDetailsCell },
            { title: this.props.getLocalizedString("scorecards.details"), field: 'details', filter: 'text', show: true, cell: this.ViewDetailsCell },
            { title: this.props.getLocalizedString("scorecards.generatedChars"), field: 'genCharDefsHTML', filter: 'text', show: true, cell: this.ViewDetailsCell }            
        ];

        return (
            <div>
                <ContentBox titleId="scorecards.manageViewSC" divId="" navHistory={this.navHistory} footerButtons={this.footerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <GridForm
                        data={this.state.data}
                        columns={columns}
                        viewOnly={this.props.viewOnly}
                        actionCompleted={true} //TO-DO make dynamic
                        enableInlineEdits={false}
                        commitInlineChanges={this.commitInlineChanges}
                        hideCopy={true}
                        hideDelete={true}                        
                        hideEdit={true}
                        getAdditionalButtons={this.getAdditionalButtons}
                    />                     
                    <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                    <ScoreDefDisplayModal {...this.state}  toggleModal={this.toggleModal} viewOnly={true}/>
                    <ScoreModelDefDisplayModal 
                        {...this.state}  
                        toggleModal={this.toggleModal} 
                        viewOnly={true}
                        version={this.state.scVersion}
                    />
                </ContentBox>
                {this.props.footer}
            </div>
        );
    }
}

export default ScoreViewModelDef;