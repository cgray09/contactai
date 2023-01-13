import React from 'react';
import { GridCell } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';

//Buttons for Grids

export default class CommandCell extends GridCell {
    buttonClick = (e, command) => {
        this.props.onChange({ dataItem: this.props.dataItem, e, field: this.props.field, value: command });
    }

    render() {
        if (this.props.rowType !== "data") {
            return null;
        }

        if (this.props.dataItem[this.props.field]) {
            return (
                <td>
                    <Button
                        className="k-button k-grid-save-command"
                        onClick={(e) => this.buttonClick(e, false)}
                    > Close
                    </Button>
                </td>
            );
        }

        return (
            <td>
                <Button
                    className="k-primary k-button k-grid-edit-command"
                    onClick={(e) => this.buttonClick(e, true)}
                > Edit
                </Button>
                <Button
                    className="k-button k-grid-remove-command"
                    // onClick={
                    //     (e) => confirm('Confirm deleting: ' + this.props.dataItem.ProductName)
                    //         && this.buttonClick(e, 'delete')
                    // }
                > Remove
                </Button>
            </td>
        );
    }
}