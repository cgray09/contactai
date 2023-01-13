import React from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox } from './';
import KeepCharacteristics from './KeepCharacteristics';
import { FormattedMessage } from 'react-intl';


//Keep Characteristics Assignments

export default class AssignKeepCharacteristics extends React.PureComponent {
    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
    }

    goBack() {
        this.props.history.goBack();
    }

    navHistory = [{ url: "/Home", label: "Home" }, { url: "/AssignmentHome", label: "Assignment" }]

    render() {
        const footerButtons =
            <div className="actions">
                <Button onClick={this.goBack}>
                    <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
                </Button>
            </div>

        return (
            <div>
                <ContentBox titleId="keepChars.assignment" divId="home" navHistory={this.navHistory} footerButtons={footerButtons}>
                    <KeepCharacteristics 
                        page="assignment" 
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


/*
import React from 'react';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';

import { sampleCharacteristics }  from './sample-characteristics.js';
import { MyCommandCell } from './myCommandCell.js';
import { DropDownCell } from './myDropDownCell.js';
import { Button } from '@progress/kendo-react-buttons';
import { ContentBox, Footer } from './';

export default class KeepCharacteristicsGrid extends React.Component {
    editField = "inEdit";
    CommandCell;

    state = {
        data: [...sampleCharacteristics]
    };

    constructor(props) {
        super(props);

        this.CommandCell = MyCommandCell({
            edit: this.enterEdit,
            remove: this.remove,

            add: this.add,
            discard: this.discard,

            update: this.update,
            cancel: this.cancel,

            editField: this.editField
        });
    }

    enterEdit = (dataItem) => {
        this.setState({
            data: this.state.data.map(item =>
                item.ProductID === dataItem.ProductID ?
                    { ...item, inEdit: true } : item
            )
        });
    }

    remove = (dataItem) => {
        const data = [...this.state.data];
        this.removeItem(data, dataItem);
        this.removeItem(sampleCharacteristics, dataItem);

        this.setState({ data });
    }

    add = (dataItem) => {
        dataItem.inEdit = undefined;
        dataItem.ProductID = this.generateId(sampleCharacteristics);

        sampleCharacteristics.unshift(dataItem);
        this.setState({
            data: [...this.state.data]
        });
    }

    discard = (dataItem) => {
        const data = [...this.state.data];
        this.removeItem(data, dataItem);

        this.setState({ data });
    }

    update = (dataItem) => {
        const data = [...this.state.data];
        const updatedItem = { ...dataItem, inEdit: undefined };

        this.updateItem(data, updatedItem);
        this.updateItem(sampleCharacteristics, updatedItem);

        this.setState({ data });
    }

    cancel = (dataItem) => {
        const originalItem = sampleCharacteristics.find(p => p.ProductID === dataItem.ProductID);
        const data = this.state.data.map(item => item.ProductID === originalItem.ProductID ? originalItem : item);

        this.setState({ data });
    }

    updateItem = (data, item) => {
        let index = data.findIndex(p => p === item || (item.ProductID && p.ProductID === item.ProductID));
        if (index >= 0) {
            data[index] = { ...item };
        }
    }

    itemChange = (event) => {
        const data = this.state.data.map(item =>
            item.ProductID === event.dataItem.ProductID ?
                { ...item, [event.field]: event.value } : item
        );

        this.setState({ data });
    }

    addNew = () => {
        const newDataItem = { inEdit: true, Discontinued: false };

        this.setState({
            data: [newDataItem, ...this.state.data]
        });
    }

    cancelCurrentChanges = () => {
        this.setState({ data: [...sampleCharacteristics] });
    }

    render() {
        const { data } = this.state;
        const hasEditedItem = data.some(p => p.inEdit);
        const footerButtons =
            <div className="actions">
                <Button type={'cancel'}>
                    Cancel
                </Button>
                <Button primary={true} type={'commit'}>
                    Commit
                </Button>
            </div>
        return (
            <div>
                <ContentBox titleString="Keep Characteristics" divId="keepCharacteristics" footerButtons={footerButtons}>
                    <Grid
                        style={{ height: '420px' }}
                        data={data}
                        onItemChange={this.itemChange}
                        editField={this.editField}
                    >
                        <GridToolbar>
                            <Button
                                title="Add new"
                                className="k-button k-primary"
                                onClick={this.addNew}
                            >
                                Add new
                            </Button>
                            {hasEditedItem && (
                                <Button
                                    title="Cancel current changes"
                                    className="k-button"
                                    onClick={this.cancelCurrentChanges}
                                >
                                    Cancel current changes
                                </Button>
                            )}
                        </GridToolbar>
                        <Column field="CharacteristicName" title="Characteristic Name" editor="string" />
                        <Column field="Width" title="Width" editor="numeric" />
                        <Column field="CharType" title="Char Type" cell={DropDownCell} />
                        <Column field="Description" title="Description" width="250px" editor="string" />
                        <Column cell={this.CommandCell} width="140px" />
                    </Grid>
                </ContentBox>
            </div>
        );
    }

    generateId = data => data.reduce((acc, current) => Math.max(acc, current.ProductID), 0) + 1;

    removeItem(data, item) {
        let index = data.findIndex(p => p === item || item.ProductID && p.ProductID === item.ProductID);
        if (index >= 0) {
            data.splice(index, 1);
        }
    }
}
*/