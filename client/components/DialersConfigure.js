import React from 'react';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import { Input } from '@progress/kendo-react-inputs';
import '@progress/kendo-react-intl';
import { DialersConfigMisc, DialersConfigRec } from './';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

const DialersConfigure = (props) => {

    const footerButtons =
        <div className="actions">
            <Button onClick={() => props.toggleModal("displayEditModal", false)}>
            {props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {props.viewOnly ? null : <Button primary={true} onClick={props.submit}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>

    return (
        <div>
            <ModalStateDisplay
                titleId="dialer.configureDialer"
                divId="dialerConfigure"
                footerButtons={footerButtons}
                isOpen={props.isOpen}
            >
                <ErrorGroup errorMessages={props.responseErrors} />
                <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="dialer.dialerName" defaultMessage="Dialer Name" />
                    </label>
                    <div className="content">
                        <Input name="name" value={props.dialer.name} onChange={props.handleChange} style={{ width: '350px' }} disabled={props.viewOnly} />
                    </div>
                </div>
                <TabStrip tabPosition={'top'} selected={props.selected} onSelect={props.handleSelect}>
                    <TabStripTab title="Misc">
                        <DialersConfigMisc
                            dialer={props.dialer}
                            handleChange={props.handleChange}
                            handleCheckBox={props.handleCheckBox}
                            handleDateAdd={props.handleDateAdd}
                            handleDateDelete={props.handleDateDelete}
                            viewOnly={props.viewOnly}
                        />
                    </TabStripTab>
                    <TabStripTab title="Recycling">
                        <DialersConfigRec
                            dialer={props.dialer}
                            handleChange={props.handleChange}
                            handleCheckBox={props.handleCheckBox}
                            handleDateAdd={props.handleDateAdd}
                            handleDateDelete={props.handleDateDelete}
                            viewOnly={props.viewOnly}
                        />
                    </TabStripTab>
                </TabStrip>
            </ModalStateDisplay>
            {props.footer}
        </div>
    )
}

export default DialersConfigure;