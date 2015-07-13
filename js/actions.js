var AppDispatcher = require('./dispatcher');
var RegDemConstants = require('./constants');

var RegDemActions = {
  setObjektID: function(id) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SET_OBJEKT_ID,
      id: id
    });
  },
  closeEditor: function() {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_CLOSE_EDITOR
    });
  },
  expandEditor: function() {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_EXPAND_EDITOR
    });
  },
  fetchObjektPositions: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_FETCH_OBJEKT_POSITIONS
    });
  },
  selectExtraEgenskap: function (extraEgenskap) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SELECT_EXTRA_EGENSKAP,
      extraEgenskap: extraEgenskap
    });
  },
  fetchObjektTypes: function (objektType) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_FETCH_OBJEKT_TYPES,
      objektType: objektType
    });
  },
  setInputValue: function (inputValue) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SET_INPUT_VALUE,
      inputValue: inputValue
    });
  },
  executeSearch: function (objektTypeID) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_EXECUTE_SEARCH,
      objektTypeID: objektTypeID
    });
  },
  resetApp: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_RESET_APP
    });
  },
  closeList: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_CLOSE_LIST
    });
  },
  showList: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SHOW_LIST
    });
  },
  getCurrentLocation: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_GET_CURRENT_LOCATION
    });
  },
  locationHasBeenSet: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_LOCATION_HAS_BEEN_SET
    });
  },
  goBackAndReset: function (userInput) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_GO_BACK_AND_RESET,
      userInput: userInput
    });
  },
  highlightMarker: function (id) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_HIGHLIGHT_MARKER,
      id: id
    });
  }
};

module.exports = RegDemActions;
