import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox } from './';
import { commonService } from '../services/commonSvc.js';
import { Error } from "@progress/kendo-react-labels";
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import GridForm from '../commonsweb/js/Grid/GridForm';
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import GridAddColumn from './GridAddColumn';
import GridRemoveColumn from './GridRemoveColumn';
import LogicRuleEditForm from './LogicRuleEditForm';

import axios from "axios";
import { FormattedMessage } from 'react-intl';
import { staticDataSvc } from '../services/staticDataSvc';
axios.defaults.withCredentials = true;


export default class DynamicColumnGrid extends React.PureComponent {

    _isMounted = false;
    fixedColumns = [];

    constructor(props) {
        super(props);
        
        this.fixedColumns = [...this.props.columns]
        this.state = {
            data: [],
            selectedItem: {},
            responseErrors: [], //response errors from submitting item
            actionCompleted: true, //used for loading indicator
            submitErrors: null,
            displayEditPage: false,
            displayAddColumn: false,
            displayRemoveColumn: false,
            columns: this.fixedColumns
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

    columnRow = null;
    lengthRow = null;
    fetchData = () => {
        this.setState({ actionCompleted: false, responseErrors: [] });
        axios.get(this.props.API_ENDPOINT)
            .then(response => {
                if (this._isMounted) {
                    let data = response.data;
                    this.lengthRow = data.find(obj => obj.lineNum === -1);
                    this.columnRow = data.find(obj => obj.lineNum === 0);

                    this.setState({
                        data: data.filter(row => row.lineNum > 0),
                        responseErrors: [],
                        columns: this.loadColumns(this.columnRow),
                        actionCompleted: true,
                        displayEditPage: false
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

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    getItem = (selectedItem) => {
        this.setState({ actionCompleted: false });
        axios
            .get(this.props.API_ENDPOINT + selectedItem.id)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.prepAndOpenEditModal(response.data);
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    delete = (selectedItem) => {
        this.setState({ actionCompleted: false });
        axios
            .delete(this.props.API_ENDPOINT + selectedItem.id)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.fetchData();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }

    prepAndOpenEditModal = (selectedItem) => {
        this.setState({
            selectedItem: selectedItem,
            responseErrors: [],
            submitErrors: null
        });
        this.toggleModal("displayEditPage", true);
    }

    toggleModal = (modalName, display) => {
        this.setState({ [modalName]: display });
    }

    releaseLock = (id) => {
        if (typeof id !== "undefined" && id !== null) { // doing this instead of if (id) check coz found id with 0 value in test DB
            axios
                .post(this.props.API_ENDPOINT + id + "/releaseLock") 
                .then(response => { })
                .catch(error => {
                    this.handleResponseErrors(error, false);
                });
        }
    }

    submit = (item) => {
        this.setState({ actionCompleted: false, submitErrors: null });
        let postURL = this.props.API_ENDPOINT;
        let putURL = this.props.API_ENDPOINT + item.id;
        console.log(item);
        axios({
            method: item.id ? 'PUT' : 'POST',
            url: item.id ? putURL : postURL,
            data: item
        })
        .then(response => {
            this.setState({ actionCompleted: true });
            this.fetchData();
            this.toggleModal("displayEditPage", false);
        })
        .catch(error => {
            if (this._isMounted) {
                let submitErrors = commonService.getResponseErrors(error);
                this.setState({ submitErrors, actionCompleted: true });
            }
        });
    }

    columnList = () => {
        let columns = this.state.columns;
        return columns.filter(item => item.field != "description" && item.field != "include")
    }

    loadColumns = (obj) => {
        let columns = [...this.fixedColumns];

        /* in addition to the default "description" and "include/excude" columms, iterate over each dynamically created column
           and push it into our columns array. These columns will then be updated in state and will re-render the grid */
        Object.entries(obj).forEach(([key, value]) => {
            /*current thick client sets deleted column values to "REF_NAME_<NUM>. As a result these are
            considered inactive columns and should not be displayed. Same will null columns" */
            if (key.includes("refName") && value != null && !value.startsWith("REF_NAME")) {
                let newColumn = { title: value, field: key, filter: 'text', show: true };
                columns.push(newColumn);
            }
        });
        return columns;
    }

    submitColumn = (name, refName, refNameLength, isDelete) => {
        this.setState({ actionCompleted: false });

        //database only allows a maximum of 10 custom columns, in addition to the default "description" and "include/exclude" columns
        if(isDelete || (this.state.columns && this.state.columns.length < 12)){
            let columnProperties = this.modelColumnProperties(name, refName, refNameLength);
            axios
            .put(this.props.API_ENDPOINT + "properties", columnProperties)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.fetchData();
            })
            .catch(error => {
                this.handleResponseErrors(error);
            });
        }
    }

    modelColumnProperties = (name, refName, refNameLength) => {
        let columnProperties = {};
        columnProperties.refName = refName;
        columnProperties.refNameValue = name || null; //The column name we generated
        columnProperties.refNameValueId = this.columnRow ? this.columnRow.id : 1; //pkeyId of line_num 0
        columnProperties.refNameLength = refNameLength;
        columnProperties.refNameLengthId = this.lengthRow ? this.lengthRow.id : 0; //pkeyId of line_num -1
        return columnProperties;
    }

    getAvailableColumnSlot = () => {
        let availableColumnSlot = null;
        Object.entries(this.columnRow).forEach(([key, value]) => {
            if (key.includes("refName") && (!value || value.startsWith('REF_NAME')) && !availableColumnSlot) {
                availableColumnSlot = key.replace("refName", "REF_NAME_");
            }
        });
        return availableColumnSlot;
    }

    addItem = () => {
        this.setState({ selectedItem : {}, submitErrors: null });
        this.toggleModal("displayEditPage", true);
    }

    goBack = () => {
        this.props.history.goBack();
    }

    footerButtons =
        <div className="actions">
            <Button onClick={this.goBack}>
                <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>

    gridToolBar =
        <div className="actions">
            {this.props.viewOnly ?null :
                <Button onClick={this.addItem}><FormattedMessage id={this.props.addButtonLabel} defaultMessage="New" /></Button>
            }    
            {this.props.viewOnly ?null :
                <Button onClick={() => this.toggleModal("displayAddColumn", true)}><FormattedMessage id="scorecards.addColumn" defaultMessage="Add Column" /></Button>
            }    
            {this.props.viewOnly ?null :
                <Button onClick={() => this.toggleModal("displayRemoveColumn", true)}><FormattedMessage id="scorecards.removeColumn" defaultMessage="Remove Column" /></Button>
            }
        </div>



    render() {
        return (
            <div>
                <ContentBox titleId={this.props.contentBoxTitleId} divId="dynamicColumnGrid" navHistory={this.props.navHistory} footerButtons={this.footerButtons}>
                    <ErrorGroup errorMessages={this.state.responseErrors} />
                    <GridForm
                        data={this.state.data}
                        columns={this.state.columns}
                        getItem={this.getItem}
                        copyItem={this.openCopyModal}
                        delete={this.delete}
                        viewOnly={this.props.viewOnly}
                        actionCompleted={this.state.actionCompleted}
                        gridToolBarContent={this.gridToolBar}
                        enableInlineEdits={false}
                        draggable={true}
                        scrollable={true}
                        deleteConfDivId="deleteConf"
                        deleteConfTitleId="action.confirm"
                        deleteConfMessageId="deleteConfirmation2"
                        apiUrl={this.props.API_ENDPOINT} //TO-DO: Update
                        fetchData={this.fetchData}
                        hideDelete={this.props.viewOnly}
                        hideCopy={true} // TO-DO future release
                    />
                </ContentBox>
                <GridAddColumn
                    displayAddColumn={this.state.displayAddColumn}
                    toggleModal={this.toggleModal}
                    submitColumn={this.submitColumn}
                    maxReached={this.state.columns.length >= 12}
                    getAvailableColumnSlot={this.getAvailableColumnSlot}
                />
                <GridRemoveColumn
                    displayAddColumn={this.state.displayRemoveColumn}
                    toggleModal={this.toggleModal}
                    columns={this.columnList()}
                    fetchData={this.fetchData}
                    submitColumn={this.submitColumn}
                />
                <LogicRuleEditForm
                    dataModel={this.state.selectedItem}
                    displayEditPage={this.state.displayEditPage}
                    toggleModal={this.toggleModal}
                    releaseLock={this.releaseLock}
                    fields={this.columnList()}
                    getLocalizedString={this.props.getLocalizedString}
                    submit={this.submit}
                    page={this.props.page}
                    submitErrors={this.state.submitErrors}
                    viewOnly={this.props.viewOnly}
                />
                {this.props.footer}
            </div>
        );
    }
}