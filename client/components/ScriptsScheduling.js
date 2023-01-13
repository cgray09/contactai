import React from 'react';
import { Form, Field } from '@progress/kendo-react-form';
import { Checkbox } from '@progress/kendo-react-inputs';
import { TimePicker } from '@progress/kendo-react-dateinputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { FormattedMessage } from 'react-intl';

// scripts scheduling tab

const ScriptsScheduling = (props) => {
    const handleSubmit = (dataItem) => alert(JSON.stringify(dataItem, null, 2));    //temporary
    const scheduleFrequency = [ "Weekly", "Monthly" ];

    const convertToDate = (time) => {
        if(!time) return null;
        const vals = time.split(':');
        return new Date(1995, 0, 1, vals[0], vals[1]); //using random default date
    }

    return (
        <div className="k-edit-form-container">
            <div>
                <Form
                    onSubmit={handleSubmit}
                    render={(formRenderProps) => (
                        <form onSubmit={formRenderProps.onSubmit} className="k-form-inline">
                            <fieldset>
                                <legend><FormattedMessage id="scripts.schedule" defaultMessage="Schedule"/></legend>
                                <div className="k-form-field">
                                    <span><FormattedMessage id="scripts.preSummarization" defaultMessage="Pre-Summarization"/>:</span>
                                    <Field name={'runPreSummFlag'} component={Checkbox} onChange={props.handleCheckBox} value={props.environment.runPreSummFlag === 1} label={props.getLocalizedString("script.scheduleViaCronn")} disabled={props.viewOnly} />
                                    <Field name={'preSummStartTime'} component={TimePicker} onChange={props.handleTime} value={convertToDate(props.environment.preSummStartTime)} dlabel={'Start Time'} disabled={props.viewOnly} />
                                </div>

                                <div className="k-form-field">
                                    <span><FormattedMessage id="scripts.activityUpload" defaultMessage="Activity/Upload"/>:</span>
                                    <Field name={'runUploadFlag'} component={Checkbox} onChange={props.handleCheckBox} value={props.environment.runUploadFlag === 1} label={props.getLocalizedString("script.scheduleViaCronn")} disabled={props.viewOnly} />
                                    <Field name={'uploadStartTime'} component={TimePicker} onChange={props.handleTime} value={convertToDate(props.environment.uploadStartTime)} label={'Start Time'} disabled={props.viewOnly} />
                                </div>

                                <div className="k-form-field">
                                    <span><FormattedMessage id="scripts.reSummarization" defaultMessage="Re-Summarization"/>:</span>
                                    <Field name={'runReSummFlag'} component={Checkbox} onChange={props.handleCheckBox} value={props.environment.runReSummFlag === 1} label={props.getLocalizedString("script.scheduleViaCronn")} disabled={props.viewOnly} />
                                    <Field name={'reSummStartTime'} component={TimePicker} onChange={props.handleTime} value={convertToDate(props.environment.reSummStartTime)} label={'Start Time'} disabled={props.viewOnly} />
                                </div>

                                <div className="k-form-field">
                                    <span><FormattedMessage id="scripts.downloadProcessing" defaultMessage="Download Processing"/>:</span>
                                    <Field name={'runDownloadFlag'} component={Checkbox} onChange={props.handleCheckBox} value={props.environment.runDownloadFlag === 1} label={props.getLocalizedString("script.scheduleViaCronn")} disabled={props.viewOnly} />
                                    <Field name={'downloadStartTime'} component={TimePicker} onChange={props.handleTime} value={convertToDate(props.environment.downloadStartTime)} label={'Start Time'} disabled={props.viewOnly} />
                                </div>

                                <div className="k-form-field">
                                    <span><FormattedMessage id="scripts.scorecardGeneration" defaultMessage="Scorecard Generation"/>:</span>
                                    <Field name={'runScoreCardFlag'} component={Checkbox} onChange={props.handleCheckBox} value={props.environment.runScoreCardFlag === 1} label={props.getLocalizedString("script.scheduleViaCronn")} disabled={props.viewOnly} />
                                    <Field name={'scoreCardStartTime'} component={TimePicker} onChange={props.handleTime} value={convertToDate(props.environment.scoreCardStartTime)} label={'Start Time'} disabled={props.viewOnly} />
                                </div>

                                <fieldset>
                                    <legend><FormattedMessage id="scripts.scheduleFreq" defaultMessage="Schedule Frequency"/></legend>
                                    <label className="k-form-field">
                                        <span><FormattedMessage id="scripts.frequency" defaultMessage="Frequency"/>:</span>
                                        <Field name={'scheduleFreq'} component={DropDownList} onChange={props.handleChange} value={props.environment.scheduleFreq} data={scheduleFrequency} disabled={props.viewOnly} />
                                    </label>
                                </fieldset>
                            </fieldset>                            
                        </form>
                    )}
                />
            </div>
        </div>
    );
};


export default ScriptsScheduling;
