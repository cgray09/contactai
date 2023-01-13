import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Popup } from '@progress/kendo-react-popup';
import { injectIntl } from 'react-intl';

// This component acts as a pop up containing action buttons for when a user selects a row in a grid
// By default It will display Copy, Edit and Delete buttons. But these can be hidden by setting their respective hide boolean to true (hideCopy=true, hideEdit=true, hideDelete=true)
// If wanting add any additional buttons or custom buttons, they'll need to be passed in as a prop called 'additionalButtons'

// The following props are mandatory 
//     - anchor: This should be the row click events target object. Ex) event.nativeEvent.target. The Kendo pop up will use this to determine the pop up location
//     - show: This will determine whether to display or hide the pop up

// The following props are all optional to pass in
//     -hideCopy: Boolean value to determine whether to hide Copy Button
//     -hideEdit: Boolean value to determine whether to hide Copy Button
//     -hideDelete: Boolean value to determine whether to hide Copy Button
//     -additionalButtons: Any additional or custom buttons to render in GridActionPopup

const GridActionPopup = (props) => {

    const { intl } = props;

    return (
        <Popup
            anchor={props.anchor}
            show={props.show}
            className='gridActions'
            anchorAlign={{
                horizontal: 'right',
                vertical: 'bottom'
            }}
            popupAlign={{
                horizontal: 'right',
                vertical: 'top'
            }}
        >
            <div>
                <Button style={{ display: props.hideCopy ? "none" : "inline-block" }} onClick={props.copyEvent} disabled={props.viewOnly}>
                    {intl.formatMessage({ id: "action.copy" })}
                </Button>
                <Button style={{ display: props.hideEdit ? "none" : "inline-block" }} onClick={props.editEvent}>
                    {props.viewOnly ? intl.formatMessage({ id: "action.view" }) : intl.formatMessage({ id: "action.edit" })}
                </Button>
                <Button style={{ display: props.hideDelete ? "none" : "inline-block" }} onClick={props.deleteEvent} disabled={props.viewOnly}>
                    {intl.formatMessage({ id: "action.delete" })}
                </Button>
                {props.additionalButtons}
            </div>
        </Popup>
    );
};

export default injectIntl(GridActionPopup);