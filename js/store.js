let AppDispatcher = require('./dispatcher');
let EventEmitter = require('events').EventEmitter;
let assign = require('object-assign');

let RegDemConstants = require('./constants');
let omnivore = require('leaflet-omnivore');
let Helper = require('./helper.js');
let Fetch = require('./fetch.js');
let Writer = require('./writer.js');

let CHANGE_EVENT = 'change';

/*
===================== Empty State =====================
*/

let _emptyState = {
  version: 0, // Brukers spesielt for å få React til å re-render alle felter når man trykker på nytt element knappen og editor allerede har innhold
  listPosition: null,
  active: false,

  // APP
  objektId: null,
  objektTypeId: null,

  // Hele objektet
  objekt: null,
  objektEdited: null,
  // Hele objektType
  objektType: null,

  searchResults: null,
  searchResultsFull: null,

  validatorResponse: null,
  writeStatus: null,  // "error", "processing", "done"

  progressStatus: [],

  editor: {
    // Hvorvidt editor har lastet
    loading: false,
    // Hvorvidt editor er collapsed
    expanded: false,
    // Valideringsresultat
    validationMessage: null
  },

  search: {
    inputValue: '',
    options: [],
    loading: false,
    selectedIndex: null
  },

  list: {
    open: false,
    extraEgenskap: null,
    highlighted: null
  },

  map: {
    myLocation: true
  },

  geometry: {
    addingMarker: false,
    savingMarker: false,
    current: null,
    result: null, // Denne inneholder hele geometriobjektet. Hvis du på et senere tidspunkt ønsker å lagre hele _state som f eks JSON, må du passe på å endre innholdet i denne varaibelen
    resultType: null // [marker | strekning | flate]
  }
};

/*
===================== Object that includes all states =====================
*/

let _states = {
  activeState: null,
  list: []
};

let simpleDeepCopy = function (oldObject) {
  return JSON.parse(JSON.stringify(oldObject));
};

let createNewState = function () {
  let indexPosition = _states.list.push(simpleDeepCopy(_emptyState)) - 1;
  _states.list[indexPosition].listPosition = indexPosition;
  return indexPosition;
};

let deleteState = function (index) {
  _states.list[index] = null;
};

let getAllStates = function () {
  return _states.list.filter((value, index) => {
    return (value);
  });
};

let getStateAtIndex = function (index) {
  return _states.list[index];
};

let getActiveState = function () {
  return _states.list[_states.activeState];
};

let setActiveState = function (index) {
  if (_states.activeState >= 0 && _states.list[_states.activeState]) {
    _states.list[_states.activeState].active = false;
  }

  _states.activeState = index;

  _states.list[index].active = true;
  _states.list[index].map.myLocation = false;
};

let getInactiveState = function () {
  return _states.list.filter((value, index) => {
    return (index !== _states.activeState && value);
  });
};

let updateState = function (index, _state) {
  _states.list[index] = _state;
  return _states.list[index];
};

let initializeStates = function () {
  let newStatePosition = createNewState();
  setActiveState(newStatePosition);
};

initializeStates();

/*
===================== RegDemStore =====================
*/

let RegDemStore = assign({}, EventEmitter.prototype, {
  getAll: function () {
    return getAllStates();
  },

  getActiveState: function () {
    return getActiveState();
  },

  getInactiveState: function () {
    return getInactiveState();
  },

  emitChange: function () {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function (callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

/*
===================== Helpers for actions =====================
*/

let fetchObjektTypeData = function (_state) {
  // Hvis objektType allerede er lastet, trenger vi ikke hente den igjen
  if (_state.objektTypeId && _state.objektType && _state.objektType.id === _state.objektTypeId) {
    _state.editor.loading = false;
    _state.editor.expanded = false;

    RegDemStore.emitChange();
  } else {
    // Nå som vi har objektet, kan vi hente objekttype
    Fetch.fetchObjektType(_state.objektTypeId, (objektTypeData) => {
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

      _state.objektType = objektTypeData;
      _state.editor.loading = false;
      _state.editor.expanded = false;

      RegDemStore.emitChange();
    });
  }
};

let fetchObjektData = function (_state) {
  Fetch.fetchObjekt(_state.objektId, (objektData) => {
    _state.objekt = objektData;
    _state.objektEdited = null;

    fetchObjektTypeData(_state);
  });
};

let getNewData = function (_state) {
  // Skal vi lage nytt objekt?
  if (_state.objektId === -1) {
    // Har vi oppgitt
    if (_state.objektTypeId) {
      // Lager et objektEdited-objekt med enkel struktur
      createObjektEdited(_state);

      _state.editor.loading = true;
      RegDemStore.emitChange();

      fetchObjektTypeData(_state);
    }
  } else {
    if (!_state.objekt || _state.objektId !== _state.objekt.objektId) {
      // Sjekk om objektet finnes i searchResultsFull
      if (_state.searchResultsFull) {
        for (var i = 0; i < _state.searchResultsFull.resultater[0].vegObjekter.length; i++) {
          if (_state.searchResultsFull.resultater[0].vegObjekter[i].objektId === _state.objektId) {
            _state.objekt = _state.searchResultsFull.resultater[0].vegObjekter[i];
            RegDemStore.emitChange();
            return;
          }
        }
      }

      _state.editor.loading = true;
      RegDemStore.emitChange();

      fetchObjektData(_state);
    }
  }
};

let evaluateResponse = function (response) {
  // Antar at vi sender ét objekt av gangen.
  let result = response.resultat.vegObjekter[0];
  return !(result.feil || result.advarsel);

}

let rebuildFromState = function (_state) {
  // Markører
  MapFunctions.clearEditGeom();
  MapFunctions.updateMarkers(_state);

  // GPS
  _state.map.myLocation = false;
};

/*
===================== Functions called by Actions =====================
*/

let setObjektID = function (_state, objektId) {
  if (objektId && !_state.geometry.addingMarker) {
    resetObjekt(_state);
    closeList(_state);
    _state.objektId = objektId;
    MapFunctions.focusMarker(objektId);
    MapFunctions.clearEditGeom();
    getNewData(_state);
  }
};

let closeEditor = function (_state) {
  resetObjekt(_state);
  _state.editor.loading = false;
  _state.editor.expanded = false;
};

let expandEditor = function (_state) {
  _state.editor.expanded = true;
};

let fetchObjektPositions = function (_state) {
  _state.search.loading = true;
  RegDemStore.emitChange();

  let id = _state.objektTypeId;

  if (MapFunctions.mapData()) {
    let mapbox = MapFunctions.getBounds();

    Fetch.fetchAPIObjekter(id, mapbox, (data) => {
      _state.searchResults = data;
      _state.searchResultsFull = null;
      _state.search.loading = false;

      MapFunctions.updateMarkers(_state);

      RegDemStore.emitChange();
    });
  }
};

let fetchAllDataFromObjektPosition = function (_state, extraEgenskap) {
  if (_state.searchResultsFull) {
    _state.list.extraEgenskap = extraEgenskap;
    RegDemStore.emitChange();
  } else {
    _state.search.loading = true;
    RegDemStore.emitChange();

    let id = _state.objektTypeId;

    if (MapFunctions.mapData()) {
      var mapbox = MapFunctions.getBounds();

      Fetch.fetchAPIObjekter(id, mapbox, (data) => {
        _state.searchResultsFull = data;
        _state.search.loading = false;
        _state.list.extraEgenskap = extraEgenskap;
        RegDemStore.emitChange();
      }, true);
    }
  }
};

let fetchObjektTypes = function (_state, objektType) {
  _state.search.loading = true;
  RegDemStore.emitChange();

  Fetch.fetchObjektTypes( objektType, function(data) {
    _state.search.options = data;
    _state.search.loading = false;
    RegDemStore.emitChange();
  });
};

let setInputValue = function (_state, inputValue) {
  _state.search.inputValue = inputValue;
  RegDemStore.emitChange();
};

let executeSearch = function (_state, objektTypeId) {
  _state.objektId = null;
  _state.objekt = null;
  _state.objektEdited = null;

  _state.objektTypeId = objektTypeId;
  _state.objektType = null;

  fetchObjektTypeData(_state);

  fetchObjektPositions(_state);
};

let resetApp = function (_state) {
  MapFunctions.clearMarkers();
  MapFunctions.clearEditGeom();

  let listPosition = _state.listPosition;
  let active = _state.active;

  _state = updateState(listPosition, simpleDeepCopy(_emptyState));

  _state.listPosition = listPosition;
  _state.active = active;
  _state.map.myLocation = false;

  return _state;
};

let resetObjekt = function (_state) {
  _state.version = _state.version + 1;
  _state.objektId = null;
  _state.objekt = null;
  _state.objektEdited = null;

  _state.geometry.result = null;
  _state.geometry.resultType = null;

  _state.validatorResponse = null;

  MapFunctions.clearEditGeom(); // Fjerner edit-objekt ved lukking av editor.
  MapFunctions.focusMarker(null);
  MapFunctions.updateMarkers(_state);
};

let goBackAndReset = function (_state, userInput) {
  let oldSearchState = simpleDeepCopy(_state.search);
  _state = resetApp(_state);
  _state.search = oldSearchState;
  _state.search.inputValue = userInput;
};

let closeList = function (_state) {
  _state.list.open = false;
};

let showList = function (_state) {
  if (_state.objektId) {
    closeEditor(_state);
  }
  _state.list.open = !_state.list.open;
};

let highlightMarker = function (id) {
  MapFunctions.focusMarker(id);
};

let addGeomStart = function (_state, id, type) {
  if (!_state.search.loading) {
    _state.geometry.addingMarker = true;
    _state.geometry.current = id;
    _state.geometry.resultType = type;
    MapFunctions.addGeom(type, _state);
  }
};

let addGeomAbort = function (_state) {
  _state.geometry.addingMarker = false;
  _state.geometry.current = null;
  _state.geometry.result = null;
  _state.geometry.resultType = null;
  MapFunctions.removeGeom(_state);
};

let addGeomEnd = function (_state) {
  _state.geometry.savingMarker = true;
  _state.geometry.result = MapFunctions.getCurrentEditGeom();
  _state.geometry.addingMarker = false;
  updateEditedLocation(_state);
};

let getCurrentLocation = function (_state) {
  _state.map.myLocation = true;
  MapFunctions.findMyPosition();
};

let locationHasBeenSet = function (_state) {
  _state.map.myLocation = false;
};

let updateValidatorResponse = function (_state, response) {
  _state.validatorResponse = response;
  if(evaluateResponse(response)) {
    updateWriteStatus(_state, 'processing');
    Writer.registerObjekt(_state);
  } else {
    updateWriteStatus(_state, 'error');
  }
};

let updateValMessage = function (_state, message) {
  _state.editor.validationMessage = message;
};

let makeThisStateActive = function (_state) {
  setActiveState(_state.listPosition);
  rebuildFromState(_state);
};

let setPrevSelectedIndex = function (_state, selectedIndex) {
  _state.search.selectedIndex = selectedIndex;
};

let minimizeEditor = function () {
  let newState = createNewState();
  setActiveState(newState);
};

let terminateState = function (_state) {
  deleteState(_state.listPosition);

  if (!getActiveState() || getActiveState().length === 0) {
    let newState = createNewState();
    setActiveState(newState);
  }
};

let updateWriteStatus = function (_state, status) {
  switch (status) {
    case 'processing':
      minimizeEditor();
      break;
    case 'done':
      // terminateState(_state);
      break;
    default:
  }

  _state.writeStatus = status;
};

let updateProgressStatus = function (_state, status) {
  _state.progressStatus.push(status);
};

/*
===================== Create or update the model =====================
*/

let createObjektEdited = function (_state) {
  if (_state.objekt) {
    _state.objektEdited = simpleDeepCopy(_state.objekt);
  } else {
    _state.objektEdited = {
      objektId: -1,
      objektTypeId: _state.objektTypeId,
      egenskaper: [],
      lokasjon: {
        geometriWgs84: null,
        veglenker: null
      }
    };
  }
};

let findiEgenskapByString = function (_state, egenskap) {
  let returnEgenskap = null;
  _state.objektType.egenskapsTyper.every((element, index, array) => {
    if (element.navn && element.navn.toLowerCase().indexOf(egenskap) !== -1) {
      returnEgenskap = element;
      return false;
    }
    return true;
  });

  return returnEgenskap;
};

let findEnumValueFromObjektType = function (_state, egenskapFromObjektType, egenskapsId, enumId) {
  if (egenskapFromObjektType.type === "ENUM") {
    for (var testEnumId in egenskapFromObjektType.enumVerdier) {
      if (String(testEnumId) === String(enumId)) {
        return egenskapFromObjektType.enumVerdier[enumId];
      }
    }
  }

  return null;
};

let findEgenskapInObjektType = function (_state, egenskapsId) {
  if (_state.objektType) {
    // Finn riktig egenskap

    let egenskapsTyper = _state.objektType.egenskapsTyper;

    for (var i = 0; i < egenskapsTyper.length; i++) {
      if (String(egenskapsTyper[i].id) === String(egenskapsId)) {
        return egenskapsTyper[i];
      }
    }
  }
};

let findPositionToEgenskapInObjektEdited = function (_state, egenskapsId) {
  if (_state.objektEdited) {
    // Finn riktig egenskap

    let egenskaper = _state.objektEdited.egenskaper;

    for (var i = 0; i < egenskaper.length; i++) {
      if (String(egenskaper[i].id) === String(egenskapsId)) {
        return i;
      }
    }

    return egenskaper.length;
  }
};

// Function for each component that we care about. Needs to either create new structure or just edit what's already there
let updateENUMValue = function (_state, egenskapsId, enumObj) {
  if (!_state.objektEdited) {
    createObjektEdited(_state);
  }

  // Initaliserer verdier
  let enumId = enumObj.payload;
  let enumVerdi = enumObj.text;

  let egenskapFromObjektType = findEgenskapInObjektType(_state, egenskapsId);
  let enumVerdiFromObjektType = findEnumValueFromObjektType(_state, egenskapFromObjektType, egenskapsId, enumId);

  if (enumVerdiFromObjektType) {
    let newValue = {
      id: egenskapsId,
      navn: egenskapFromObjektType.navn,
      verdi: enumVerdi,
      enumVerdi: enumVerdiFromObjektType
    };

    let egenskapPositionFromObjektEdited = findPositionToEgenskapInObjektEdited(_state, egenskapsId);
    _state.objektEdited.egenskaper[egenskapPositionFromObjektEdited] = newValue;
  }

};

let updateFieldValue = function (_state, egenskapsId, fieldValue, fieldType) {
  if (!_state.objektEdited) {
    createObjektEdited(_state);
  }

  let egenskapFromObjektType = findEgenskapInObjektType(_state, egenskapsId);

  if (egenskapFromObjektType) {
    let newValue = null;

    switch (fieldType) {
      case 'Tekst':
      case 'Tall':
      case 'Tid':
      case 'Dato':
        newValue = {
          id: egenskapsId,
          navn: egenskapFromObjektType.navn,
          verdi: fieldValue
        };

        break;
      default:

    }


    let egenskapPositionFromObjektEdited = findPositionToEgenskapInObjektEdited(_state, egenskapsId);
    _state.objektEdited.egenskaper[egenskapPositionFromObjektEdited] = newValue;
  }

};

let updateEditedLocation = function (_state) {
  if (!_state.objektEdited) {
    createObjektEdited(_state);
  }

  if (_state.geometry.result) {
    switch (_state.geometry.resultType) {
      case 'marker':
        let lng = _state.geometry.result._latlng.lng;
        let lat = _state.geometry.result._latlng.lat;

        // Egengeometri
        let geometriEgenskap = findiEgenskapByString(_state, 'geometri, punkt');
        let WGS84ToUTM33 = proj4('+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs', [lng, lat]);

        if (geometriEgenskap) {
          let newValue = {
            id: geometriEgenskap.id,
            navn: geometriEgenskap.navn,
            verdi: 'POINT (' + WGS84ToUTM33[0] + ' ' + WGS84ToUTM33[1] + ')'
          };

          let egenskapPositionFromObjektEdited = findPositionToEgenskapInObjektEdited(_state, geometriEgenskap.id);
          _state.objektEdited.egenskaper[egenskapPositionFromObjektEdited] = newValue;
        }

        // Lenke ID
        Fetch.fetchKoordinat(lng, lat, (koorData) => {
          if (koorData.sokePunktSrid === 'LAT_LON_WGS84') {
            let positionObject = omnivore.wkt.parse(koorData.sokePunkt);
            let positionLatLng = positionObject._layers[Object.keys(positionObject._layers)[0]]._latlng;

            let WGS84ToUTM33 = proj4('+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs', [positionLatLng.lng, positionLatLng.lat]);
            let utm33Position = 'POINT (' + WGS84ToUTM33[0] + ' ' + WGS84ToUTM33[1] + ')';

            _state.objektEdited.lokasjon.geometriForenkletUtm33 = utm33Position;
            _state.objektEdited.lokasjon.geometriForenkletWgs84 = koorData.sokePunkt;
            _state.objektEdited.lokasjon.geometriUtm33 = utm33Position;
            _state.objektEdited.lokasjon.geometriWgs84 = koorData.sokePunkt;
          }
          _state.objektEdited.lokasjon.veglenker = [
            {
              id: koorData.veglenkeId,
              fra: koorData.veglenkePosisjon,
              til: koorData.veglenkePosisjon
            }
          ];

          _state.geometry.savingMarker = false;
          MapFunctions.removeGeom(_state);
          RegDemStore.emitChange();
        });


        break;
      case 'strekning':
        // TODO Implementer korrekt lagring av egengeometri og veglenke av strekning. Fjern også permanent inaktivt flagg på "Plasser Linje"-knapp
        break;
      case 'flate':
        // TODO Implementer korrekt lagring av egengeometri og veglenke av flate. Fjern også permanent inaktivt flagg på "Plasser Flate"-knapp
        break;
      default:

    }
  }
};

/*
===================== Actions =====================
*/

AppDispatcher.register(function(action) {
  let listPosition, _state, id, objektType, inputValue, userInput, objektTypeId;
  let selectedIndex, extraEgenskap, type, value, response, result, status;

  switch(action.actionType) {
    case RegDemConstants.actions.REGDEM_SET_OBJEKT_ID:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      id = action.id;
      setObjektID(_state, id);
      break;

    case RegDemConstants.actions.REGDEM_CLOSE_EDITOR:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      closeEditor(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_EXPAND_EDITOR:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      expandEditor(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_FETCH_OBJEKT_POSITIONS:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      fetchObjektPositions(_state);
      break;

    case RegDemConstants.actions.REGDEM_SELECT_EXTRA_EGENSKAP:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      extraEgenskap = action.extraEgenskap;
      fetchAllDataFromObjektPosition(_state, extraEgenskap);
      break;

    case RegDemConstants.actions.REGDEM_FETCH_OBJEKT_TYPES:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      objektType = action.objektType;
      fetchObjektTypes(_state, objektType);
      break;

    case RegDemConstants.actions.REGDEM_SET_INPUT_VALUE:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      inputValue = action.inputValue;
      setInputValue(_state, inputValue);
      break;

    case RegDemConstants.actions.REGDEM_EXECUTE_SEARCH:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      objektTypeId = action.objektTypeId;
      executeSearch(_state, objektTypeId);
      break;

    case RegDemConstants.actions.REGDEM_RESET_APP:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      resetApp(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_CLOSE_LIST:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      closeList(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_SHOW_LIST:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      showList(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_HIGHLIGHT_MARKER:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      id = action.id;
      highlightMarker(id);
      break;

    case RegDemConstants.actions.REGDEM_ADD_GEOM_START:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      id = action.id;
      type = action.type;
      addGeomStart(_state, id, type);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_ABORT_GEOM_ADD:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      addGeomAbort(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_ADD_GEOM_END:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      addGeomEnd(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_GET_CURRENT_LOCATION:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      getCurrentLocation(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_LOCATION_HAS_BEEN_SET:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      locationHasBeenSet(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_GO_BACK_AND_RESET:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      userInput = action.userInput;
      goBackAndReset(_state, userInput);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_VAL_MESSAGE:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      let message = action.message;
      updateValMessage(_state, message);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_ENUM_VALUE:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      id = action.id;
      value = action.value;
      updateENUMValue(_state, id, value);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_FIELD_VALUE:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      id = action.id;
      value = action.value;
      type = action.type;
      updateFieldValue(_state, id, value, type);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_VALIDATOR_RESPONSE:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      response = action.response;
      updateValidatorResponse(_state, response);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_MAKE_THIS_STATE_ACTIVE:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      makeThisStateActive(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_SET_PREV_SELECTED_INDEX:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      selectedIndex = action.selectedIndex;
      setPrevSelectedIndex(_state, selectedIndex);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_TERMINATE_STATE:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      terminateState(_state);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_WRITE_STATUS:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      status = action.status;
      updateWriteStatus(_state, status);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_PROGRESS_STATUS:
      listPosition = action.listPosition;
      _state = getStateAtIndex(listPosition);
      status = action.status;
      updateProgressStatus(_state, status);
      RegDemStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = RegDemStore;
