import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Checkbox, Input } from '@progress/kendo-react-inputs';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { ScriptsScheduling, ScriptsDirectories, ScriptsDatabase } from './';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup';
import InlineError from '../commonsweb/js/ErrorHandling/InlineError';
import { FormattedMessage } from 'react-intl';
import axios from "axios";
axios.defaults.withCredentials = true;

const ScriptsTabStrip = (props) => {

    let [selected, handleSelect] = useState(0);

    const getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={() => props.toggleModal("displayTabStrip", false)}>
                {props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {props.viewOnly ? null : <Button primary={true} onClick={props.submit}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    return (
        <div>
            <ModalStateDisplay
                titleId="script.schedAndEnvironment"
                divId="schedTabStrip"
                isOpen={props.isOpen}
                footerButtons={getFooterButtons()}
            >
                <ErrorGroup errorMessages={props.responseErrors} />
                <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="grid.name" defaultMessage="Name" />
                    </label>
                    <div className="content">
                        <Input name="name" value={props.environment.name} maxLength="50" onChange={props.handleChange} style={{ width: '300px' }} disabled={props.viewOnly}/>
                    </div>
                </div>
                <div className="contentBoxRow">
                    <label className="label">
                        <FormattedMessage id="script.activate" defaultMessage="Activate" />
                    </label>
                    <div className="content">
                        <Checkbox name="active" value={props.environment.active === 1} onChange={props.handleCheckBox} disabled={props.viewOnly} />
                    </div>
                </div>
                <TabStrip tabPosition={'top'} selected={selected} onSelect={(e) => handleSelect(e.selected)}>
                    <TabStripTab title={props.getLocalizedString("scripts.scheduling")}>
                        <ScriptsScheduling
                            environment={props.environment}
                            getLocalizedString={props.getLocalizedString}
                            handleChange={props.handleChange}
                            handleCheckBox={props.handleCheckBox}
                            handleTime={props.handleTime} 
                            viewOnly={props.viewOnly}/>
                    </TabStripTab>
                    <TabStripTab title="Directories">
                        <ScriptsDirectories
                            environment={props.environment}
                            handleChange={props.handleChange} 
                            viewOnly={props.viewOnly} />
                    </TabStripTab>
                    <TabStripTab title="Database">
                        <ScriptsDatabase
                            environment={props.environment}
                            handleChange={props.handleChange} 
                            viewOnly={props.viewOnly} />
                    </TabStripTab>
                </TabStrip>
            </ModalStateDisplay>
        </div>
    );
};

export default ScriptsTabStrip;