import React from "react";
import { ContentBox, Footer } from './';
import { Button } from '@progress/kendo-react-buttons';
import { FormattedMessage } from 'react-intl';



const Contents = (props) => {

    const backButton = () => {
        props.history.goBack();
    }
    const headerButtons =
        <div className="actions">
            <Button className="button actions" onClick={() => backButton()}>
            <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
            </Button>
        </div>

    return (
        <div>
            <ContentBox titleString="Contents" divId="home" headerButtons={headerButtons}>
                <p>Resources on how to use Contact AI. </p>
            </ContentBox>
            {props.footer}
        </div>
    );
};
export default Contents;