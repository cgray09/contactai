import React from 'react';
import { Input } from '@progress/kendo-react-inputs';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import { Error } from "@progress/kendo-react-labels";
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;


class GridAddColumn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: ""
        }
    }

    handleChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        this.setState({[name] : value}, () => {
            //validate input if submitted with errors to see dynamically remove errors and user fixes them
            if(this.state.submitted){
                this.validate();
            }
        });
    }

    validate = () => {
        //TO-DO: Add validation
        return true;    
    }
    
    submit = () => {
        let columnSlot = this.props.getAvailableColumnSlot();
        this.props.submitColumn(this.state.name, columnSlot, 100, false);
        this.reset();
    }

    reset = () => {
        this.setState({ name : ""});
        this.props.toggleModal("displayAddColumn", false);
    }

    

    render() {

        const footerButtons =
            <div className="actions">
                <Button onClick={this.reset}>
                    <FormattedMessage id="action.cancel" defaultMessage="Cancel" />
                </Button>
                {!this.props.maxReached ? <Button primary={true} onClick={this.submit}>
                    <FormattedMessage id="action.ok" defaultMessage="Ok" />
                </Button> : null }
            </div>

        return (
            <ModalStateDisplay
                titleId="grid.addUpperBoundCol"
                divId="gridAddColumn"
                footerButtons={footerButtons}
                isOpen={this.props.displayAddColumn}
            >
                <Error>{this.state.error}</Error>
                {this.props.maxReached ? 
                    <Error style={{marginLeft: "20px"}}><FormattedMessage id="scorecards.maxNumOfColsReached" defaultMessage="Maximum number of columns has been reached" /></Error> : null}
                {!this.props.maxReached ? <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="grid.name" defaultMessage="Name" />
                    </label>
                    <div className="content">
                        <Input 
                            name="name" 
                            value={this.state.name} 
                            maxLength="50" 
                            onChange={this.handleChange} 
                            style={{ width: '200px' }} 
                            disabled={this.props.maxReached}/>
                    </div>
                </div> : null }
            </ModalStateDisplay>
        );
    }
};


export default GridAddColumn;