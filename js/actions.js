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
  executeSearch: function (objektTypeId) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_EXECUTE_SEARCH,
      objektTypeId: objektTypeId
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
  },
  addGeomStart: function (id, type) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_ADD_GEOM_START,
      id: id,
      type: type
    });
  },
  addGeomAbort: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_ABORT_GEOM_ADD
    });
  },
  addGeomEnd: function () {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_ADD_GEOM_END
    });
  },
  updateValidationMessage: function (message) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_VAL_MESSAGE,
      message: message
    });
  },
  updateENUMValue: function (id, value) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_ENUM_VALUE,
      id: id,
      value: value
    });
  },
  updateFieldValue: function (id, value, type) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_FIELD_VALUE,
      id: id,
      value: value,
      type: type
    });
  },
  updateValidatorResponse: function (response) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_VALIDATOR_RESPONSE,
      response: response
    });
  },
  updateWriteStatus: function (status) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_WRITE_STATUS,
      status: status
    })
  },
  updateProgressStatus: function (status) {
    AppDispatcher.dispatch({
      actionType: RegDemConstants.actions.REGDEM_UPDATE_PROGRESS_STATUS,
      status: status
    })
  }
};

module.exports = RegDemActions;
