import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import GridForm from '../commonsweb/js/Grid/GridForm';
import { Form } from '@progress/kendo-react-form';
import { Checkbox } from '@progress/kendo-react-inputs';
import { FormattedMessage } from 'react-intl'
import { DatePicker } from '@progress/kendo-react-dateinputs';
import axios from "axios";
axios.defaults.withCredentials = true;

const DialerConfigRec = (props) => {

    //Using react hooks instead of class base component
    const [recycle, setRecycle] = useState('');
    const [commonRecycle, setCommonRecyle] = useState('');

    const columns = [
        { title: 'Date', field: 'recycleOn', filter: 'text', show: true },
        //{ title: 'Description', field: 'description', filter: 'text', show: true }
    ]

    const thisDialersToolBar =
        <div className="actions">
            <span style={{ padding: "10px" }}><DatePicker name="selectedThisDialer" width="300px" onChange={(e) => setRecycle(e.target.value)} /></span>
            <Button onClick={() => props.handleDateAdd("dialerRecycleDays", recycle)} disabled={!recycle}><FormattedMessage id="action.add" defaultMessage="Add" /></Button>
        </div>

    const allDialersToolBar =
        <div className="actions">
            <span style={{ padding: "10px" }}><DatePicker name="selectedAllDialers" width="300px" onChange={(e) => setCommonRecyle(e.target.value)} /></span>
            <Button onClick={() => props.handleDateAdd("commonRecycleDays", commonRecycle)} disabled={!commonRecycle}><FormattedMessage id="action.add" defaultMessage="Add" /></Button>
        </div>

const handleRecycleDelete = (selectedDate) => {
    props.handleDateDelete(selectedDate.recycleOn, "dialerRecycleDays", "recycleOn");
}

const handleCommonRecycleDelete = (selectedDate) => {
    props.handleDateDelete(selectedDate.recycleOn, "commonRecycleDays", "recycleOn");
}

    const handleSubmit = (dataItem) => alert(JSON.stringify(dataItem, null, 2));
    return (
        <div>
            <div className="k-edit-form-container">
                <div>
                    <Form
                        onSubmit={handleSubmit}
                        render={(formRenderProps) => (
                            <form onSubmit={formRenderProps.onSubmit} className="k-form-inline">
                                <fieldset>
                                    <legend>
                                        <FormattedMessage id="dialer.byDayOfWeek" defaultMessage="By Day of Week" />
                                    </legend>
                                    <div className="contentBoxRow">
                                        <div className="content">
                                            <Checkbox name="monday" label={"Monday"} onChange={props.handleCheckBox} value={props.dialer.monday === 1} disabled={props.viewOnly}/>
                                            <span style={{ marginLeft: "20px" }}><Checkbox name="tuesday" label={"Tuesday"} onChange={props.handleCheckBox} value={props.dialer.tuesday === 1} disabled={props.viewOnly}/></span>
                                            <span style={{ marginLeft: "20px" }}><Checkbox name="wednesday" label={"Wednesday"} onChange={props.handleCheckBox} value={props.dialer.wednesday === 1} disabled={props.viewOnly}/></span>
                                            <span style={{ marginLeft: "20px" }}><Checkbox name="thursday" label={"Thursday"} onChange={props.handleCheckBox} value={props.dialer.thursday === 1} disabled={props.viewOnly}/></span>
                                            <span style={{ marginLeft: "20px" }}><Checkbox name="friday" label={"Friday"} onChange={props.handleCheckBox} value={props.dialer.friday === 1} disabled={props.viewOnly}/></span>
                                            <span style={{ marginLeft: "20px" }}><Checkbox name="saturday" label={"Saturday"} onChange={props.handleCheckBox} value={props.dialer.saturday === 1} disabled={props.viewOnly}/></span>
                                            <span style={{ marginLeft: "20px" }}><Checkbox name="sunday" label={"Sunday"} onChange={props.handleCheckBox} value={props.dialer.sunday === 1} disabled={props.viewOnly}/></span>
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset>
                                    <legend>
                                        <FormattedMessage id="dialer.byDateThisDialerOnly" defaultMessage="By Date (This Dialer Only)" />
                                    </legend>
                                    <div className="contentBoxRow">
                                        <div className="content">
                                            <GridForm
                                                data={props.dialer.dialerRecycleDays || []}
                                                columns={columns}
                                                delete={handleRecycleDelete}
                                                hideCopy={true}
                                                hideEdit={true}
                                                viewOnly={props.viewOnly} //TO-DO make dynamic
                                                actionCompleted={true} //TO-DO make dynamic
                                                gridToolBarContent={thisDialersToolBar}
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
                                        <FormattedMessage id="dialer.byDateAllDialers" defaultMessage="By Date (All Dialers)" />
                                    </legend>
                                    <div className="contentBoxRow">
                                        <div className="content">
                                            <GridForm
                                                data={props.dialer.commonRecycleDays || []}
                                                columns={columns}
                                                delete={handleCommonRecycleDelete}
                                                hideCopy={true}
                                                hideEdit={true}
                                                viewOnly={props.viewOnly} //TO-DO make dynamic
                                                actionCompleted={true} 
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

export default DialerConfigRec;