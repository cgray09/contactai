import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import DiscretizeGroup from './DiscretizeGroup'
import InlineError from '../../commonsweb/js/ErrorHandling/InlineError';
import { sqlBuilderSvc } from "../../services/sqlBuilderSvc";
import DeleteConfirmationModal from '../../commonsweb/js/NotificationModals/DeleteConfirmationModal';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

class DiscretizeBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            anchor: null,
            dictionary: [],
            operandInFocus: null, //determines whether we are modifying operand 1 or 2
            rowInFocus: null,
            operandInFocusVal: null,
            operandInFocusType: 1, //need to differentiate between literal and characteristic value
            logicLineInFocus: false,
            ruleId: 0
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

    getArrayOfAllChars = (dataDictionary) => {
        let sak = dataDictionary.SAKData;
        let acct = dataDictionary.acctMastData;
        let genVar = dataDictionary.genVarData;
        let hist = dataDictionary.histData;

        return sak.concat(acct, genVar, hist);
    }

    setOperandValue = (value) => {
        let operandInFocus = this.state.operandInFocus;
        let rules = this.props.discretizeInFocus;
        let rowIndex = this.state.rowInFocus;
        if (rules.length > rowIndex && operandInFocus) {
            if (operandInFocus === "operand1") {
                rules[rowIndex].operand1 = value;
            }
            else {
                rules[rowIndex].operand2 = value;
            }
            this.props.updateDiscretize(rules);
        }
    }

    addRule = () => {
        let rules = this.props.discretizeInFocus;
        rules.push({ id: sqlBuilderSvc.generateId(), operand1: '', operand2: '', asgValue: '' });
        this.props.updateDiscretize(rules);
    }

    deleteRule = () => {
        let rules = this.props.discretizeInFocus;
        rules.splice(this.state.ruleId, 1);
        this.props.updateDiscretize(rules);
        this.closeDeleteConfirmationModal();
        this.setState({ ruleId: 0 });
    }

    callRuleModal = (ruleIndex) => {
        this.setState({ 
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

    render() {
        return (
            <div>
                <div className="sectionTitle" style={{ display: "inline-block", width: "100%" }}>
                    <div style={{ display: "inline-block" }}>
                        <FormattedMessage id="sqlBuilder.definitionEditor" defaultMessage="Definition Editor" />
                    </div>
                    <div style={{ float: "right", paddingRight: "10px"}}>
                        <Button primary={true} onClick={this.addRule} disabled={this.props.viewOnly}>
                            <FormattedMessage id="sqlBuilder.addRule" defaultMessage="Add Rule" />
                        </Button>
                    </div>
                </div>
                <InlineError errorMessage={sqlBuilderSvc.getDiscretizeErrorMessages(this.props.sqlSubmitted, this.props.discretizeInFocus)} /> 
                <DiscretizeGroup
                    discretizeInFocus={this.props.discretizeInFocus}
                    dictionary={this.state.dictionary}
                    name={this.props.name}
                    isPopDetail={this.props.isPopDetail}
                    sqlSubmitted={this.props.sqlSubmitted}
                    getRuleErrorMessage={this.getRuleErrorMessage}
                    handleDiscretizeChange={this.props.handleDiscretizeChange}
                    updateDiscretize={this.props.updateDiscretize}
                    viewOnly={this.props.viewOnly}
                    displayDefinitionModal={this.props.displayDefinitionModal}
                    callRuleModal={this.callRuleModal}
                />
                <DeleteConfirmationModal
                    divId={this.props.deleteConfDivId}
                    titleId={this.props.deleteConfTitleId}
                    messageId={this.state.messageId}
                    deleteEvent={this.deleteRule}
                />
            </div>
        );
    }
}

export default DiscretizeBuilder;