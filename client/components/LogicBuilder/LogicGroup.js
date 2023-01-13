import React, { useState }  from 'react';
import Rule from './Rule';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Button } from '@progress/kendo-react-buttons';
import InlineError from '../../commonsweb/js/ErrorHandling/InlineError';
import { FormattedMessage } from 'react-intl';
import { sqlBuilderSvc } from "../../services/sqlBuilderSvc";

const LogicGroup = (props) => {
    const [draggedItem, setdraggedItem] = useState(0);

    const createOperandGroup = (group, groupIndex) => {
        return group.map((item, idx) => (
            <li key={item.id} onDragOver={() => onDragRuleOver(groupIndex, idx)}>
                <div
                    className="rule-container"
                    draggable
                    onDragStart={e => onDragRuleStart(e, groupIndex, idx)}
                    onDragEnd={e => onDragEnd(e)}
                >
                    <div className="drag-handle"><i className="sortable">&nbsp;&nbsp;&nbsp;&nbsp;</i></div>
                    <div style={{ display: "inline-block" }}>
                        <Rule
                            index={idx}
                            groupIndex={groupIndex}
                            ruleValues={item}
                            numOfLogicLines={group.length}
                            handleDetailChange={props.handleDetailChange}
                            viewOnly={props.viewOnly}
                            dictionary={props.dictionary}
                        />
                    </div>
                    <div className="btn-group pull-right rule-actions" style={{ float: "right" }}>
                        {/* <Button className="btn btn-forcequotes"></Button> */}
                        <Button
                            className="btn-delete-rule"
                            onClick={() => props.callRuleModal(groupIndex, idx)}
                            style={{ display: idx !== 0 ? "inline-block" : "none" }}
                            disabled={props.viewOnly}
                        >
                            <i className="delete"></i>
                        </Button>
                    </div>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                    <InlineError
                        errorMessage={
                            props.sqlSubmitted
                                ? sqlBuilderSvc.getLogicLineErrorMessage(item) : null
                        }
                    />
                </div>
            </li>
        ))
    }

    const onDragStart = (e, index) => {
        // we don't want to grag anything that isn't draggable.
        if ( !checkDraggable(props.logicGroups[index]) ) {
            return;
        }
        if (!props.viewOnly) {
            setdraggedItem(props.logicGroups[index]);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/html", e.target.parentNode);
            e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
        }
    };

    const onDragRuleStart = (e, groupIndex, ruleIndex) => {
        if (!props.viewOnly) {
            setdraggedItem(props.logicGroups[groupIndex].logicLines[ruleIndex]);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/html", e.target.parentNode);
            e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
        }
    };

    const onDragOver = (index) => {
        if (!props.viewOnly) {
            const draggedOverItem = props.logicGroups[index];

            if (!isValidDragDrop(draggedOverItem, props.logicGroups)) {
                return;
            }

            // filter out the currently dragged item
            let logicGroups = props.logicGroups.filter(item => item !== draggedItem);

            // add the dragged item after the dragged over item
            logicGroups.splice(index, 0, draggedItem);

            props.updateSqlInFocus(logicGroups)
        }
    };

    const onDragRuleOver = (groupIndex, ruleIndex) => {
        if (!props.viewOnly) {
            reorderLogicLines(groupIndex, ruleIndex);
        }
    };

    const reorderRules = (groupIndex, ruleIndex) => {
        const draggedOverItem = props.logicGroups[groupIndex].rules[ruleIndex];
        let logicGroups = props.logicGroups;

        if (!isValidDragDrop(draggedOverItem, logicGroups[groupIndex].rules)) {
            return;
        }

        // filter out the currently dragged item
        let ruleGroups = logicGroups[groupIndex].rules.filter(item => item !== draggedItem);
        logicGroups[groupIndex].rules = ruleGroups;

        // add the dragged item after the dragged over item
        logicGroups[groupIndex].rules.splice(ruleIndex, 0, draggedItem)

        props.updateSqlInFocus(logicGroups)
    }

    const reorderLogicLines = (groupIndex, ruleIndex) => {
        const draggedOverItem = props.logicGroups[groupIndex].logicLines[ruleIndex];

        let logicGroups = props.logicGroups;

        if (!isValidDragDrop(draggedOverItem, logicGroups[groupIndex].logicLines)) {
            return;
        }

        // filter out the currently dragged item
        let logicLineGroups = logicGroups[groupIndex].logicLines.filter(item => item !== draggedItem);
        logicGroups[groupIndex].logicLines = logicLineGroups;

        // add the dragged item after the dragged over item
        logicGroups[groupIndex].logicLines.splice(ruleIndex, 0, draggedItem)

        props.updateSqlInFocus(logicGroups)
    }

    // if the item is dragged over itself, we don't want to drop.
    // if dragged item does not even exist in the current group in which we're dropping in, it means we're dragging from one group and attempting to drop
    // in another group. We do not want to allow that either.
    // we only want to allow user to drag and drop in order to re order within a current grouping
    const isValidDragDrop = (draggedOverItem, arr) => {

        if (draggedItem === draggedOverItem
            || !containsDraggedItem(arr)) {
            return false;
        }
        //We don't want to allow dragging over the Else
        if (draggedOverItem.statementType === "else"){
            return false
        }
        return true;
    }

    const containsDraggedItem = (arr) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === draggedItem) {
                return true;
            }
        }
        return false;
    }

    const onDragEnd = (e) => {
        if (!props.viewOnly) {
            let draggedIdx = null;
        }
    };

    const hasElseBlock = () => {
        if ( props.logicGroups[props.logicGroups.length - 1].statementType === "else" ) {
            return true;
        }

        return false;
    };

    const checkLogicLines = (group) => {
        if ( group.statementType === "elseif" ) {
            return true;
        }
        
        return false;
    };

    const checkDraggable = (group) => {
        if( group.statementType === "elseif" ) {
            return true;
        }
        
        return false;
    };

    return (
        <ul>
            {props.logicGroups.map((group, idx) => (
                    <li key={group.id} onDragOver={() => onDragOver(idx)}>
                    <div className="contentBoxRow query-builder form-inline">
                        <div className="rules-group-container" style={{ width: "100%" }}>
                            <div style={{ display: "inline-block" }}>
                                <div
                                    style={{ display: "inline-block", width: "100%" }}
                                    draggable
                                    onDragStart={e => onDragStart(e, idx)}
                                >
                                    {checkDraggable(group) ? <div className="drag-handle"><i className="sortable">&nbsp;&nbsp;&nbsp;&nbsp;</i></div> : null}
                                    <label className="label" style={{ display: "inline-block", fontWeight: "700" }}>
                                        {sqlBuilderSvc.getStatementBlockLabel(idx, group)}
                                    </label>
                                    <div style={{ float: "right", paddingRight: "10px" }}>
                                        <Button
                                            primary={true}
                                            onClick={() =>
                                                props.addRule(idx)}
                                            style={{ padding: "5px", margin: "5px", display: checkLogicLines(group) ? "inline-block" : "none" }}
                                            disabled={props.viewOnly}
                                        >
                                            <FormattedMessage id="sqlBuilder.addRule" defaultMessage="Add Rule" />
                                        </Button>
                                        <Button
                                            primary={true}
                                            onClick={props.addElseIfGroup}
                                            style={{ padding: "5px", margin: "5px", display: checkLogicLines(group) ? "inline-block" : "none" }}
                                            disabled={props.viewOnly}>
                                            <FormattedMessage id="sqlBuilder.addElseIf" defaultMessage="Add Else If" />
                                        </Button>
                                        <Button
                                            primary={true}
                                            onClick={props.addElseGroup}
                                            style={{ padding: "5px", margin: "5px", display: !hasElseBlock() ? "inline-block" : "none" }}
                                            disabled={props.viewOnly}>
                                            <FormattedMessage id="sqlBuilder.addElse" defaultMessage="Add Else" />
                                        </Button>
                                        <Button
                                            className="btn-delete-rule"
                                            onClick={() => props.callGroupModal(idx)}
                                            disabled={props.viewOnly}
                                        >
                                            <i className="delete"></i>
                                        </Button>
                                    </div>
                                </div>
                                <ul style={{ listStyleType: "none" }}>
                                    {checkLogicLines(group) ? createOperandGroup(group.logicLines, idx) : null}
                                </ul>
                                <div style={{ marginLeft: "20px", width: "100%" }}>
                                    <div style={{ display: "inline-block", width: "100%" }}>
                                        <div className="label" style={{ display: "inline-block", fontWeight: 700, width:"100%" }}>
                                            {props.sqlBuilderStyle === 1 ? "THEN set " + props.name + " equal to  " : "THEN "}
                                                {props.sqlBuilderStyle === 2 ? 
                                            <DropDownList 
                                                name="equals"
                                                data={['INCLUDE', 'EXCLUDE']}
                                                onChange={props.handleDetailChange(idx, null)}
                                                style={{paddingRight: "5px"}}
                                                value={group.equals}
                                                disabled={props.viewOnly}
                                            /> 
                                            : <Input name="equals" value={group.equals} onChange={props.handleDetailChange(idx)} disabled={props.viewOnly}/>}
                                            {props.sqlBuilderStyle === 2 ? "this record." : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default LogicGroup;