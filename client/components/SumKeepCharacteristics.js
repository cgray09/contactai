import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox } from './';
import KeepCharacteristics from './KeepCharacteristics';
import { FormattedMessage } from 'react-intl';



export default class SumKeepCharacteristics extends React.PureComponent {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
    }

    goBack() {
        this.props.history.goBack();
    }

    navHistory = [{ url: "/Home", label: "Home" }, { url: "/SummarizationHome", label: "Summarization" }]

    render() {
        const footerButtons =
            <div className="actions">
                <Button onClick={this.goBack}>
                    <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
                </Button>
            </div>

        return (
            <div>
                <ContentBox titleId="keepChars.summarization" divId="keepCharacteristics" navHistory={this.navHistory} footerButtons={footerButtons}>
                    <KeepCharacteristics 
                        page="summarization" 
                        dataDictURI="keepcharsdata/"
                        getLocalizedString={this.props.getLocalizedString}
                        viewOnly={this.props.viewOnly}
                        history={this.props.history}
                    />
                </ContentBox>
                {this.props.footer}
            </div>
        );
    }
}