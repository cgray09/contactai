import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import ModalStateDisplay from '../commonsweb/js/ModalTemplate/ModalStateDisplay';
import LogicBuilder from './LogicBuilder/LogicBuilder';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';
import axios from "axios";
import DiscretizeBuilder from './LogicBuilder/DiscretizeBuilder';
axios.defaults.withCredentials = true;

const SQLBuilderModal = (props) => {

    const getHeaderButtons = () => {
        return null;
        //TO-DO: Implement
    }

    const getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={() => props.toggleModal("displaySQL")}>
                {props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
            {props.viewOnly ? null : <Button primary={true} onClick={props.sqlBuilderStyle === 3 ? props.submitDiscretize : props.submitSQL}>
                <FormattedMessage id="action.submit" defaultMessage="Submit" />
            </Button>}
        </div>
    }

    const getFuncWrappedCharStr = () => {
        return ""; //TO-DO: Update to wrap characteristic in stripwhitspace, mod or substr function if applicable
    }

    return (
        <ModalStateDisplay
            titleString="SQL Builder"
            divId="sqlBuilderModal"
            headerButtons={getHeaderButtons()}
            footerButtons={getFooterButtons()}
            isOpen={props.displaySQL}
        >
            <ErrorGroup errorMessages={props.sqlResponseErrors} />
            {props.sqlBuilderStyle === 3 ?
                <DiscretizeBuilder
                    {...props}
                    getFuncWrappedCharStr={getFuncWrappedCharStr}
                    sqlSubmitted={props.sqlSubmitted}
                    deleteConfDivId="deleteSqlBuilderConf"
                    deleteConfTitleId="action.confirm"
                />
                :
                <LogicBuilder
                    {...props}
                    sqlBuilderStyle={props.sqlBuilderStyle}
                    getFuncWrappedCharStr={getFuncWrappedCharStr}
                    sqlSubmitted={props.sqlSubmitted}
                    deleteConfDivId="deleteSqlBuilderConf"
                    deleteConfTitleId="action.confirm"
                />
            }
        </ModalStateDisplay>
    );
}

export default injectIntl(SQLBuilderModal);