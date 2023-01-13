import React from 'react';
import DiscretizeRule from './DiscretizeRule';
import { Button } from '@progress/kendo-react-buttons';
import InlineError from '../../commonsweb/js/ErrorHandling/InlineError';
import { sqlBuilderSvc } from "../../services/sqlBuilderSvc";

class DiscretizeGroup extends React.Component {

    componentDidMount() {
        this.syncButtons();
    }

    componentDidUpdate() {
        this.syncButtons();
    }

    ruleButtons = [];
    syncButtons = () => {
        if (!this.props.displayDefinitionModal) { return }

        //remove stale button widths
        sqlBuilderSvc.setButtonWidth(this.ruleButtons, null);
        
        let maxWidth = 620;
        //sync the size of the operand buttons to the length of the largest button
        sqlBuilderSvc.adjustToLargestButtonWidth(this.ruleButtons, 245, maxWidth);
    }

    addButton = (btn) => {
        if (btn) this.ruleButtons.push(btn);
    }

    onDragStart = (e, index) => {
        if (!this.props.viewOnly) {
            this.draggedItem = this.props.discretizeInFocus[index];
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/html", e.target.parentNode);
            e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
        }
    };

    onDragOver = index => {
        if (!this.props.viewOnly) {
            const draggedOverItem = this.props.discretizeInFocus[index];

            // if the item is dragged over itself, ignore
            if (this.draggedItem === draggedOverItem) {
                return;
            }

            // filter out the currently dragged item
            let discretizeInFocus = this.props.discretizeInFocus.filter(item => item !== this.draggedItem);

            // add the dragged item after the dragged over item
            discretizeInFocus.splice(index, 0, this.draggedItem);

            this.props.updateDiscretize(discretizeInFocus)
        }
    };

    onDragEnd = () => {
        if (!this.props.viewOnly) {
            this.draggedIdx = null;
        }
    };

    render() {
        return (
            <div id="discretizeGroup">
                <ul>
                    {this.props.discretizeInFocus.map((item, idx) => (
                        <li key={item.id} onDragOver={() => this.onDragOver(idx)}>
                            <div className="contentBoxRow query-builder form-inline">
                                <div
                                    className="rule-container"
                                    style={{ display: "inline-block", margin: "0px" }}
                                    draggable
                                    onDragStart={e => this.onDragStart(e, idx)}
                                    onDragEnd={e => this.onDragEnd(idx)}
                                >
                                    <div className="drag-handle" style={{ display: this.props.discretizeInFocus.length > 1 ? "inline-block" : "none" }}>
                                        <i className="sortable">&nbsp;&nbsp;&nbsp;&nbsp;</i>
                                    </div>
                                    <div style={{ display: "inline-block" }}>
                                        <DiscretizeRule
                                            index={idx}
                                            discretizeInFocus={item}
                                            dictionary={this.props.dictionary}
                                            name={this.props.name}
                                            numOfLogicLines={this.props.discretizeInFocus.length}
                                            deleteRule={this.props.deleteRule}
                                            clearOperandValue={this.props.clearOperandValue}
                                            handleDiscretizeChange={this.props.handleDiscretizeChange}
                                            viewOnly={this.props.viewOnly}
                                            addButton={this.addButton}
                                        />
                                    </div>
                                    <div className="btn-group pull-right rule-actions" style={{ float: "right" }}>
                                        <Button className="btn-delete-rule" onClick={() => this.props.callRuleModal(idx)} disabled={this.props.viewOnly}>
                                            <i className="delete"></i>
                                        </Button>
                                    </div>
                                    <div style={{ paddingLeft: "10px" }}>
                                        <InlineError
                                            errorMessage={
                                                this.props.sqlSubmitted ? sqlBuilderSvc.getDiscretizeLogicErrorMessage(item) : null
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </li>

                    ))}
                </ul>
            </div>
        );
    }
}

export default DiscretizeGroup;