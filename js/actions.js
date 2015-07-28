var AppDispatcher = require('./dispatcher');
var RegDemConstants = require('./constants');

var RegDemActions = {
  setObjektID: function (listPosition, id) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SET_OBJEKT_ID,
      listPosition: listPosition,
      id: id
    });
  },
  closeEditor: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_CLOSE_EDITOR,
      listPosition: listPosition
    });
  },
  expandEditor: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_EXPAND_EDITOR,
      listPosition: listPosition
    });
  },
  fetchObjektPositions: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_FETCH_OBJEKT_POSITIONS,
      listPosition: listPosition
    });
  },
  selectExtraEgenskap: function (listPosition, extraEgenskap) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SELECT_EXTRA_EGENSKAP,
      listPosition: listPosition,
      extraEgenskap: extraEgenskap
    });
  },
  fetchObjektTypes: function (listPosition, objektType) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_FETCH_OBJEKT_TYPES,
      listPosition: listPosition,
      objektType: objektType
    });
  },
  setInputValue: function (listPosition, inputValue) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SET_INPUT_VALUE,
      listPosition: listPosition,
      inputValue: inputValue
    });
  },
  executeSearch: function (listPosition, objektTypeId) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_EXECUTE_SEARCH,
      listPosition: listPosition,
      objektTypeId: objektTypeId
    });
  },
  resetApp: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_RESET_APP,
      listPosition: listPosition
    });
  },
  closeList: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_CLOSE_LIST,
      listPosition: listPosition
    });
  },
  showList: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SHOW_LIST,
      listPosition: listPosition
    });
  },
  getCurrentLocation: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_GET_CURRENT_LOCATION,
      listPosition: listPosition
    });
  },
  locationHasBeenSet: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_LOCATION_HAS_BEEN_SET,
      listPosition: listPosition
    });
  },
  goBackAndReset: function (listPosition, userInput) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_GO_BACK_AND_RESET,
      listPosition: listPosition,
      userInput: userInput
    });
  },
  highlightMarker: function (listPosition, id) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_HIGHLIGHT_MARKER,
      listPosition: listPosition,
      id: id
    });
  },
  addGeomStart: function (listPosition, id, type) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_ADD_GEOM_START,
      listPosition: listPosition,
      id: id,
      type: type
    });
  },
  addGeomAbort: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_ABORT_GEOM_ADD,
      listPosition: listPosition
    });
  },
  addGeomEnd: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_ADD_GEOM_END,
      listPosition: listPosition
    });
  },
  updateValidationMessage: function (listPosition, message) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_VAL_MESSAGE,
      listPosition: listPosition,
      message: message
    });
  },
  updateENUMValue: function (listPosition, id, value) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_ENUM_VALUE,
      listPosition: listPosition,
      id: id,
      value: value
    });
  },
  updateFieldValue: function (listPosition, id, value, type) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_FIELD_VALUE,
      listPosition: listPosition,
      id: id,
      value: value,
      type: type
    });
  },
  updateValidatorResponse: function (listPosition, response) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_VALIDATOR_RESPONSE,
      listPosition: listPosition,
      response: response
    });
  },
  makeThisStateActive: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_MAKE_THIS_STATE_ACTIVE,
      listPosition: listPosition
    });
  },
  setPrevSelectedIndex: function (listPosition, selectedIndex) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_SET_PREV_SELECTED_INDEX,
      listPosition: listPosition,
      selectedIndex: selectedIndex
    });
  },
  terminateStateAndReset: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_TERMINATE_STATE_AND_RESET,
      listPosition: listPosition
    });
  },
  updateWriteStatus: function (listPosition, status) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_WRITE_STATUS,
      listPosition: listPosition,
      status: status
    });
  },
  updateProgressStatus: function (listPosition, status) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_PROGRESS_STATUS,
      listPosition: listPosition,
      status: status
    });
  },
  hasScrolledToTop: function (listPosition) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_HAS_SCROLLED_TO_TOP,
      listPosition: listPosition
    });
  }
};

module.exports = RegDemActions;
