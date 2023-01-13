import React from 'react';
import LogicGroup from './LogicGroup'
import InlineError from '../../commonsweb/js/ErrorHandling/InlineError';
import { sqlBuilderSvc } from "../../services/sqlBuilderSvc";
import { FormattedMessage } from 'react-intl';
import axios from "axios";
import DeleteConfirmationModal from '../../commonsweb/js/NotificationModals/DeleteConfirmationModal';
axios.defaults.withCredentials = true;

class LogicBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            anchor: null,
            dictionary: [],
            operandInFocus: null, //determines whether we are modifying operand 1 or 2
            rowInFocus: null,
            groupInFocus: null,
            operandInFocusVal: null,
            operandInFocusType: null,
            logicLineInFocus: false,
            groupId: 0,
            ruleId: 0,
            type: '',
            messageId: ''
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

 /*   getArrayOfAllChars = (dataDictionary) => {
        let sak = dataDictionary.SAKData;
        let acct = dataDictionary.acctMastData;
        let genVar = dataDictionary.genVarData;
        let hist = dataDictionary.histData;

        return sak.concat(acct, genVar, hist);
    }
*/

    addElseIfGroup = () => {
        let groups = [...this.props.logicGroups];
        let lastGroup = groups[groups.length-1];
        let newGroup = {
            id: sqlBuilderSvc.generateId(),
            logicLines: sqlBuilderSvc.getDefaultOperandSet(),
            rules: sqlBuilderSvc.getDefaultOperandSet(),
            statementType: "elseif",
        };

        if( lastGroup.statementType === "else" ) {
            groups.splice(-1, 0, newGroup);
        } else {
            groups.push(newGroup);
        }

        this.setState({ logicGroups: groups });
        this.props.updateSqlInFocus(groups);
    }

    addElseGroup = () => {
        let groups = [...this.props.logicGroups];
        let newGroup = {
            id: sqlBuilderSvc.generateId(),
            logicLines: sqlBuilderSvc.getDefaultLastOperandSet(),
            rules: sqlBuilderSvc.getDefaultLastOperandSet(),
            statementType: "else",
        };

        groups.push(newGroup);

        this.setState({ logicGroups: groups });
        this.props.updateSqlInFocus(groups);
    }

    addRule = (index) => {
        if (index > -1 && index < this.props.logicGroups.length) {
            let logicGroupTemp = this.props.logicGroups;
            let updatedLogicLines = logicGroupTemp[index].logicLines.concat({ id: sqlBuilderSvc.generateId(), type: 'new', operand1: '', operand2: '', operand1Type: 0, operand2Type: 0, connector: 'AND' });
            logicGroupTemp[index].logicLines = updatedLogicLines;
            this.props.updateSqlInFocus(logicGroupTemp);
            this.setState({ logicGroups: logicGroupTemp });
        }

    }

    deleteLogicGroup = () => {
        let logicGroupTemp = [...this.props.logicGroups];
        logicGroupTemp.splice(this.state.groupId, 1);

        // if we've deleted everything but the first element and it's an else statement, swap it to an elseif.
        if( logicGroupTemp[0]?.statementType === "else" ) {
            logicGroupTemp[0].statementType = "elseif";
        }

        this.props.updateSqlInFocus(logicGroupTemp);
        this.closeDeleteConfirmationModal();
        this.setState({ groupId: 0 });
    }

    callGroupModal = (groupIndex) => {
        this.setState({ 
            groupId: groupIndex, 
            type: 'group', 
            messageId: 'sqlBuilder.logicGroup.deleteConfirmation'  
        });
        this.openModal(this.props.deleteConfDivId);
    }

    callRuleModal = (groupIndex, ruleIndex) => {
        this.setState({ 
            groupId: groupIndex, 
            ruleId: ruleIndex, 
            type: 'rule',
            messageId: 'sqlBuilder.logicRule.deleteConfirmation'
         });
        this.openModal(this.props.deleteConfDivId);
    }

    openModal = (modalId) => {
        if (modalId) {
          var modal = document.getElementById(modalId);
          modal.style.display = "block";
        }
    }

    closeDeleteConfirmationModal = () => {
        if (this.props.deleteConfDivId) {
          var modal = document.getElementById(this.props.deleteConfDivId);
          modal.style.display = "none";
        }
    }

    deleteRule = () => {
        if (this.state.ruleId !== 0) {
            let logicGroupTemp = [...this.props.logicGroups];
            logicGroupTemp[this.state.groupId].logicLines.splice(this.state.ruleId, 1);
            this.props.updateSqlInFocus(logicGroupTemp);
            this.closeDeleteConfirmationModal();
            this.setState({ groupId: 0, ruleId: 0 });
        }
    }

    deleteEvent = () => {
        if (this.state.type === 'group') {
            this.deleteLogicGroup();
        } else {
            this.deleteRule();
        }
    }

    render() {
        return (
            <div>
                <div className="sectionTitle" style={{ display: "inline-block", width: "100%" }}>
                    <div style={{ display: "inline-block" }}>
                        <FormattedMessage id="sqlBuilder.definitionEditor" defaultMessage="Definition Editor" />
                    </div>
                </div>
                <InlineError errorMessage={sqlBuilderSvc.getErrorMessages(this.props.sqlSubmitted, this.props.logicGroups)} />
                <LogicGroup
                    sqlBuilderStyle={this.props.sqlBuilderStyle}
                    logicGroups={this.props.logicGroups}
                    addRule={this.addRule}
                    deleteLogicGroup={this.deleteLogicGroup}
                    deleteRule={this.deleteRule}
                    addElseIfGroup={this.addElseIfGroup}
                    addElseGroup={this.addElseGroup}
                    updateSqlInFocus={this.props.updateSqlInFocus}
                    name={this.props.name}
                    handleDetailChange={this.props.handleDetailChange}
                    sqlSubmitted={this.props.sqlSubmitted}
                    viewOnly={this.props.viewOnly}
                    dictionary={this.state.dictionary}
                    callGroupModal={this.callGroupModal}
                    callRuleModal={this.callRuleModal}
                />
                <DeleteConfirmationModal
                    divId={this.props.deleteConfDivId}
                    titleId={this.props.deleteConfTitleId}
                    messageId={this.state.messageId}
                    deleteEvent={this.deleteEvent}
                />
            </div>
        );
    }
}

export default LogicBuilder;