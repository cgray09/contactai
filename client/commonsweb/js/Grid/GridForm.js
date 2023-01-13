import React from 'react';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import GridActionPopup from '../Button/GridActionPopup';
import DeleteConfirmationModal from '../NotificationModals/DeleteConfirmationModal';
import ColumnMenu from './ColumnMenu';
import { injectIntl } from 'react-intl';
import { process } from '@progress/kendo-data-query';
import { Button } from '@progress/kendo-react-buttons';
import HeaderTooltip from './HeaderTooltip';
import GridLoadingIndicator from '../LoadingIndicator/GridLoadingIndicator';
import axios from "axios";
axios.defaults.withCredentials = true;

/* 
    - This component is a generic Grid created based on the Kendo Grid
    - It is basically an out of the box grid which has already incorporated filtering, sorting, searching, pagination and other items to meet
      nobles web ui grid standards
    - Also implements "Grid Action Buttons", which displays a button pallet with options to "Copy", "Edit" or "Delete" each row. The event handlers for each will need to be supplied as props
    - By using this component, it will help speed the development of grid's by using the standard features required by multiple applications.
    
    Pass in the following as props
      - data: This will be the data source to provide the grid
      - columns: This will be an array of objects representing each column. It will need to have the name, title and filter fields defined
                  - name will be the name of the field in the datasource in which to map the column to
                  - title will be the label to display in the column header
                  - filter will be set to either 'text', 'numeric' or 'boolean'. It determines the filter search bar type used for that column
      - copyItem: function which makes request to server to clone the selected item. The selected item will be provided to copyItem as an argument
      - getItem: function which will retrieve the latest item from the server for the selected row. The selected item will be provided to getItem as an argument
      - delete: function which will make call to server to delete the selected item
      - getAdditionalButtons - *Optional* If providing additional buttons to display in the grid button action group, pass in a getAdditionalButtons function which will build an array of any additional buttons,
                               as well as, sets each buttons event handler. This component will automatically supply the selected item as an argument to getAdditionalButtons, so user can have access to it
      - toolBarContent - *Optional* Unless user enables "inline editing", by default there is no content within the grid tool bar. If wanting to add custom content, simply pass it in as a prop and it will get rendered
      - hideGridActions: If not wanting to display grid actions when selecting the form, set this value to true
      - deleteConfDivId: If wanting to display a delete confirmation message before allowing user to delete, then a unique deleteConfDivId will need to be . Otherwise, no confirmation modal will be provided
      - deleteConfTitleId: Id of the delete confirmation modal to display when attempting to delete an item
      - deleteConfMessage: the message to display im the delete confirmation modal
      - actionCompleted: boolean which determines when the server has started and finished a request. This will sdetermine when to show and stop the loading indicator
      - gridToolBarContent: This will be any custom content that is desired within the grid tool bar. This will be added in addtion to the "Add Row" button.
      - enableInlineEdits: boolean which determines whether to allow user to directly edit fields within the grid
      - commitInlineChanges: function that will be used to persist the changes made to the data source directly in the grid. Only needed when activating inline edits
                              - Have commitInlineChanges return true if the commit is successful and false if unsuccessful. The grid will use this boolean to determine
                              - whether to take the grid out of edit mode, or whether to keep in edit mode so user can correct mistakes
      - draggable: boolean which determines whether to make the grid rows reorderable via drag/drop. If deciding to use this feature, a prop will need to be provided for the apiUrl as well as a fetchData event handler
                              - the apiUrl will be used to call the server to reorder the rows in the server. After receiving a resonse, the fetchData event handler will be called to retrieve the updated records from
                              - the server and render the records in the new order
      - apiUrl: Required if setting the draggable prop to true. Needs to match the URL in server that is in charge of reordering the line nums in the DB for this particular component
      - fetchData: Required if setting the draggable prop to true. Needs to hit the api in charge of getting the data for this components grid. This event handler will be called after reordering the line nums in the DB
      -customHandleInLineChange - This prop must be set to true to invoke custom handle inline change. eg: in case of fileformat, besides updating the changed cell value, we also need to update other cells values for the same item.
      - handleInlineChange - This props is a custom function that would be invoked from within the built-in logic handleInineChange function.
      
*/

const DragCell = (props) => {
  return (
    <td onDragOver={() => { DragCell.reorder(props.dataItem) }} style={{ textAlign: "center" }}>
      <span
        className="drag-handle"
        draggable
        onDragStart={(e) => {
          DragCell.dragStart(props.dataItem);
          e.dataTransfer.setData("dragging", "");
        }}
        onDragEnd={(e) => {
          DragCell.dragEnd(props.dataItem);
        }}
      >
        {props.dataItem.isNew ? (
          <Button
            className="btn-delete-rule"
            onClick={() => window.GridFormComponent.confirmRemoval(props.dataItem)}
            disabled={props.viewOnly}
          >
            <i className="delete"></i>
          </Button>
          ) : (
            <i className="sortable" style={{ cursor: "move" }} >&nbsp;&nbsp;&nbsp;&nbsp;</i>
        )}
      </span>
    </td>
  );
}

class GridForm extends React.Component {
  constructor(props) {
    super(props);
    window.GridFormComponent = this;
    const dataState = {
      skip: 0,
      take: 10,
      sort: []
    };
    this.state = {
      anchor: null,
      selectedRow: {},
      data: [],
      dataState: dataState,
      actionButtonsDisplayed: false, //represent button group that displays under each row for copying, editing or deleting a row
      submitButtonsDisplayed: false, //represents button group for commiting or cancelling grid inline changes. Only applicable if inline editing enabled
      columns: this.props.columns,
      editEnabled: false,
      lockOn: false,
      new_row: false,
      dataItem: null
    }
    DragCell.reorder = this.reorder.bind(this);
    DragCell.dragStart = this.dragStart.bind(this);
    DragCell.dragEnd = this.dragEnd.bind(this);
    this.wrapperRef = React.createRef();
  }

  componentWillReceiveProps({ data, enableInlineEdits, submitError, columns, lockOn, editMode }) {
    //if we're not allowing inline edits, then always update the state with the parent data
    //However, if enline edits are enabled, we want to prevent overwritting changes if submitting the grid with errors
    //In this case, we want to display a submit error and allow the user to fix their mistakes instead reverting to parent data
    if (!enableInlineEdits) {
      this.setState({ data });
    }
    else if (enableInlineEdits && !submitError && !editMode) {
      this.setState({ data });
    }
    this.setState({ columns, lockOn: lockOn });
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  confirmRemoval = (dataItem) => {
    this.setState({ dataItem: dataItem, new_row: true });
    this.openModal(this.props.deleteConfDivId);
  }

  cancelRemoval = () => {
    this.setState({ dataItem: null, new_row: false });
  }

  deleteInput = () => {
    let arr = [];
    let count = 0;

    this.state.data.forEach((element) => {
      if (element.id !== this.state.dataItem.id) {
        arr.push(element);
      }

      if (element.inEdit && element.isNew) {
        count++;
      }
    });

    this.setState({ data: arr });

    if (count === 1) {
      this.setState({ submitButtonsDisplayed: false, editEnabled: false });
    }
  }

  //Used to close grid action buttons if user clicks outside grid
  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.displayActionButtons(false);
    }
  }

  handleSelect = (e) => {
    let currentRow = e.nativeEvent.target.closest('tr')
    if (!this.props.hideGridActions) {
      this.displayActionButtons(true);
    }
    this.setState({
      anchor: currentRow,
      selectedRow: e.dataItem,
    });
  }

  //For admin client alone, since the indexes in UI do not match the lineNums in DB(missing lineNums created via delphi adminclient)
  //we are using the item at the newIndex to fetch its lineNum as the new order when an item would move, 
  //rather than using the newIndex itself as the new order.
  newIndexItem = null; // made variable global so can be used in dragEnd()
  reorder(dataItem) {
    
    if (this.state.activeItem.lineNum === dataItem.lineNum || this.props.viewOnly) {
      return;
    }
       
    let reorderedData = this.state.data.slice();
    let prevIndex = reorderedData.findIndex(p => (p.id === this.state.activeItem.id));
    let nextIndex = reorderedData.findIndex(p => (p.id === dataItem.id));

    this.newIndexItem = reorderedData[nextIndex];
    
    reorderedData.splice(prevIndex, 1);
    reorderedData.splice(nextIndex, 0, this.state.activeItem);

    this.setState({
      data: reorderedData,
      active: this.state.activeItem
    })
  }

  draggedItem = null;
  dragStart(dataItem) {
    if (!this.props.viewOnly) {
      this.draggedItem = dataItem;
      this.setState({
        data: this.state.data,
        activeItem: dataItem
      });
    }
  }

  dragEnd() {
    if (!this.props.viewOnly) {
      let dataItem = this.draggedItem;
      dataItem.order = this.newIndexItem.lineNum;

      let page = (this.props.page) ? "/" + this.props.page : "";
      axios
        .post(this.props.apiUrl + dataItem.id + "/resetOrder" + page, dataItem) 
        .then(response => {
          this.props.fetchData();
        })
        .catch(error => {
          if(this.props.handleResponseErrors){
            this.props.handleResponseErrors(error);
          }
          else{
            console.log(error);
          }
        });
    }
  }

  copyEvent = () => {
    this.displayActionButtons(false);
    this.props.copyItem(this.state.selectedRow)
  }

  editEvent = () => {
    this.setState({ lockOn: false });
    this.displayActionButtons(false);
    let action = this.props.viewOnly ? "view" : "edit";
    if (this.props.enableInlineEdits) {
      let selectedRow = this.state.selectedRow;
      this.setState({
        data: this.state.data.map(item =>
          item.id === selectedRow.id ? { ...item, inEdit: true } : item,
        ),
        submitButtonsDisplayed: true
      });
    }
    //else { invoke this, irrespective of inlineEdits or not, to obtain lock
      this.props.getItem(this.state.selectedRow, action);
    //}
  }

  deleteEvent = () => {
    this.displayActionButtons(false);
    //if not provided a div id for a delete confirmation message, then d
    if (!this.props.deleteConfDivId) {
      this.delete();
    }
    else {
      this.openModal(this.props.deleteConfDivId);
    }
  }


  openModal = (modalId) => {
    if (modalId) {
      var modal = document.getElementById(modalId);
      modal.style.display = "block";
    }
  }

  closeDeleteConfirmationModal = () => {
    if (this.props.deleteConfDivId) {
      var modal = document.getElementById(this.props.deleteConfDivId);
      modal.style.display = "none";
    }
  }

  getLocalizedString = (id) => {
    const { intl } = this.props;
    return intl.formatMessage({ id: id })
  }

  delete = () => {
    if (this.state.new_row) {
      this.deleteInput();
      this.setState({ dataItem: null, new_row: false });
    } else {
      this.props.delete(this.state.selectedRow);
    }

    this.closeDeleteConfirmationModal();
  }

  displayActionButtons = (isDisplay) => {
    this.setState({ actionButtonsDisplayed: isDisplay });
  }

  getAdditionalButtons = () => {
    if (this.props.getAdditionalButtons) {
      return this.props.getAdditionalButtons(this.state.selectedRow);
    }
    return null;
  }

  //checks to see if the current item in the iteration is the same as the row selected in grid
  //Used to highlight the selected row
  //If item doesn't have an id, then no reliable way to distinguish. So we just return false and do not highlight row.
  rowAndIdMatch = (itemInFocus, selectedRow) => {
    if (itemInFocus.id) {
      return itemInFocus.id === selectedRow.id;
    }
    return false;
  }


  getData = () => {
    let data = this.state.data.map(
      (item) => ({ ...item, selected: this.rowAndIdMatch(item, this.state.selectedRow) })
    )
    return process(data, this.state.dataState);
  }

  _export;
  export = () => {
    this._export.save();
  }

  onColumnsSubmit = (columnsState) => {
    this.setState({
      columns: columnsState
    });
  }

  //---------------------------------------------------------------- Inline Grid Edit Funtions ------------------------------------------------------

  generateTempId = () => {
    var shortid = require('shortid');
    return shortid.generate();
  }

  addInlineRow = () => {
    let rowId = 0;
    let arr = [];
    const newDataItem = { 
      id: this.generateTempId(), 
      inEdit: true, 
      isNew: true,
    };
    this.setState({ lockOn: false });

    this.setState({ lockOn: false });

    // Get index of row at the top of the current page.
    rowId = this.getData().data[0]?.id ?? 0;

    // Put new data item at the top of the current page.
    let topEleIndex = this.state.data.findIndex(element => element.id === rowId );
    newDataItem.index = newDataItem.lineNum = this.state.data[topEleIndex]?.lineNum ?? 1;
    arr = [...this.state.data];
    arr.splice(topEleIndex, 0, newDataItem);
    
    this.setState({
      data: arr,
      submitButtonsDisplayed: true,
      actionButtonsDisplayed: false  //set this to false just in case grid action buttons were previously displayed.
    });
  };

  handleInineChange = (e) => {
    this.setState({ editEnabled: true });
    if (this.props.customHandleInLineChange) {
      const data = this.props.handleInlineChange(e, this.state.data);
      this.setState({ data });
    } else {
      const data = this.state.data.map(item =>
        item.id === e.dataItem.id
          ? { ...item, [e.field]: e.value }
          : item
      );
      this.setState({ data });
    }
  };

  cancelInlineEdits = () => {
    this.props.releaseLocks(this.state.data);
    let prevData = this.props.data;
    this.props.resetForm();
    this.setState({ data: prevData, submitButtonsDisplayed: false })
    this.setState({ editEnabled: false, lockOn: false});
  }

  commitInlineEdits = () => {
    let isValidCommit = this.props.commitInlineChanges(this.state.data);

    if(isValidCommit) {
      //this.turnOffInlineEdit();
      this.props.resetForm();  
      this.setState({ submitButtonsDisplayed: false, editEnabled: false });
    }
  }

  getPageSizes = () => {
    let pageSizes = [10, 20, 30]
    if (this.state.data.length > 30) {
      pageSizes.push(this.state.data.length)
    }
    return pageSizes;
  }

  /*//TO-DO: Might be able to remove this function after hooking up with server
  turnOffInlineEdit = () => {
    this.setState({
      data: this.state.data.map(item =>
        true ? { ...item, inEdit: false } : item,
      ),
      submitButtonsDisplayed: false
    });
  }
  */

  //------------------------------------------------------------------------------------------------------------------------------------------------------

  columnMenu = (props) => <ColumnMenu {...props} columns={this.state.columns} onColumnsSubmit={this.onColumnsSubmit} />

  render() {
    return (
      <div ref={this.wrapperRef}>
        <Grid 
          editField="inEdit"
          onItemChange={this.handleInineChange}
          data={this.getData()}
          {...this.state.dataState}
          onDataStateChange={(e) => {
            this.setState({ dataState: e.dataState, actionButtonsDisplayed: false })
          }}
          pageable={{
            buttonCount: 5,
            info: true,
            type: 'input',
            pageSizes: this.getPageSizes(),
            previousNext: true
          }}
          sortable={{
            allowUnsort: true,
            mode: 'single'
          }}
          filterable={this.props.filterable}
          scrollable={!this.props.scrollable ? 'none' : ''}
          onRowClick={(e) => this.handleSelect(e)}
          selectedField="selected"
        >
          {/* {this.props.toolBarContent ? this.props.toolBarContent : null} */}
          <GridToolbar>
            {this.props.toolBarContent ? this.props.toolBarContent : null}
            {this.props.enableInlineEdits && !this.props.viewOnly ? 
              <Button onClick={this.addInlineRow} disabled={this.state.editEnabled}>
                Add Row
              </Button> 
            : null}
            <div style={{ float: "right", margin: "6px 0 0 0" }}>
              {this.props.gridToolBarContent}
              {this.props.enableInlineEdits && this.state.submitButtonsDisplayed && !this.state.lockOn ?
                <div>
                  <Button onClick={this.cancelInlineEdits}>
                    Cancel
                  </Button>
                  <Button onClick={this.commitInlineEdits} primary={true}>
                    Commit
                  </Button>
                </div>
                : null}
            </div>
          </GridToolbar>
          {this.props.draggable ? <Column title="" width="80px" cell={DragCell} /> : null}          
          {
            this.state.columns.map((column, idx) =>
              column.show && (<Column
                {...column} //passed down all of the columns fields
                key={idx}
                columnMenu={this.columnMenu}
                headerCell={HeaderTooltip}
              />)
            )
          }
        </Grid>
        {this.props.hideGridActions ? null :
          <div>
            <GridActionPopup
              anchor={this.state.anchor}
              show={this.state.actionButtonsDisplayed}
              additionalButtons={this.getAdditionalButtons()}
              copyEvent={this.copyEvent}
              editEvent={this.editEvent}
              deleteEvent={this.deleteEvent}
              hideCopy={this.props.hideCopy} //pass in true if wanting to hide copy button
              hideEdit={this.props.hideEdit} //pass in true if wanting to hide edit button
              hideDelete={this.props.hideDelete} //pass in true if wanting to hide delete button
              viewOnly={this.props.viewOnly}
            />
            <DeleteConfirmationModal
              divId={this.props.deleteConfDivId}
              titleId={this.props.deleteConfTitleId}
              titleString={this.props.deleteConfTitleString}
              messageId={this.props.deleteConfMessageId}
              messageString={this.props.deleteConfMessageString}
              messageArgs={this.state.selectedRow ? { name: this.state.selectedRow.name } : null}
              deleteEvent={this.delete}
              new_row={this.state.new_row}
              cancelRemoval={this.cancelRemoval}
            />
          </div>
        }
        <GridLoadingIndicator actionCompleted={this.props.actionCompleted} />
      </div >
    );
  }
};

export default injectIntl(GridForm);