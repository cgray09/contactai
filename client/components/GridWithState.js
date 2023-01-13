import React from 'react';
import { GridColumn, Grid, GridToolbar } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import CommandCell from './CommandCell.js';
import { Button } from '@progress/kendo-react-buttons';

//Handles grid state. This may need to be modified to get global state to work with dialers and each component
//This handles the state of the grid itself though so probably not.

//If you decide to go a different direction rather than use context api, you may want to create state for each individual grid rather than handle via this component.

export default class GridWithState extends React.Component {
    constructor(props) {
        super(props);
        const data = JSON.parse(JSON.stringify(this.props.data));

        const dataState = props.pageable ? { skip: 0, take: this.props.pageSize } : { skip: 0 };
        this.state = {
            dataState: dataState,
            result: process(data, dataState),
            allData: data
        };
    }

    render() {
        return (
            <Grid
                editField="_command"
                expandField="_expanded"
                {...this.props}
                {...this.state.dataState}
                {...this.state.result}

                onItemChange={this.itemChange}
                onExpandChange={this.expandChange}
                onDataStateChange={this.onDataStateChange}
            >
                <GridToolbar>
                    <Button
                        title="Add new"
                        className="k-button k-primary"
                        onClick={this.addNew}
                    >Add new
                </Button>
                </GridToolbar>

                {this.props.children}

                <GridColumn
                    groupable={false}
                    sortable={false}
                    filterable={false}
                    resizable={false}
                    field="_command"
                    title=" "
                    width="140px"
                    cell={CommandCell}
                />
            </Grid>
        );
    }

    addNew = () => {
        const data = this.state.allData;
        data.unshift({ "_command": true });
        this.setState({
            dataState: { ...this.state.dataState, skip: 0 },
            result: process(data, { ...this.state.dataState, skip: 0 })
        });
    };

    expandChange = (event) => {
        event.dataItem[event.target.props.expandField] = event.value;
        this.forceUpdate();
    };

    itemChange = (event) => {
        const data = this.state.allData;
        if (event.field === "_command" && event.value === 'delete') {
            data.splice(data.findIndex(d => d === event.dataItem), 1);
        } else {
            event.dataItem[event.field] = event.value;
        }
        this.setState({
            result: process(data, this.state.dataState)
        });
    };

    onDataStateChange = (e) => {
        this.setState({
            dataState: e.data,
            result: process(this.state.allData, e.data)
        });
    };
}