import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { staticDataSvc } from '../services/staticDataSvc';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup';
import { commonService } from '../services/commonSvc.js';
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

class ComputeSubProc extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subProcInFocus: {},
            responseErrors: [],
            dictionary: [],
            actionCompleted: true, //used for loading indicator
            submitError: null
        }
    }

    componentDidMount(){
        this.fetchDataDictionary();
    }

    fetchDataDictionary = () => {
        axios
            .get("/api/datadictionary/" + this.props.dataDictURI + this.props.page)
            .then(response => this.setState({dictionary : response.data}));
    }

    componentWillReceiveProps({ subProcInFocus }) {
        subProcInFocus.connector1 = subProcInFocus.event1 ? "AND" : "";
        this.setState({ subProcInFocus });
    }

    getHeaderButtons = () => {
        return null;
        //TO-DO: Implement
    }

    getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={() => this.props.toggleModal("displaySubProc")}>
                {this.props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {this.props.viewOnly ? null : <Button primary={true} onClick={this.submit}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    getLable = (type, name) => {
        if (!type) return <FormattedMessage id="computeChars.equalTo" defaultMessage="Equal To" values={{ name: name }} />;
        switch (type.toUpperCase()) {
            case "EVAL":
                return <FormattedMessage id="computeChars.equalTo" defaultMessage="Equal To" values={{ name: name }} />;
            case "AVERAGE":
                return <FormattedMessage id="computeChars.nearestIntEqualTo" defaultMessage="Is the nearest integer nearest to" values={{ name: name }} />;
            case "RATIO":
                return <FormattedMessage id="computeChars.hundredTimesNearestInt" defaultMessage="Is 100 times the nearest integer equal to" values={{ name: name }} />;
            default:
                return <FormattedMessage id="computeChars.equalTo" defaultMessage="Equal To" values={{ name: name }} />;
        }
    }

    handleChange = (e) => {
        let value = e.target.value;
        const name = e.target.name;
        let subProc = this.state.subProcInFocus;
        subProc[name] = value;
        if(name === 'connector1' && value === "")  { subProc.event1 = null; subProc.event2 = null; subProc.connector = null; }
        if(name === 'connector' && value === "") subProc.event2 = null;
        this.setState({subProcInFocus : subProc});
    }

    submit = () => {
        this.setState({ logicSubmitted: true });
        this.props.isNewLogic ? this.save(this.state.subProcInFocus) : this.update(this.state.subProcInFocus);
    }

    save = (subproc) => {
        this.setState({ actionCompleted: false });
        axios
            .post("/api/computechars/" + this.props.selectedItem.id + "/subproc/" + this.props.page, subproc)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.props.toggleModal("displaySubProc");
            })
            .catch(error => {
                this.handleResponseErrors(error, true);
            });
    }

    update = (subproc) => {
        this.setState({ actionCompleted: false });
        axios
            .put("/api/computechars/" + this.props.selectedItem.id + "/subproc/" + this.props.page, subproc)
            .then(response => {
                this.setState({ actionCompleted: true });
                this.props.toggleModal("displaySubProc");
            })
            .catch(error => {
                this.handleResponseErrors(error, true);
            });
    }

    handleResponseErrors = (error) => {
        if (this._isMounted) {
            let responseErrors = commonService.getResponseErrors(error);
            this.setState({ responseErrors, actionCompleted: true });
        }
    }

    //Display a different style logic modal modal for types "DAYS_SINCE, COUNT_OF, SUM and VALUE_OF"
    displayStyle2 = () => {
        let type = this.props.selectedItem.type;
        return type === "DAYS_SINCE" || type === "COUNT_OF" || type === "SUM" || type === "VALUE_OF";
    }

    getHeaderDropdown = () => {
        let type = this.props.selectedItem.type;
        if(type.toUpperCase() === "SUM" || type.toUpperCase() === "VALUE_OF"){
            return <ComboBox
                name="actChar"
                onChange={this.handleChange}
                allowCustom={true}
                style={{ width: "550px" }}
                value={this.state.subProcInFocus.actChar} 
                data={this.state.dictionary} 
                disabled={this.props.viewOnly}/>
        }
        return null;
    }

    openParen = this.props.selectedItem.type !== "EVAL" ? <span style={{ fontSize: "25px", marginRight: "5px" }}>(</span> : null;
    closeParen = this.props.selectedItem.type !== "EVAL" ? <span style={{ fontSize: "25px", marginLeft: "5px" }}>)</span> : null;

    render() {
        
        if (!this.displayStyle2()) {
            return (
                <ModalStateDisplay
                    titleString={this.props.getLocalizedString("computeChars.computeChars") + ": " + this.props.selectedItem.name}
                    divId="subProcModal"
                    headerButtons={this.getHeaderButtons()}
                    footerButtons={this.getFooterButtons()}
                    isOpen={this.props.displaySubProc}
                >
                    <ErrorGroup errorMessages={this.props.sqlResponseErrors} />
                    <div className="contentBoxRow">
                        <label className="label" style={{ width: "250px" }}>
                            {this.getLable(this.props.selectedItem.type, this.props.selectedItem.name)}
                        </label>
                        <div className="content">
                            {this.openParen}
                            <ComboBox
                                name="actChar"
                                onChange={this.handleChange}
                                allowCustom={true}
                                style={{ width: "550px" }}
                                value={this.state.subProcInFocus.actChar} 
                                data={this.state.dictionary}
                                disabled={this.props.viewOnly}                              
                            />
                                
                        </div>
                    </div>
                    {this.props.selectedItem.type != "EVAL" ? <div className="contentBoxRow">
                        <label className="label" style={{ width: "260px" }}>
                            <FormattedMessage id="computeChars.dividedBy" defaultMessage="Divided By" />
                        </label>
                        <div className="content">
                            <ComboBox
                                name="anchor"
                                style={{ width: "550px" }}
                                onChange={this.handleChange}
                                allowCustom={true}
                                value={this.state.subProcInFocus.anchor}
                                data={this.state.dictionary}
                                disabled={this.props.viewOnly}
                            />
                            {this.closeParen}
                        </div>
                    </div> : null}
                </ModalStateDisplay>
            )
        }
        else {
            return (
                <ModalStateDisplay
                    titleString={this.props.getLocalizedString("computeChars.computeChars") + ": " + this.props.selectedItem.name}
                    divId="subProcModal"
                    headerButtons={this.getHeaderButtons()}
                    footerButtons={this.getFooterButtons()}
                    isOpen={this.props.displaySubProc}
                >
                    <ErrorGroup errorMessages={this.props.sqlResponseErrors} />
                    <div className="contentBoxRow">
                        <div className="content">    
                            <FormattedMessage 
                                id={staticDataSvc.getDisplay2HeaderLabelIds(this.props.selectedItem.type)} 
                                defaultMessage="{name}" 
                                values={{ name: this.props.selectedItem.name }} />
                        </div>
                        <div className="content">    
                            {this.getHeaderDropdown()}
                        </div>
                    </div>
                    <div className="contentBoxRow"><div className="content"/></div> {/* dummy row used for spacing purposes*/}
                    {this.props.selectedItem.type == "SUM" || this.props.selectedItem.type == "VALUE_OF" ?
                        <div className="contentBoxRow">
                            <div className="content">
                                <FormattedMessage id="computeChars.forAllCalls" defaultMessage="For all calls where" />: 
                            </div> 
                        </div>: null}
                    <div className="contentBoxRow">
                        <div className="content" style={{ width: "345px" }}>
                            <FormattedMessage id="computeChars.lessThanOrEqTo" defaultMessage="Days since the call is less than or equal to" />
                        </div>
                        <div className="content">
                            <Input name="range" value={this.state.subProcInFocus.range} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">
                            <DropDownList name="connector1" data={["AND", ""]} value={this.state.subProcInFocus.connector1} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                    </div>
                    {this.state.subProcInFocus.connector1 ? <div className="contentBoxRow">
                        <div className="content">
                            <Input name="event1" value={this.state.subProcInFocus.event1} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">
                            <DropDownList name="delim1" data={staticDataSvc.getSubProcComparators()} value={this.state.subProcInFocus.delim1} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">
                            <Input name="value1" value={this.state.subProcInFocus.value1} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">
                            <DropDownList name="connector" data={["AND", "OR", ""]} value={this.state.subProcInFocus.connector} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                    </div> : null}
                    {/* Only display this row if the connector from the previous row is set */}
                    {this.state.subProcInFocus.connector1 && this.state.subProcInFocus.connector ? 
                    <div className="contentBoxRow">
                        <div className="content">
                            <Input name="event2" value={this.state.subProcInFocus.event2} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">
                            <DropDownList name="delim2" data={staticDataSvc.getSubProcComparators()} value={this.state.subProcInFocus.delim2} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                        <div className="content">
                            <Input name="value2" value={this.state.subProcInFocus.value2} onChange={this.handleChange} disabled={this.props.viewOnly} />
                        </div>
                    </div> : null}
                </ModalStateDisplay>
            );
        }
    };
}

export default injectIntl(ComputeSubProc);