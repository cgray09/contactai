import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox } from './';
import LogicBuilder from './LogicBuilder/LogicBuilder';
import { sqlBuilderSvc } from "../services/sqlBuilderSvc";
import { commonService } from '../services/commonSvc.js';
import { staticDataSvc } from '../services/staticDataSvc';
import { FormattedMessage } from 'react-intl';
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import axios from "axios";
axios.defaults.withCredentials = true;

export default class ExcludeRecords extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            responseErrors: [],
            dictionary: [],
            sqlInFocus: [],
            isNewSQL: false,
            actionCompleted: true, //used for loading indicator
            sqlSubmitted: false,
            submitError: null,
            deleteConfDivId: "deleteStandardizeDataConf",
        }
    }

    goBack = () => {
        this.releaseLock();
        this.props.history.goBack();
    }

    navHistory = staticDataSvc.excludeNavHistory(this.props.page);

    componentDidMount() {
        this._isMounted = true;
        //TO-DO: Uncomment the fetch functions below and remove the dummy data
        //this.fetchDataDictionary();  This may be needed to replace with fetchDataDictDetails() function that 
                                       //returns data dict with its data type. This should then be used in 
                                       //reverseParseLogicGroupDataModel to determine operand2IsString true/false 
                                       //to set the operator correctly.                                        
        this.fetchData();
    }

    componentWillUnmount() {
        this.resetForm();
        this._isMounted = false;
    }

    fetchDataDictionary = () => {
        axios
            .get("/api/datadictionary/" + 'excludeData/' + this.props.page)
            .then(response => this.setState({dictionary : response.data}));
    }

    fetchData = () => {
        this.setState({ actionCompleted: false });
        axios
            .get("/api/exclusions/" + this.props.page)
            .then(response => {
                this.populateSQLBuilder(response.data);
            })
            .catch(error => {
                if ((error && error.response) && error.response.status === 404) {
                    this.populateSQLBuilder(null);
                }
                else {
                    this.handleResponseErrors(error);
                }
            });
    }

    populateSQLBuilder = (sqlInFocus) => {
        let isNewSQL = false;
        if (!sqlInFocus || sqlInFocus.length < 1) {
            isNewSQL = true;
            sqlInFocus = sqlBuilderSvc.getDefaultSql();
        }
        else {
            sqlInFocus = sqlBuilderSvc.parseLogicGroupDataModel(sqlInFocus);
        }
        this.setState({ isNewSQL, sqlInFocus, responseErrors: [], actionCompleted: true });
    }

    updateSqlInFocus = (sqlInFocus) => {
        this.setState({ sqlInFocus });
    }

    handleDetailChange = (groupIndex, rowIndex, data) => (e) => {
        let sqlInFocus = [...this.state.sqlInFocus];
        let logicGroup = { ...sqlInFocus[groupIndex] };
        if(e.target.name == 'equals'){
            logicGroup.equals = e.target.value; //make change at group level
        }
        else{
            logicGroup.logicLines[rowIndex][e.target.name] = e.target.value; //make change at row level
            if(e.target.name === 'operand1') {      //check if operand1 was modified
                if(data.includes(e.target.value)) {  //check if changed value is a Characteristic value (not literal)
                    logicGroup.logicLines[rowIndex]['operand1Type'] = 3  //set operand1Type to 3 - Characteristic
                } else {
                    logicGroup.logicLines[rowIndex]['operand1Type'] = 1  //set operand1Type to 1 - literal
                }
            }
            if(e.target.name === 'operand2') {      //check if operand2 was modified
                if(data.includes(e.target.value)) {  //check if changed value is a Characteristic value (not literal)
                    logicGroup.logicLines[rowIndex]['operand2Type'] = 3 //set operand1Type to 3 - Characteristic
                } else {
                    logicGroup.logicLines[rowIndex]['operand2Type'] = 1  //set operand1Type to 1 - literal
                }
            }             
        }
        
        sqlInFocus[groupIndex] = logicGroup;
        this.setState({ sqlInFocus });
    }

    hasValidLogicGroups = (logicGroups) => {
        for (let i = 0; i < logicGroups.length; i++) {
            if (logicGroups[i].statementType !== "else" && !sqlBuilderSvc.hasValidLogicLines(logicGroups[i].logicLines)) {
                return false;
            }
        }
        return true;
    }

    submitSQL = () => {
        this.setState({ sqlSubmitted: true });
        if (this.hasValidLogicGroups(this.state.sqlInFocus)) {
            //TO-DO: uncomment the below logic for parsing and persisting data
            let sql = null;
            sql = sqlBuilderSvc.reverseParseLogicGroupDataModel(this.state.sqlInFocus);
            this.updateSQL(sql);
        }        
    }

    // saveSQL = (id, sql) => {
    //     this.setState({ actionCompleted: false });
    //     if (this.state.isNewSQL) {
    //         axios
    //             .post("/api/callResults/" + id + "/definitions", sql) //TO-DO: Update URL
    //             .then(response => {
    //                 this.setState({ actionCompleted: true });
    //                 this.closeSqlModal();
    //             })
    //             .catch(error => {
    //                 this.handleResponseErrors(error, true);
    //             });
    //     }
    //     else {
    //         this.updateSQL(id, sql);
    //     }
    // }

    updateSQL = (sql) => {
        this.setState({ actionCompleted: false });
        if(sql == null || sql.length < 1) {
            
            axios
                .delete("/api/exclusions/" + this.props.page)
                .then(response => {
                    this.setState({ actionCompleted: true });
                    this.handleSuccessfulSubmission();
                    //this.closeSqlModal(); //there is no separate modal here, 
                    //this.goBack();    //Go Back to return to previous page on success.
                })
                .catch(error => {
                    this.handleResponseErrors(error, true);
                });
        
        } else {

            axios({
                method: this.state.isNewSQL ? 'POST' : 'PUT',
                url: "/api/exclusions/" + this.props.page,
                data: sql
            })
                //    .post("/api/exclusions/" + this.props.page, sql)
                .then(response => {
                    this.setState({ actionCompleted: true, isNewSQL: false });
                    this.handleSuccessfulSubmission();
                    //this.closeSqlModal(); //there is no separate modal here, 
                    //this.goBack();    //Go Back to return to previous page on success.
                })
                .catch(error => {
                    this.handleResponseErrors(error, true);
                });
        }
    }


    //--------------------------------------------------------- UTILITY FUNCTIONS -----------------------------------------------------------------------------------


    resetForm = () => {
        if (this._isMounted) {
            this.setState({
                sqlInFocus: [],
                responseErrors: [],
                isNewSQL: false,
                actionCompleted: true,
                sqlSubmitted: false,
                submitError: null
            })
        }
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            // this.setState({ actionCompleted: true,  });
            this.fetchData();
            //TO-DO: Eventually implement call to release locks
            this.resetForm();
        }
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    releaseLock = () => {
        axios
            .post("/api/exclusions/" + this.props.page + "/releaseLock")
            .then(response => { })
            .catch(error => {
                this.handleResponseErrors(error, false);
            });

    }

    render() {
        const footerButtons =
            <div className="actions">
                <Button onClick={this.goBack}>
                    <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
                </Button>
                {this.props.viewOnly ? null :
                <Button onClick={this.submitSQL} primary={true} className="button actions">
                    <FormattedMessage id="action.commit" defaultMessage="Commit" />
                </Button>}
            </div>

        return (
            <div>
                <ContentBox titleId={staticDataSvc.excludeTitleId(this.props.page)} divId="crExcludeRecords" navHistory={this.navHistory} footerButtons={footerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <LogicBuilder
                        {...this.state}
                        sqlBuilderStyle={2}
                        logicGroups={this.state.sqlInFocus}
                        updateSqlInFocus={this.updateSqlInFocus}
                        handleDetailChange={this.handleDetailChange}
                        sqlResponseErrors={this.state.sqlResponseErrors}
                        viewOnly={this.props.viewOnly}
                        page={this.props.page}
                        dataDictURI='excludeData/'
                    />
                </ContentBox>
                <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
                {this.props.footer}
            </div>
        );
    }
}