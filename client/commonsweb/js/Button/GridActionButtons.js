import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { GridCell } from '@progress/kendo-react-grid';
import { FormattedMessage } from 'react-intl';

/* Requirements - must pass in following function as an argument
	- editEvent() : event handler for edit button
	- deleteEvent() : event handler for delete button
	
	Example of instantiating this component from another class component
		- GridActionButtons(this.myEditFunction, this.myDeleteFunction,)
	
	*NOTE* - this.props.dataItem represents the grid data row object. For example, if pressing edit button,
	*			the kendo ui grid automatically passes in the object bound to that particular grid row to the function you provide
*/

const GridActionButtons = (editEvent, deleteEvent) =>{
    return class extends GridCell {
        render() {
            return (
                <td>
                    <Button primary={true} onClick={() => { editEvent(this.props.dataItem); }}>
                        <FormattedMessage id="action.edit" defaultMessage="Edit"/>
                    </Button>
                    <Button onClick={() => {deleteEvent(this.props.dataItem);}}>
                        <FormattedMessage id="action.delete" defaultMessage="Delete"/>
                    </Button>
                </td>
            );
        }
    };
}

export default GridActionButtons;