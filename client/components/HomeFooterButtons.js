import React from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';


export default class HomeFooterButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
        this.toggleDialog = this.toggleDialog.bind(this);
    }

    toggleDialog() {
        this.setState({
            visible: !this.state.visible
        });
    }

    render() {
        return (
            <div className="rightAlign">
                <Button className="k-button" onClick={this.toggleDialog}>Rollback</Button>
                {this.state.visible && <Dialog title={"Please confirm"} onClose={this.toggleDialog}>
                    <p style={{ margin: "25px", textAlign: "center" }}>Are you sure you want to continue? This will rollback all client side changes to database</p>
                    <DialogActionsBar>
                        <button className="k-button" onClick={this.toggleDialog}>No</button>
                        <button className="k-button" onClick={this.toggleDialog}>Yes</button>
                    </DialogActionsBar>
                </Dialog>}
                <Button primary={true} className="k-button" onClick={this.toggleDialog}>Commit All</Button>
                {this.state.visible && <Dialog title={"Please confirm"} onClose={this.toggleDialog}>
                    <p style={{ margin: "25px", textAlign: "center" }}>Are you sure you want to continue? This will commit all client side changes to database</p>
                    <DialogActionsBar>
                        <button className="k-button" onClick={this.toggleDialog}>No</button>
                        <button className="k-button" onClick={this.toggleDialog}>Yes</button> 
                    </DialogActionsBar>
                </Dialog>}
            </div>
        );
    }
}
