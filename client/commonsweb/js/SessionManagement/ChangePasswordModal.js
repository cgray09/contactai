import React from 'react';
import { Input } from '@progress/kendo-react-inputs';
import ModalStateDisplay from '../ModalTemplate/ModalStateDisplay';
import InlineError from '../ErrorHandling/InlineError'
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';


/*  
 Requirements - must pass in following function as a prop
	- changePWEvent() : event handler for change password action

*/

class ChangePasswordModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            changePWModel: {},
            error: null,
            submitted: false
        }
    }

    reset = () => {
        this.setState({
            changePWModel: {username: '', password: '', newPassword: '', newPasswordConfirm: ''},
            error: null,
            submitted: false
        });
    }

    handleChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        this.setState(prevState => ({
            changePWModel: {
                ...prevState.changePWModel,
                [name]: value
            }
        }), () => {
            //validate input if submitted with errors to see dynamically remove errors and user fixes them
            if(this.state.submitted){
                this.validate();
            }
        })
    }

    validate = () => {
        let pwModel = this.state.changePWModel;
        let error = null;
        if(!this.allFieldsPopulated(pwModel)){
            error = <FormattedMessage id="error.missingChangePWFields" defaultMessage="Missing 1 or more input fields for pasword reset" />;
        }
        else if(!this.passwordsMatch(pwModel.newPassword, pwModel.newPasswordConfirm)){
            error = <FormattedMessage id="error.passwordsDoNotMatch" defaultMessage="New Password and Confirm Password do not match" />;
        }
        else if(pwModel.newPassword && pwModel.newPassword.length < 8 ){
            error = <FormattedMessage id="error.passwordTooShort" defaultMessage="New password must be at least 8 characters long" />
        }
        // else if(!this.meetsPasswordRequirements(pwModel.newPassword)){
        //     error = <div> <FormattedMessage id="error.mustFitUnderThreeCategories" defaultMessage="Password must contain a character which fits into at least 3 of the following categories:" />
        //     <ul style={{listStyle: "none", paddingLeft: "5px"}}> 
        //     <li>- <FormattedMessage id="error.lowerCaseRequired" defaultMessage="A lower case letter (a-z)" /></li>
        //     <li>- <FormattedMessage id="error.upperCaseRequired" defaultMessage="An upper case letter (A-Z)" /></li>
        //     <li>- <FormattedMessage id="error.symbolRequired" defaultMessage="A symbol" /></li>
        //   </ul>
        //   </div>
        // }
        this.setState({ error });
        return error === null;
    }

    allFieldsPopulated = (pwModel) => {
        return pwModel.username && pwModel.password && pwModel.newPassword && pwModel.newPasswordConfirm; 
    }

    passwordsMatch = (newPassword, newPasswordConfirm) => {
        return newPassword === newPasswordConfirm;
    }

    //must meet 3 of 4 critera
    // meetsPasswordRequirements = (password) => {
    //     let count = 0;
    //     if(/^(?=.*[a-z])/.test(password)){
    //         count++;
    //     }
    //     if(/^(?=.*[A-Z])/.test(password)){
    //         count++
    //     }
    //     if(/^(?=.*\d)/.test(password)){
    //         count++
    //     }
    //     if(/^(?=.*\W)/.test(password)){
    //         count++
    //     }
    //     return count >= 3;
    // }

    toggleModal = (open) => {
        if(!open) this.reset();
        this.props.toggleModal(open);
    }
    
    submit = () => {
        let changePWModel = this.state.changePWModel;
        changePWModel.username = this.props.userName;
        this.setState({ submitted: true, changePWModel }, () => {
            if(this.validate()){
                this.toggleModal(!this.props.displayChangePW);
                this.props.changePWEvent(this.state.changePWModel);
            }
        });
    }

    footerButtons =
        <div className="actions">
            <Button onClick={() => this.toggleModal(!this.props.displayChangePW)}>
                <FormattedMessage id="action.cancel" defaultMessage="Cancel" />
            </Button>
            <Button primary={true} onClick={this.submit}>
                <FormattedMessage id="action.ok" defaultMessage="Ok" />
            </Button>
        </div>

    render() {
        return (
            <ModalStateDisplay
                titleId="changePWModal.title"
                divId="changePWModal"
                footerButtons={this.footerButtons}
                isOpen={this.props.displayChangePW}
            >
                <InlineError errorMessage={this.state.error} />
                {/* <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="changePWModal.username" defaultMessage="Username" />
                    </label>
                    <div className="content">
                        <Input name="username" value={this.state.changePWModel.username} onChange={this.handleChange} style={{ width: '200px' }} autoComplete="off"/>
                    </div>
                </div> */}
                <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="changePWModal.currentPassword" defaultMessage="Current Password" />
                    </label>
                    <div className="content">
                        <Input name="password" value={this.state.changePWModel.password} type="password" onChange={this.handleChange} style={{ width: '200px' }} autoComplete="off"/>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="changePWModal.newPassword" defaultMessage="New Password" />
                    </label>
                    <div className="content">
                        <Input name="newPassword" maxLength={20} value={this.state.changePWModel.newPassword} type="password" onChange={this.handleChange} style={{ width: '200px' }} autoComplete="off"/>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="changePWModal.confirmPassword" defaultMessage="Confirm New Password" />
                    </label>
                    <div className="content">
                        <Input name="newPasswordConfirm" maxLength={20} value={this.state.changePWModel.newPasswordConfirm} type="password" onChange={this.handleChange} style={{ width: '200px' }} autoComplete="off"/>
                    </div>
                </div>
            </ModalStateDisplay>
        );
    }
};


export default ChangePasswordModal;