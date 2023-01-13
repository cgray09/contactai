import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input, TextArea, Checkbox } from "@progress/kendo-react-inputs";
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { staticDataSvc } from '../services/staticDataSvc';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup';
import { commonService } from '../services/commonSvc.js';
import { FormattedMessage } from 'react-intl';

//This generic component is used by multiple pages in the application. Currently this consists of
//Download -> Segment Population
//ScoreCards -> Include Sample Points
//ScoreCards -> Assign Scorecards
//Based on which page is accessign this form, different fields/values will be rendered
//CRUD operations will be run based on the URL's passed to this component as a prop

class LogicRuleEditForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            dataModel: {},
            description: ''
        }
    }

    componentWillReceiveProps({ dataModel}) {
        this.setState({ 
            ...this.state, 
            dataModel, 
            description: dataModel.description
        });
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
            dataModel: {
                ...prevState.dataModel,
                [name]: value
            }
        }));
    }

    handleCheckBox = (e) => {
        let value = e.value;
        const name = e.target.element.current.name;
        this.setState(prevState => ({
            dataModel: {
                ...prevState.dataModel,
                [name]: value
            }
        }));
    }

    handleDescription = (e) => {
        let value = e.value;
        this.setState(prevState => ({
            dataModel: {
                ...prevState.dataModel,
            },
            description: value
        }));
    }

    submit = () => {
        let dataModel = this.state.dataModel;
        dataModel.description = this.state.description;
        this.props.submit(dataModel);
        //this.reset();
    }

    reset = () => {
        this.props.toggleModal("displayEditPage", false);
        this.props.releaseLock(this.state.dataModel.id);
        this.setState({dataModel: {}});
    }
    

    getFilterCondition = (field) => {
        //TO-DO: Update the field names to reflect the model in the server once it's implemented
        if (this.props.page === "SEGMENTPOPULATION") {
            return field != "description" && field != "spId";
        }
        else if (this.props.page === "SAMPLEPOINT") {
            return field != "description" && field != "includeExclude";
        }
        else {
            return field != "description" && field != "scoreId" && field != "callHistory";
        }
    }

    buildRows = (fields) => {
        fields = fields.filter(item => this.getFilterCondition(item.field));
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
                        value={this.state.dataModel[item.field]}
                        onChange={this.handleChange}
                        maxLength="50"
                        allowCustom={true}
                        style={{ width: "325px" }}
                        disabled={this.props.viewOnly}
                    />
                    <span style={{ padding: "10px", fontWeight: "500" }}>)</span>
                </div>
            </div>
        ))
    }

    getContent = () => {
        if (this.props.page === "SEGMENTPOPULATION") {
            return <Input name="spId" onChange={this.handleChange} value={this.state.dataModel ? this.state.dataModel.spId : null} disabled={this.props.viewOnly}/>
        }
        else if (this.props.page === "SAMPLEPOINT") {
            return <DropDownList
                name="include"
                value={this.state.dataModel ? this.state.dataModel.include : null}
                defaultValue='INCLUDE'
                data={['INCLUDE', 'EXCLUDE']}
                onChange={this.handleChange}
                style={{ width: "200px" }}
                disabled={this.props.viewOnly}
            />
        }
        else {
            return <Input name="scoreId" onChange={this.handleChange} value={this.state.dataModel ? this.state.dataModel.scoreId : null} disabled={this.props.viewOnly}/>
        }
    }

    render() {
        return (
            <ModalStateDisplay
                titleId={staticDataSvc.logicRuleEditTitleId(this.props.page)}
                divId="logicRuleEdit"
                footerButtons={this.getFooterButtons()}
                isOpen={this.props.displayEditPage}
            >
                <ErrorGroup errorMessages={this.props.submitErrors} />
                {this.props.page === "ASSIGNMENT" &&
                    <div style={{ padding: "20px" }}>
                        <label className="label" style={{ paddingRight: "10px", fontWeight: "500" }}>
                            <FormattedMessage id="scorecards.useCallHistory" defaultMessage="Use Call History" />
                        </label>
                        <span><Checkbox name="callHistory" onChange={this.handleCheckBox} value={this.state.dataModel && this.state.dataModel.callHistory ? true : false} disabled={this.props.viewOnly}/></span>
                    </div>
                }
                {this.buildRows(this.props.fields)}
                <div className="contentBoxRow">
                    <label className="label" style={{ width: "55px", fontWeight: "500" }}>
                        <FormattedMessage id="sqlBuilder.then" defaultMessage="THEN" />
                    </label>
                </div>
                <div className="contentBoxRow" style={{ paddingLeft: "30px" }}>
                    <label style={{ display: "table-cell", width: "225px", padding: "10px", fontWeight: "500" }}>
                        <FormattedMessage id={staticDataSvc.logicRuleEditSetValLabelId(this.props.page)} defaultMessage="Set to" />
                    </label>
                    <div className="content">
                        {this.getContent()}
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
                        {/*<Input
                            name="description"
                            onChange={this.handleChange}
                            maxLength="150"
                            value={this.state.dataModel.description}
                            style={{ width: "500px" }}
                            rows={4} /> 
                        */}
                        <TextArea name="description" onChange={this.handleDescription} value={this.state.description} style={{ width: "425px" }} rows={4} disabled={this.props.viewOnly}/>

                    </div>
                </div>
            </ModalStateDisplay>
        )
    };
}

export default LogicRuleEditForm;