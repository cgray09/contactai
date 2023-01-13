import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import GridForm from '../commonsweb/js/Grid/GridForm';
import { Form } from '@progress/kendo-react-form';
import { Input, Checkbox } from '@progress/kendo-react-inputs';
import { FormattedMessage } from 'react-intl'
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import axios from "axios";
axios.defaults.withCredentials = true;

const DialersConfigMisc = (props) => {

    const [badDay, setBadDay] = useState('');
    const [commonBadDay, setCommonBadDay] = useState('');

    const columns = [
        { title: 'Date', field: 'badDay', filter: 'text', show: true }
    ]

    const timezones = ['Atlantic', 'Eastern', 'Central', 'Mountain', 'Pacific', 'Alaska', 'Hawaii', 'Greenwich', 'Guam']

    const exclSCBuildingToolBar =
        <div className="actions">
            <span style={{ padding: "10px" }}><DatePicker name="badDaySelect" width="300px" onChange={(e) => setBadDay(e.target.value)} disabled={props.viewOnly}  /></span>
            <Button onClick={() => props.handleDateAdd("dialerBadDays", badDay)} disabled={!badDay || props.viewOnly}><FormattedMessage id="action.add" defaultMessage="Add" /></Button>
        </div>

    const allDialersToolBar =
        <div className="actions">
            <span style={{ padding: "10px" }}><DatePicker name="commonBadDaySelect" width="300px" onChange={(e) => setCommonBadDay(e.target.value)} disabled={props.viewOnly} /></span>
            <Button onClick={() => props.handleDateAdd("commonBadDays", commonBadDay)} disabled={!commonBadDay || props.viewOnly}><FormattedMessage id="action.add" defaultMessage="Add" /></Button>
        </div>

    const handleBadDayDelete = (selectedDate) => {
        props.handleDateDelete(selectedDate.badDay, "dialerBadDays", "badDay");
    }

    const handleCommonBadDayDelete = (selectedDate) => {
        props.handleDateDelete(selectedDate.badDay, "commonBadDays", "badDay");
    }

    // const handleSubmit = (dataItem) => alert(JSON.stringify(dataItem, null, 2));

    return (
        <div>
            <div className="k-edit-form-container">
                <div>
                    <Form
                        // onSubmit={handleSubmit}
                        render={(formRenderProps) => (
                            <form onSubmit={formRenderProps.onSubmit} className="k-form-inline">
                                <fieldset>
                                    <legend>
                                        <FormattedMessage id="dialer.description" defaultMessage="Description" />
                                    </legend>
                                    <div className="contentBoxRow">
                                        <label className="label">
                                            <FormattedMessage id="dialer.descripton" defaultMessage="Description" />
                                        </label>
                                        <div className="content">
                                            <Input name="description" value={props.dialer.description} onChange={props.handleChange} style={{ width: '350px' }} disabled={props.viewOnly} />
                                        </div>
                                    </div>
                                    <div className="contentBoxRow">
                                        <label className="label">
                                            <FormattedMessage id="dialer.daylightSavings" defaultMessage="Observe Daylight Savings" />
                                        </label>
                                        <div className="content">
                                            <Checkbox name="dst" onChange={props.handleCheckBox} value={props.dialer.dst === 1} disabled={props.viewOnly} />
                                        </div>
                                    </div>
                                    <div className="contentBoxRow">
                                        <label className="label">
                                            <FormattedMessage id="dialer.startTimeZone" defaultMessage="Start Time Zone" />
                                        </label>
                                        <div className="content">
                                            <DropDownList data={timezones} name="timezone" value={props.dialer.timezone} onChange={props.handleChange} style={{ width: '350px' }} disabled={props.viewOnly} />
                                        </div>
                                    </div>
                                    <div className="contentBoxRow">
                                        <label className="label">
                                            <FormattedMessage id="dialer.startCity" defaultMessage="Start City" />
                                        </label>
                                        <div className="content">
                                            <Input name="city" value={props.dialer.city} onChange={props.handleChange} style={{ width: '350px' }} disabled={props.viewOnly} />
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset>
                                    <legend>
                                        <FormattedMessage id="dialer.badDaysExclude" defaultMessage="Bad Days (Exclude from ScoreCard building)" />
                                    </legend>
                                    <div className="contentBoxRow">
                                        <div className="content">
                                            <GridForm
                                                data={props.dialer.dialerBadDays || []}
                                                columns={columns}
                                                delete={handleBadDayDelete}
                                                hideCopy={true}
                                                hideEdit={true}
                                                hideDelete={props.viewOnly}
                                                viewOnly={props.viewOnly} //TO-DO make dynamic
                                                actionCompleted={true} //TO-DO make dynamic
                                                gridToolBarContent={exclSCBuildingToolBar}
                                                enableInlineEdits={false}
                                                deleteConfDivId=""
                                                deleteConfTitleId=""
                                                deleteConfMessageId=""
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset>
                                    <legend>
                                        <FormattedMessage id="dialer.badDaysAllDialers" defaultMessage="Bad Days (All Dialers)" />
                                    </legend>
                                    <div className="contentBoxRow">
                                        <div className="content">
                                            <GridForm
                                                data={props.dialer.commonBadDays || []}
                                                columns={columns}
                                                delete={handleCommonBadDayDelete}
                                                hideCopy={true}
                                                hideEdit={true}
                                                hideDelete={props.viewOnly}
                                                viewOnly={props.viewOnly} //TO-DO make dynamic
                                                actionCompleted={true} //TO-DO make dynamic
                                                gridToolBarContent={allDialersToolBar}
                                                enableInlineEdits={false}
                                                deleteConfDivId=""
                                                deleteConfTitleId=""
                                                deleteConfMessageId=""
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            </form>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

export default DialersConfigMisc;