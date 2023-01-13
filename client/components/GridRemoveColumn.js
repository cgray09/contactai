import React from 'react';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Error } from "@progress/kendo-react-labels";
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';


class GridRemoveColumn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedCol: null
        }
    }

    reset = () => {
        this.setState({ selectedCol: null });
    }

    handleChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        this.setState({ [name]: value });
    }

    submit = () => {
        let column = this.state.selectedCol;
        this.props.submitColumn(column.name, column.field.replace("refName", "REF_NAME_"), null, true);
        this.reset();
    }

    reset = () => {
        this.setState({ selectedCol: null });
        this.props.toggleModal("displayRemoveColumn", false);
    }

    footerButtons =
        <div className="actions">
            <Button onClick={this.reset}>
                <FormattedMessage id="action.cancel" defaultMessage="Cancel" />
            </Button>
            <Button primary={true} onClick={this.submit}>
                <FormattedMessage id="action.ok" defaultMessage="Ok" />
            </Button>
        </div>

    render() {
        return (
            <ModalStateDisplay
                titleId="grid.removeUpperBoundCol"
                divId="gridRemoveColumn"
                footerButtons={this.footerButtons}
                isOpen={this.props.displayAddColumn}
            >
                <Error>{this.state.error}</Error>
                <div className="contentBoxRow">
                    <label style={{padding: "10px", fontWeight: "bold"}}>
                        <FormattedMessage id="grid.selectColToRemove" defaultMessage="Select Column to Remove" />
                    </label>
                </div>
                <div className="contentBoxRow">
                    <div className="content">
                        <DropDownList
                            name="selectedCol"
                            data={this.props.columns} //TO-DO: Update
                            textField="title"
                            dataItemKey="field"
                            style={{width: "250px"}}
                            value={this.state.selectedCol}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </ModalStateDisplay >
        );
    }
};


export default GridRemoveColumn;