import React from 'react';
import { Form, Field } from '@progress/kendo-react-form';
import { Input } from '@progress/kendo-react-inputs';
import { FormattedMessage } from 'react-intl';

//scripts databases tab

const ScriptsDatabase = (props) => {
    const handleSubmit = (dataItem) => {
        alert(JSON.stringify(dataItem, null, 2))
    }; 

    return (
        <div className="k-edit-form-container">
            <div>
                <Form
                    onSubmit={handleSubmit}
                    render={(formRenderProps) => (
                        <form onSubmit={formRenderProps.onSubmit} className="k-form-inline">
                            <fieldset>
                                <legend><FormattedMessage id="scripts.database" defaultMessage="Database"/></legend>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.databaseName" defaultMessage="Database Name"/>:</span>
                                    <Field name={'databaseName'} value={props.environment.databaseName} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                                <label className="k-form-field">
                                    <span><FormattedMessage id="scripts.contactAIUserAcct" defaultMessage="CallTech User Account"/>:</span>
                                    <Field name={'ctUserAccount'} value={props.environment.ctUserAccount} onChange={props.handleChange} component={Input} disabled={props.viewOnly} />
                                </label>
                            </fieldset>
                        </form>
                    )}
                />
            </div>
        </div>
    )
};
export default ScriptsDatabase;