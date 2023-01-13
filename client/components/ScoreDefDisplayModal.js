import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox, Footer } from '.';
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';

const ScoreDefDisplayModal = (props) => {

   const getFooterButtons = () => {
        return <div className="actions">
            <Button onClick={() => props.toggleModal("displayDetails")}>
                {props.viewOnly ? <FormattedMessage id="action.close" defaultMessage="Close" /> : <FormattedMessage id="action.cancel" defaultMessage="Cancel" />}
            </Button>
        </div>
    }

    return (
        props.displayDetails && 
        <div id="scoreDefDisplayModal" className="modalStateManaged">
            <div className="noble-modal-content">
                <div className="MainContent Outer" style={{ minHeight: '503px' }}>
                    <div className="MainContent Inner">
                        <ContentBox
                            titleId="scorecards.defDetails"
                            titleString="Definition Details"
                            divId=""
                            footerButtons={getFooterButtons()}
                        >
                            <div className="modal-body" dangerouslySetInnerHTML={{__html: props.details}} />
                        </ContentBox>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default injectIntl(ScoreDefDisplayModal);