import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input, TextArea } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { staticDataSvc } from '../services/staticDataSvc';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup';
import { commonService } from '../services/commonSvc.js';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

class ScoreEditAssignment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            assignment: {},
            responseErrors: [],
            actionCompleted: true, //used for loading indicator
            submitError: null
        }
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={this.reset}>
                {this.props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {this.props.viewOnly ? null : <Button primary={true} onClick={this.submit}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    handleChange = (e) => {
        let value = e.target.value;
        const name = e.target.name;
        this.setState(prevState => ({
            assignment: {
                ...prevState.assignment,
                [name]: value
            }
        }));
    }

    submit = () => {
        this.reset();
    }

    save = (assignment) => {
        this.setState({ actionCompleted: false });
        axios
            .post("<UPDATE_URL>") //TO-DO: Update URL
            .then(response => {
                this.setState({ actionCompleted: true });
                this.props.toggleModal("displayEditPage", false);
            })
            .catch(error => {
                this.handleResponseErrors(error, true);
            });
    }

    update = (assignment) => {
        this.setState({ actionCompleted: false });
        axios
            .put("<UPDATE_URL>") //TO-DO: Update URL
            .then(response => {
                this.setState({ actionCompleted: true });
                this.props.toggleModal("displayEditPage", false);
            })
            .catch(error => {
                this.handleResponseErrors(error, true);
            });
    }

    reset = () => {
        this.setState({
            selectedItem: {},
            responseErrors: [],
            actionCompleted: true, //used for loading indicator
            submitError: null
        })
        this.props.toggleModal("displayEditPage", false);
    }

    handleSuccessfulSubmission = () => {
        if (this._isMounted) {
            // this.setState({ actionCompleted: true,  });
            // this.fetchData();
            //TO-DO: Eventually implement call to release locks
            this.reset();
        }
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    buildRows = (fields) => {
        if (!fields) return [];
        let rows = [];
        for (let i = 0; i < fields.length; i++) {
            rows.push(<div className="contentBoxRow"><div className="content">{fields.title}</div></div>);
        }
        return rows;
    }

    buildRows = (fields) => {
        fields = fields.filter(item => item.field != "description" && item.field != "includeExclude");
        return fields.map((item, index) => (
            <div className="contentBoxRow">
                <label className="label" style={{ width: "55px", fontWeight: "500", paddingLeft: index > 0 ? "30px" : "10px", paddingRight: index > 0 ? "10px" : "30px" }}>
                    {index == 0 ? this.props.getLocalizedString("sqlBuilder.if") : this.props.getLocalizedString("sqlBuilder.and")}
                </label>
                <label style={{ display: "table-cell", padding: "10px", fontWeight: "500" }}>
                    ( <FormattedMessage id="scorecards.lessThanOrEqual" defaultMessage="{name} is less than or equal to" values={{ name: item.title }} />
                </label>
                <div className="content">
                    {this.openParen}
                    <Input
                        name={item.field}
                        onChange={this.handleChange}
                        maxLength="50"
                        allowCustom={true}
                        style={{ width: "325px" }}
                    />
                    <span style={{ padding: "10px", fontWeight: "500" }}>)</span>
                </div>
            </div>
        ))
    }

    render() {
        return (
            <ModalStateDisplay
                titleId="scorecards.IncludeSPEdit"
                divId="includeSPEdit"
                footerButtons={this.getFooterButtons()}
                isOpen={this.props.displayEditPage}
            >
                <ErrorGroup errorMessages={this.state.responseErrors} />
                {this.buildRows(this.props.fields)}
                <div className="contentBoxRow">
                    <label className="label" style={{ width: "55px", fontWeight: "500" }}>
                        <FormattedMessage id="sqlBuilder.then" defaultMessage="THEN" />
                    </label>
                </div>
                <div className="contentBoxRow" style={{ paddingLeft: "30px" }}>
                    <label style={{ display: "table-cell", width: "225px", padding: "10px", fontWeight: "500" }}>
                        <FormattedMessage id="scorecards.scoreId" defaultMessage="SCORE_ID" />
                    </label>
                    <div className="content">
                        <Input
                            name="scoreId"
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="contentBoxRow"></div>
                <div className="contentBoxRow">
                    <label className="label" style={{ fontWeight: "500" }}>
                        <FormattedMessage id="scorecards.description" defaultMessage="Description" />
                    </label>
                </div>
                <div className="contentBoxRow">
                    <div className="content">
                        <TextArea name="description" maxLength="150" onChange={this.handleChange} style={{ width: "500px" }} rows={4} />
                    </div>
                </div>
            </ModalStateDisplay>
        )
    };
}

export default ScoreEditAssignment;