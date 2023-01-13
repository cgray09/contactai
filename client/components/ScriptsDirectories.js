import React from 'react';
import { Form, Field } from '@progress/kendo-react-form';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { FormattedMessage } from 'react-intl';

//scripts directories tab

const ScriptsDirectories = (props) => {
    const handleSubmit = (dataItem) => alert(JSON.stringify(dataItem, null, 2));  //Temporary
    return (
        <div className="k-edit-form-container">
            <div>
                <Form
                    onSubmit={handleSubmit}
                    render={(formRenderProps) => (
                        <form onSubmit={formRenderProps.onSubmit} className="k-form-inline">
                            <fieldset>
                                <legend><FormattedMessage id="scripts.directories" defaultMessage="Directories"/></legend>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.activityDir" defaultMessage="Activity Directory"/>:</span>
                                    <Field name={'activityDir'} value={props.environment.activityDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.doneActivityDir" defaultMessage="Done Activity Directory"/>:</span>
                                    <Field name={'doneActivityDir'} value={props.environment.doneActivityDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.downloadDir" defaultMessage="Download Directory"/>:</span>
                                    <Field name={'downloadDir'} value={props.environment.downloadDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.doneDownloadDir" defaultMessage="Done Download Directory"/>:</span>
                                    <Field name={'doneDownloadDir'} value={props.environment.doneDownloadDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.secDownloadDir" defaultMessage="Secondary Download Directory"/>:</span>
                                    <Field name={'secondaryDownloadDir'} value={props.environment.secondaryDownloadDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.secDoneDownloadDir" defaultMessage="Secondary Done Download Directory"/>:</span>
                                    <Field name={'secondaryDoneDownloadDir'} value={props.environment.secondaryDoneDownloadDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.fotranDir" defaultMessage="FORTRAN Directory"/>:</span>
                                    <Field name={'fortranDir'} value={props.environment.fortranDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.scriptInstallDir" defaultMessage="Script Installation Directory"/>:</span>
                                    <Field name={'scriptInstallDir'} value={props.environment.scriptInstallDir} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                            </fieldset>
                        </form>
                    )}
                />
            </div>
        </div>
    );
};

export default ScriptsDirectories;


