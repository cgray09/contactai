import React from 'react';
import { GridColumnMenuSort, 
    GridColumnMenuFilter, 
    GridColumnMenuItemGroup, 
    GridColumnMenuItem, 
    GridColumnMenuItemContent } from '@progress/kendo-react-grid';

class ColumnMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: this.props.columns,
            columnsExpanded: false,
            filterExpanded: false
        };
    }

    onToggleColumn = (id) => {
        this.setState({
            columns: this.state.columns.map((column, idx) => {
                return idx === id ? { ...column, show: !column.show } : column;
            })
        });
    }

    onReset = (event) => {
        event.preventDefault();
        const allColumns = this.props.columns.map(col => {
            return {
                ...col,
                show: true
            };
        });

        this.setState({ columns: allColumns }, () => this.onSubmit());
    }

    onSubmit = (event) => {
        if (event) {
            event.preventDefault();
        }
        this.props.onColumnsSubmit(this.state.columns);
        if (this.props.onCloseMenu) {
            this.props.onCloseMenu();
        }
    }

    onMenuItemClick = () => {
        const value = !this.state.columnsExpanded;
        this.setState({
            columnsExpanded: value,
            filterExpanded: value ? false : this.state.filterExpanded
        });
    }

    onFilterExpandChange = (value) => {
        this.setState({
            filterExpanded: value,
            columnsExpanded: value ? false : this.state.columnsExpanded
        });
    }

    render() {
        const oneVisibleColumn = this.state.columns.filter(c => c.show).length === 1;

        return (
            <div>
                <GridColumnMenuSort {...this.props} />
                <GridColumnMenuFilter
                    {...this.props}
                    onExpandChange={this.onFilterExpandChange}
                    expanded={this.state.filterExpanded}
                />
                <GridColumnMenuItemGroup>
                    <GridColumnMenuItem
                        title={'Columns'}
                        iconClass={'k-i-columns'}
                        onClick={this.onMenuItemClick}
                    />
                    <GridColumnMenuItemContent show={this.state.columnsExpanded}>
                        <div className={'k-column-list-wrapper'}>
                            <form onSubmit={this.onSubmit} onReset={this.onReset}>
                                <div className={'k-column-list'}>
                                    {this.state.columns.map((column, idx) =>
                                        (
                                            <div key={idx} className={'k-column-list-item'}>
                                                <span>
                                                    <input
                                                        id={`column-visiblity-show-${idx}`}
                                                        className="k-checkbox"
                                                        type="checkbox"
                                                        readOnly={true}
                                                        disabled={column.show && oneVisibleColumn}
                                                        checked={column.show}
                                                        onClick={() => { this.onToggleColumn(idx); }}
                                                    />
                                                    <label
                                                        htmlFor={`column-visiblity-show-${idx}`}
                                                        className="k-checkbox-label"
                                                        style={{ userSelect: 'none' }}
                                                    >
                                                        {column.title}
                                                    </label>
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className={'k-columnmenu-actions'}>
                                    <button type={'reset'} className={'k-button'}>Reset</button>
                                    <button className={'k-button k-primary'}>Save</button>
                                </div>
                            </form>
                        </div>
                    </GridColumnMenuItemContent>
                </GridColumnMenuItemGroup>
            </div>
        );
    }
}

export default ColumnMenu;