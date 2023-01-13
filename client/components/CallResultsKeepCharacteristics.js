import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox } from './';
import KeepCharacteristics from './KeepCharacteristics';
import { FormattedMessage } from 'react-intl';

//Call Results Keep Characteristics
//This Grid will be populated with sample data provided and use field names to obtain data.
export default class CallResultsKeepCharacteristics extends React.PureComponent {
    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
    }

    goBack() {
        this.props.history.goBack();
    }

    navHistory = [{ url: "/Home", label: "Home" }, { url: "/CallResultsHome", label: "Call Results" }]

    render() {
        const headerButtons =
            <div className="actions">
                <Button onClick={this.goBack}>
                    <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
                </Button>
            </div>

        return (
            <div>
                <ContentBox titleId="keepChars.callResults" divId="crKeepChars" navHistory={this.navHistory} footerButtons={headerButtons}>
                    <KeepCharacteristics 
                        page="callResult" 
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