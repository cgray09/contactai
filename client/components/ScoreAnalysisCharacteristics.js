import React from 'react';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { commonService } from '../services/commonSvc.js';
import { filterBy } from '@progress/kendo-data-query';
import { ContentBox } from './';
import ScoreAnalysisGridCheckBox from './ScoreAnalysisGridCheckBox.js';
import GridLoadingIndicator from '../commonsweb/js/LoadingIndicator/GridLoadingIndicator';
import ScoreAnalysisCharEdit from './ScoreAnalysisCharEdit.js';
import { Error } from "@progress/kendo-react-labels";
import { FormattedMessage } from 'react-intl';
import ErrorGroup from '../commonsweb/js/ErrorHandling/ErrorGroup'
import axios from "axios";
axios.defaults.withCredentials = true;

const RowRender = (properties) => {
  const { row, props, onDrop, onDragStart } = { ...properties };
  const additionalProps = {
    onDragStart: (e) => onDragStart(e, props.dataItem),
    onDragOver: (e) => {
      e.preventDefault();
    },
    onDrop: (e) => onDrop(e),
    draggable: true,
  };
  return React.cloneElement(
    row,
    { ...row.props, ...additionalProps },
    row.props.children
  );
};


export default class ScoreAnalysisCharacteristics extends React.Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      gridOneSelectedItem: {},
      gridTwoSelectedItem: {},
      dataDict: [],
      gridOneData: [],
      gridTwoData: [],
      dragFrom: '',
      dragDataItem: null,
      submitButtonsDisplayed: false,
      displayEditModal: false,
      responseErrors: [], //response errors from submitting item
      actionCompleted: true, //used for loading indicator
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchDataDictionary();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  route = (url) => {
    this.props.history.push(url);
  }

  fetchDataDictionary = () => {
    this.setState({ actionCompleted: false });
    axios.get('/api/dataDictionary/analysisCharData')
      .then(response => {
        let dataDict = response.data.map(item => ({
          ...item,
          active: 1, // 0 - false, 1-true
          groupr: item.type == "CHARACTER" ? 1 : 0
        }));
        this.setState({ dataDict })
        this.fetchData();
      })
      .catch(error => {
        if ((error && error.response) && error.response.status === 401) {
          console.log("User is unauthorized. Routing back to login");
          this.route("/");
        }
        this.handleResponseErrors(error);
      })
  }

  fetchData = () => {
    this.setState({ actionCompleted: false, gridOneSelectedItem: {}, gridTwoSelectedItem: {} });
    axios.get("/api/scorecards/analysisChar")
      .then(response => {
        if (this._isMounted) {
          this.setState({
            gridOneData: this.state.dataDict.filter(item => {
              return !response.data.find(filter => {
                return filter.name === item.name;
              });
            }),
            gridTwoData: response.data,
            responseErrors: [],
            actionCompleted: true
          });
        }
      })
      .catch(error => {
        if ((error && error.response) && error.response.status === 401) {
          console.log("User is unauthorized. Routing back to login");
          this.route("/");
        }
        this.handleResponseErrors(error);
      });
  }

  handleOnDropOne = (e) => {
    if (this.state.dragFrom === "second" && !this.props.viewOnly) {
      this.removeSelected(this.state.dragDataItem);
    }
  };

  handleDragStartOne = (e, dataItem) => {
    this.setState({
      dragFrom: 'first',
      dragDataItem: dataItem,
    });
  };

  handleOnDropTwo = (e) => {    
    if (this.state.dragFrom === "first" && !this.props.viewOnly) {
      this.addSelected(this.state.dragDataItem);
    }
  };

  handleDragStartTwo = (e, dataItem) => {
    this.setState({
      dragFrom: 'second',
      dragDataItem: dataItem,
    });
  };

  addSelected = (selectedItem) => {
    this.setState({ actionCompleted: false });
    selectedItem.id = null;
    axios.post("/api/scorecards/analysisChar", selectedItem)
      .then(() => this.fetchData())
      .catch(error => {
        if ((error && error.response) && error.response.status === 401) {
          console.log("User is unauthorized. Routing back to login");
          this.route("/");
        }
        this.handleResponseErrors(error);
      });
  }

  addAll = () => {
    if (this.state.gridOneData.length > 0) {
      this.setState({ actionCompleted: false });
      axios.post("/api/scorecards/analysisChar/import", this.state.gridOneData)
        .then(() => this.fetchData())
        .catch(error => {
          if ((error && error.response) && error.response.status === 401) {
            console.log("User is unauthorized. Routing back to login");
            this.route("/");
          }
          this.handleResponseErrors(error);
        });
    }  
  }

  removeSelected = (selectedItem) => {
    this.setState({ actionCompleted: false, responseErrors: [] });
    axios.delete("/api/scorecards/analysisChar/" + selectedItem.id)
      .then(() => this.fetchData())
      .catch(error => {
        if ((error && error.response) && error.response.status === 401) {
          console.log("User is unauthorized. Routing back to login");
          this.route("/");
        }
        this.handleResponseErrors(error);
      });
  }

  removeAll = () => {
    this.setState({ actionCompleted: false });
    axios.delete("/api/scorecards/analysisChar/deleteAll")
      .then(() => this.fetchData())
      .catch(error => {
        if ((error && error.response) && error.response.status === 401) {
          console.log("User is unauthorized. Routing back to login");
          this.route("/");
        }
        this.handleResponseErrors(error);
      });
  }

  rowForGridOne = (row, props) => {
    return (
      <RowRender
        props={props}
        row={row}
        onDrop={this.handleOnDropOne}
        onDragStart={this.handleDragStartOne}
      />
    );
  };

  rowForGridTwo = (row, props) => {
    return (
      <RowRender
        props={props}
        row={row}
        onDrop={this.handleOnDropTwo}
        onDragStart={this.handleDragStartTwo}
      />
    );
  };

  resetForm = () => {
    this.setState({
      gridOneSelectedItem: {},
      gridTwoSelectedItem: {},
      gridOneData: [],
      gridTwoData: [],
      dragFrom: '',
      dragDataItem: null,
      submitButtonsDisplayed: false,
      displayEditModal: false,
      responseErrors: [], //response errors from submitting item
      actionCompleted: true, //used for loading indicator
    })
  }

  handleSuccessfulSubmission = () => {
    if (this._isMounted) {
      // this.setState({ actionCompleted: true,  });
      this.fetchData();
      //TO-DO: Eventually implement call to release locks
      this.resetForm();
    }
  }

  handleResponseErrors = (error) => {
    if (this._isMounted) {
      let responseErrors = commonService.getResponseErrors(error);
      this.setState({ responseErrors, actionCompleted: true });
    }
  }

  //Used to close grid action buttons if user clicks outside grid
  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.displayActionButtons(false);
    }
  }

  
  //checks to see if the current item in the iteration is the same as the row selected in grid
  //Used to highlight the selected row
  //If item doesn't have an id, then distinguish based on name. If no name exists then no way to distinguish between rows
  rowAndIdMatch = (itemInFocus, selectedItem) => {
    if (itemInFocus && selectedItem) {
      if(itemInFocus.id && selectedItem.id)
        return itemInFocus.id === selectedItem.id 
      else  
        return itemInFocus.name === selectedItem.name;
    }
    return false;
  }

  getData = (retrieveForGridOne) => {
    let prevData = retrieveForGridOne ? this.state.gridOneData : this.state.gridTwoData;
    let selectedItem = retrieveForGridOne ? this.state.gridOneSelectedItem : this.state.gridTwoSelectedItem;
    let updatedData = prevData.map(
      (item) => ({ ...item, selected: this.rowAndIdMatch(item, selectedItem) })
    )
    return updatedData;
  }

  editSelected = () => {
    this.setState({ actionCompleted: false, responseErrors: [] });
    axios
      .get("/api/scorecards/analysisChar/" + this.state.gridTwoSelectedItem.id)
      .then(response => {
        this.setState({ actionCompleted: true });
        this.setState({ gridTwoSelectedItem: response.data },
          () => this.toggleModal());
      })
      .catch(error => {
        this.handleResponseErrors(error);
      });
  }

  toggleModal = () =>  {
    if(this.state.displayEditModal) {
      this.releaseLock(this.state.gridTwoSelectedItem.id);
  }
    this.setState({ displayEditModal: !this.state.displayEditModal });
  }

  releaseLock = (id) => {
    if (typeof id !== "undefined" && id !== null) { // doing this instead of if (id) check coz found id with 0 value in test DB
        axios
            .post("/api/scorecards/analysisChar/" + id + "/releaseLock")
            .then(response => { })
            .catch(error => {
                this.handleResponseErrors(error);
            });
    }
}

  CheckBoxCell = (props) => <ScoreAnalysisGridCheckBox {...props} />

  backButton = () => {
    this.props.history.goBack();
  }

  navHistory = [{ url: "/Home", label: "Home" }, { url: "/ScorecardsHome", label: "Scorecards" }]

  headerButtons =
    <div className="actions">
        <Button className="button actions" onClick={() => this.backButton()}>
            <FormattedMessage id="action.goBack" defaultMessage="Go Back" />
        </Button>
    </div>

  render() {

    return (
      <>
        <ContentBox titleId="scorecards.setAnalysisChars" divId="setAnalysisChars" navHistory={this.navHistory} footerButtons={this.headerButtons}>
          <ErrorGroup errorMessages={this.state.responseErrors} />
          <Error>{this.state.submitError}</Error>
          <div className="grid-container">
              <Grid
                style={{ height: '400px' }}
                data={filterBy(this.getData(true), this.state.filter)}
                rowRender={this.rowForGridOne}
                filterable={true}
                filter={this.state.filter}
                onFilterChange={(e) => {
                  this.setState({
                    filter: e.filter,
                  });
                }}
                onRowClick={(e) => this.setState({ gridOneSelectedItem: e.dataItem })}
                selectedField="selected"
              >
                <GridToolbar>
                  <Button onClick={() => this.addSelected(this.state.gridOneSelectedItem)} disabled={this.props.viewOnly || !this.state.gridOneSelectedItem.name}>
                    <FormattedMessage id="action.addSelected" defaultMessage="Add Selected" />
                  </Button>
                  <Button onClick={this.addAll} disabled={this.props.viewOnly}>
                    <FormattedMessage id="action.addAll" defaultMessage="Add All" />
                  </Button>
                </GridToolbar>
                <Column field="name" title="Data Dictionary" width="250px" />
              </Grid>
            <hr />
              <Grid
                style={{ height: '400px' }}
                data={this.getData(false)}
                rowRender={this.rowForGridTwo}
                onRowClick={(e) => this.setState({ gridTwoSelectedItem: e.dataItem })}
                selectedField="selected"
              >
                <GridToolbar>
                  <Button onClick={this.editSelected} disabled={this.props.viewOnly || !this.state.gridTwoSelectedItem.id}>
                    <FormattedMessage id="action.editSelected" defaultMessage="Edit Selected" />
                  </Button>
                  <Button onClick={() => this.removeSelected(this.state.gridTwoSelectedItem)} disabled={this.props.viewOnly || !this.state.gridTwoSelectedItem.id}>
                    <FormattedMessage id="action.removeSelected" defaultMessage="Remove Selected" />
                  </Button>
                  <Button onClick={this.removeAll} disabled={this.props.viewOnly}>
                    <FormattedMessage id="action.removeAll" defaultMessage="Remove All" />
                  </Button>
                </GridToolbar>
                <Column field="active" title="Active" cell={this.CheckBoxCell} />
                <Column field="groupr" title="GroupR" cell={this.CheckBoxCell} />
                <Column field="name" title="Characteristic" />
                <Column field="source" title="Source" />
                <Column field="type" title="Type" />
                <Column field="description" title="Description" />
              </Grid>
            <GridLoadingIndicator actionCompleted={this.state.actionCompleted} />
          </div>
        </ContentBox>
        <ScoreAnalysisCharEdit
          analsysChar={this.state.gridTwoSelectedItem}
          isOpen={this.state.displayEditModal}
          toggleModal={this.toggleModal}
          fetchData={this.fetchData}
          viewOnly={this.props.viewOnly}
        />
        {this.props.footer}
      </>
    );
  }
}