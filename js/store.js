let AppDispatcher = require('./dispatcher');
let EventEmitter = require('events').EventEmitter;
let assign = require('object-assign');

let RegDemConstants = require('./constants');
let Helper = require('./helper.js');
let Fetch = require('./fetch.js');


let CHANGE_EVENT = 'change';

let _state = {
  // APP
  objektID: null,
  objektTypeID: null,

  // Hele objektet
  objekt: null,
  // Hele objektType
  objektType: null,

  searchResults: null,

  editor: {
    // Hvorvidt editor har lastet
    loading: false,

    // Hvortvidt editor er collapsed
    expanded: false
  },

  search: {
    inputValue: '',
    options: [],
    loading: false
  },

  list: {
    open: false
  },

  map: {
    myLocation: true
  }
};

let simpleDeepCopy = function (oldObject) {
  return JSON.parse(JSON.stringify(oldObject));
};

let _initialState = simpleDeepCopy(_state);



let mapData = null;

let setObjektID = function (objektID) {
  if (objektID) {
    _state.objektID = objektID;
    getNewData(objektID);
  }
};

let closeEditor = function () {
  _state.objektID = null;
  _state.objekt = null;
  _state.editor.loading = false;
  _state.editor.expanded = false;
};

let expandEditor = function () {
  _state.editor.expanded = true;
};

let fetchObjektPositions = function (id) {
  _state.search.loading = true;
  RegDemStore.emitChange();

  id = id || _state.objektTypeID;

  if (mapData) {
    var mapbox = mapData.getBounds();

    Fetch.fetchAPIObjekter(id, mapbox, (data) => {
      // _state.list.open = true;
      _state.searchResults = data;
      _state.search.loading = false;
      RegDemStore.emitChange();
    });
  }
};

let fetchObjektTypes = function (objektType) {
  _state.search.loading = true;
  RegDemStore.emitChange();

  Fetch.fetch( objektType, function(data) {
    _state.search.options = data;
    _state.search.loading = false;
    RegDemStore.emitChange();
  });
};

let setInputValue = function (inputValue) {
  _state.search.inputValue = inputValue;
  RegDemStore.emitChange();
};

let executeSearch = function (objektTypeID) {
  _state.objektID = null;
  _state.objekt = null;

  _state.objektTypeID = objektTypeID;
  _state.objektType = null;

  fetchObjektPositions(objektTypeID);
};

let addMapDataAsReference = function (inputMapData) {
  mapData = inputMapData;
};

let resetApp = function () {
  _state = simpleDeepCopy(_initialState);
};

let closeList = function () {
  _state.list.open = false;
};

let showList = function () {
  _state.list.open = true;
};

let getCurrentLocation = function () {
  _state.map.myLocation = true;
};

let locationHasBeenSet = function () {
  _state.map.myLocation = false;
};

// Get editor data

let getNewData = function (objektID) {
  // Skal vi lage nytt objekt?
  if (objektID === -1) {
    // Har vi oppgitt
    if (_state.objektTypeID) {
      // Kun hent ObjektType data, sett Objekt data til null
      _state.editor.loading = true;
      RegDemStore.emitChange();

      fetchObjekTypetData(null, _state.objektTypeID);
    }
  } else {
    if (!_state.objekt || objektID !== _state.objekt.objektId) {
      _state.editor.loading = true;
      RegDemStore.emitChange();

      fetchObjektData(objektID);
    }
  }
};

let fetchObjektData = function (objektID) {
  Fetch.fetchObjekt(objektID, (objektData) => {
    // Når du har hentet Objekt data må du hente ObjektTypeData. Sender ObjektData
    // som parameter slik at fetchObjektTypeData kan oppdatere state.
    fetchObjekTypetData(objektData, objektData.objektTypeId);
  });
};

let fetchObjekTypetData = function (objektData, objektTypeId) {
  // Nå som vi har objektet, kan vi hente objekttype
  Fetch.fetchObjektType(objektTypeId, (objektTypeData) => {
    // Sorterer egenskaper til objekttype etter viktighet og sorteringsnummer
    objektTypeData.egenskapsTyper.sort(function (a, b) {
      let differanseMellomAogB = Helper.objektTypeViktighetTilNummer(a.viktighet) - Helper.objektTypeViktighetTilNummer(b.viktighet);

      if (differanseMellomAogB === 0) {
        // Sorter på sorteringsnummer, nivå 2
        return a.sorteringsnummer - b.sorteringsnummer;
      } else {
        // Sorter på viktighet, nivå 1
        return differanseMellomAogB;
      }
    });

    _state.objekt = objektData;
    _state.objektType = objektTypeData;
    _state.editor.loading = false;
    _state.editor.expanded = false;

    RegDemStore.emitChange();
  });
};


let RegDemStore = assign({}, EventEmitter.prototype, {
  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function() {
    return _state;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
  let id, inputMapData, objektType, inputValue, objektTypeID;

  switch(action.actionType) {
    case RegDemConstants.actions.REGDEM_SET_OBJEKT_ID:
      id = action.id;
      setObjektID(id);
      break;

    case RegDemConstants.actions.REGDEM_CLOSE_EDITOR:
      closeEditor();
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_EXPAND_EDITOR:
      expandEditor();
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_FETCH_OBJEKT_POSITIONS:
      id = action.id;
      fetchObjektPositions(id);
      break;

    case RegDemConstants.actions.REGDEM_FETCH_OBJEKT_TYPES:
      objektType = action.objektType;
      fetchObjektTypes(objektType);
      break;

    case RegDemConstants.actions.REGDEM_SET_INPUT_VALUE:
      inputValue = action.inputValue;
      setInputValue(inputValue);
      break;

    case RegDemConstants.actions.REGDEM_EXECUTE_SEARCH:
      objektTypeID = action.objektTypeID;
      executeSearch(objektTypeID);
      break;

    case RegDemConstants.actions.REGDEM_ADD_MAPDATA_AS_REFERENCE:
      inputMapData = action.mapData;
      addMapDataAsReference(inputMapData);
      break;

    case RegDemConstants.actions.REGDEM_RESET_APP:
      resetApp();
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_CLOSE_LIST:
      closeList();
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_SHOW_LIST:
      showList();
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_GET_CURRENT_LOCATION:
      getCurrentLocation();
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_LOCATION_HAS_BEEN_SET:
      locationHasBeenSet();
      RegDemStore.emitChange();
      break;


    default:
      // no op
  }
});

module.exports = RegDemStore;
