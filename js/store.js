let AppDispatcher = require('./dispatcher');
let EventEmitter = require('events').EventEmitter;
let assign = require('object-assign');

let RegDemConstants = require('./constants');
let omnivore = require('leaflet-omnivore');
let Helper = require('./helper.js');
let Fetch = require('./fetch.js');

let CHANGE_EVENT = 'change';

let _state = {
  // APP
  objektId: null,
  objektTypeId: null,

  // Hele objektet
  objekt: null,
  objektEdited: null,
  // Hele objektType
  objektType: null,
  objektEdited: null,

  searchResults: null,
  searchResultsFull: null,

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
    open: false,
    extraEgenskap: null,
    highlighted: null
  },

  map: {
    myLocation: true
  },

  geometry: {
    addingMarker: false,
    current: null,
    result: null,
    // [marker | strekning | flate]
    resultType: null
  }
};

let simpleDeepCopy = function (oldObject) {
  return JSON.parse(JSON.stringify(oldObject));
};

let _initialState = simpleDeepCopy(_state);

let RegDemStore = assign({}, EventEmitter.prototype, {
  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function () {
    return _state;
  },

  emitChange: function () {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function (callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

/* Helpers for actions */

let fetchObjektTypeData = function () {
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

let fetchObjektData = function () {
  Fetch.fetchObjekt(_state.objektId, (objektData) => {
    _state.objekt = objektData;
    _state.objektEdited = null;

    fetchObjektTypeData();
  });
};

let getNewData = function () {
  // Skal vi lage nytt objekt?
  if (_state.objektId === -1) {
    // Har vi oppgitt
    if (_state.objektTypeId) {
      // Nullstiller objekt, siden vi skal lage et nytt objekt
      _state.objekt = null;
      // Lager et objektEdited-objekt med enkel struktur
      createObjektEdited();

      _state.editor.loading = true;
      RegDemStore.emitChange();

      fetchObjektTypeData();
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

      fetchObjektData();
    }
  }
};

/* Funksjoner for actions */

let setObjektID = function (objektId) {
  if (objektId) {
    _state.objektId = objektId;
    MapFunctions.focusMarker(objektId);
    MapFunctions.clearEditGeom();
    closeList();
    getNewData();
  }
};

let closeEditor = function () {
  _state.objektId = null;
  _state.objekt = null;
  _state.objektEdited = null;

  _state.editor.loading = false;
  _state.editor.expanded = false;

  _state.geometry.result = null;
  _state.geometry.resultType = null;

  MapFunctions.clearEditGeom(); // Fjerner edit-objekt ved lukking av editor.
  MapFunctions.focusMarker(null);
};

let expandEditor = function () {
  _state.editor.expanded = true;
};

let fetchObjektPositions = function () {
  _state.search.loading = true;
  RegDemStore.emitChange();

  let id = _state.objektTypeId;

  if (MapFunctions.mapData()) {
    var mapbox = MapFunctions.getBounds();

    Fetch.fetchAPIObjekter(id, mapbox, (data) => {
      _state.searchResults = data;
      _state.searchResultsFull = null;
      _state.search.loading = false;

      MapFunctions.updateMarkers(data, _state.objekt, _state.objektEdited);

      RegDemStore.emitChange();
    });
  }
};

let fetchAllDataFromObjektPosition = function (extraEgenskap) {
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

let fetchObjektTypes = function (objektType) {
  _state.search.loading = true;
  RegDemStore.emitChange();

  Fetch.fetchObjektTypes( objektType, function(data) {
    _state.search.options = data;
    _state.search.loading = false;
    RegDemStore.emitChange();
  });
};

let setInputValue = function (inputValue) {
  _state.search.inputValue = inputValue;
  RegDemStore.emitChange();
};

let executeSearch = function (objektTypeId) {
  _state.objektId = null;
  _state.objekt = null;
  _state.objektEdited = null;

  _state.objektTypeId = objektTypeId;
  _state.objektType = null;

  fetchObjektTypeData();

  fetchObjektPositions();
};

let resetApp = function () {
  MapFunctions.clearMarkers();
  MapFunctions.clearEditGeom();
  _state = simpleDeepCopy(_initialState);
  _state.map.myLocation = false;
};

let goBackAndReset = function (userInput) {
  let oldSearchState = simpleDeepCopy(_state.search);
  resetApp();
  _state.search = oldSearchState;
  _state.search.inputValue = userInput;
};

let closeList = function () {
  _state.list.open = false;
};

let showList = function () {
  if (_state.objektId) {
    closeEditor();
  }
  _state.list.open = !_state.list.open;
};

let highlightMarker = function (id) {
  MapFunctions.focusMarker(id);
};

let addGeomStart = function (id, type) {
  if (!_state.search.loading) {
    _state.geometry.addingMarker = true;
    _state.geometry.current = id;
    _state.geometry.resultType = type;
    MapFunctions.addGeom(id, type);
  }
};

let addGeomEnd = function (result) {
  _state.geometry.result = result;
  _state.geometry.addingMarker = false;
  updateEditedLocation();
};

let getCurrentLocation = function () {
  _state.map.myLocation = true;
  MapFunctions.findMyPosition();
};

let locationHasBeenSet = function () {
  _state.map.myLocation = false;
};

let updateValidatorResponse = function (response) {
}


// Initaliserer skaping av objektEdited.
let createObjektEdited = function () {
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

let findiEgenskapByString = function (egenskap) {
  let returnEgenskap = null;
  _state.objektType.egenskapsTyper.every((element, index, array) => {
    if (element.navn.toLowerCase().includes(egenskap)) {
      returnEgenskap = element;
      return false;
    }
    return true;
  });

  return returnEgenskap;
};

let findEnumValueFromObjektType = function (egenskapFromObjektType, egenskapsId, enumId) {
  if (egenskapFromObjektType.type === "ENUM") {
    for (var testEnumId in egenskapFromObjektType.enumVerdier) {
      if (String(testEnumId) === String(enumId)) {
        return egenskapFromObjektType.enumVerdier[enumId];
      }
    }
  }

  return null;
};

let findEgenskapInObjektType = function (egenskapsId) {
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

let findPositionToEgenskapInObjektEdited = function (egenskapsId) {
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
let updateENUMValue = function (egenskapsId, enumObj) {
  // Eksempel
  // {
  //     "id": 8074,
  //     "navn": "Vedlikeholdsansvarlig",
  //     "verdi": "Statens vegvesen",
  //     "enumVerdi": {
  //       "id": 10468,
  //       "kortVerdi": "SvV",
  //       "verdi": "Statens vegvesen",
  //       "sorteringsnummer": 1
  //     }
  //   },

  if (!_state.objektEdited) {
    createObjektEdited();
  }

  // Initaliserer verdier
  let enumId = enumObj.payload;
  let enumVerdi = enumObj.text;

  let egenskapFromObjektType = findEgenskapInObjektType(egenskapsId);
  let enumVerdiFromObjektType = findEnumValueFromObjektType(egenskapFromObjektType, egenskapsId, enumId);

  if (enumVerdiFromObjektType) {
    let newValue = {
      id: egenskapsId,
      navn: egenskapFromObjektType.navn,
      verdi: enumVerdi,
      enumVerdi: enumVerdiFromObjektType
    };

    let egenskapPositionFromObjektEdited = findPositionToEgenskapInObjektEdited(egenskapsId);
    _state.objektEdited.egenskaper[egenskapPositionFromObjektEdited] = newValue;
  }

};

let updateFieldValue = function (egenskapsId, fieldValue, fieldType) {
  // Eksempel
  // Tekst
  // {
  //   "id": 1078,
  //   "navn": "Navn bomstasjon",
  //   "verdi": "Tempevegen"
  // },

  // Tall
  // {
  //   "id": 1819,
  //   "navn": "Takst stor bil",
  //   "verdi": "24.0",
  //   "enhet": {
  //     "id": 19,
  //     "navn": "Kroner",
  //     "kortNavn": "Kr"
  //   }
  // },

  // Tid
  // {
  //   "id": 9405,
  //   "navn": "Utgår_Rushtid ettermiddag, fra",
  //   "verdi": "15:00"
  // },

  // Dato
  // {
  //   "id": 5127,
  //   "navn": "Gyldig fra dato",
  //   "verdi": "1980-01-01"
  // }

  if (!_state.objektEdited) {
    createObjektEdited();
  }

  let egenskapFromObjektType = findEgenskapInObjektType(egenskapsId);

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


    let egenskapPositionFromObjektEdited = findPositionToEgenskapInObjektEdited(egenskapsId);
    _state.objektEdited.egenskaper[egenskapPositionFromObjektEdited] = newValue;
  }

};

let updateEditedLocation = function () {
  if (!_state.objektEdited) {
    createObjektEdited();
  }

  if (_state.geometry.result) {
    switch (_state.geometry.resultType) {
      case 'marker':
        let lng = _state.geometry.result._latlng.lng;
        let lat = _state.geometry.result._latlng.lat;

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
        });

        // Egengeometri
        let geometriEgenskap = findiEgenskapByString('geometri, punkt');
        let WGS84ToUTM33 = proj4('+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs', [lng, lat]);

        if (geometriEgenskap) {
          let newValue = {
            id: geometriEgenskap.id,
            navn: geometriEgenskap.navn,
            verdi: 'POINT (' + WGS84ToUTM33[0] + ' ' + WGS84ToUTM33[1] + ')'
          };

          let egenskapPositionFromObjektEdited = findPositionToEgenskapInObjektEdited(geometriEgenskap.id);
          _state.objektEdited.egenskaper[egenskapPositionFromObjektEdited] = newValue;
        }

        break;
      default:

    }
  }
};

// Register callback to handle all updates
AppDispatcher.register(function(action) {
  let id, objektType, inputValue, userInput, objektTypeId, extraEgenskap, type, value, response;

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
      fetchObjektPositions();
      break;

    case RegDemConstants.actions.REGDEM_SELECT_EXTRA_EGENSKAP:
      extraEgenskap = action.extraEgenskap;
      fetchAllDataFromObjektPosition(extraEgenskap);
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
      objektTypeId = action.objektTypeId;
      executeSearch(objektTypeId);
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

    case RegDemConstants.actions.REGDEM_HIGHLIGHT_MARKER:
      id = action.id;
      highlightMarker(id);
      break;

    case RegDemConstants.actions.REGDEM_ADD_GEOM_START:
      id = action.id;
      type = action.type;
      addGeomStart(id, type);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_ADD_GEOM_END:
      let result = action.result;
      addGeomEnd(result);
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

    case RegDemConstants.actions.REGDEM_GO_BACK_AND_RESET:
      userInput = action.userInput;
      goBackAndReset(userInput);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_ENUM_VALUE:
      id = action.id;
      value = action.value;
      updateENUMValue(id, value);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_FIELD_VALUE:
      id = action.id;
      value = action.value;
      type = action.type;
      updateFieldValue(id, value, type);
      RegDemStore.emitChange();
      break;

    case RegDemConstants.actions.REGDEM_UPDATE_VALIDATOR_RESPONSE:
      response = action.response;
      updateValidatorResponse(response);
      RegDemStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = RegDemStore;
