let omnivore = require('leaflet-omnivore');
let RegDemActions = require('./actions');

let L = window.L || {};
let MapFunctions = window.MapFunctions || {};

let editLayer = new L.FeatureGroup();
let currentEditGeom = null;
let markers = new L.MarkerClusterGroup({
  maxClusterRadius: 50
});

//Brukes for å mappe markers til deres IDer.
let markerList = {};

// Definerer ikon
let redIcon = L.icon({
  iconUrl: 'libs/leaflet-0.7.3/images/marker-icon-red.png',
  shadowUrl: 'libs/leaflet-0.7.3/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],

  shadowSize: [41, 41]
});

// Fjerner alle markører på kartet.
let clearMarkers = function () {
  markerList = {};
  markers.clearLayers();
};

let clearEditGeom = function () {
  editLayer.clearLayers();
};

let focusMarker = function ( id ) {
  if(!id){
    unfocusMarker();
  } else {
    for (var i in markerList) {
        if (parseInt(id) !== parseInt(i)) {
          setGeomOpacity(markerList[i].obj.getLayers()[0], 0.5, markerList[i].type);
        } else {
          setGeomOpacity(markerList[i].obj.getLayers()[0], 1, markerList[i].type);
        }
    }
  }
};

// Viser listen av objekter på kartet som enten punkt, linje eller flate.
let displayMarkers = function (kart, state) {

  let objekter = state.searchResults.resultater[0].vegObjekter;
  let addingMarker = state.geometry.addingMarker;
  let savingMarker = state.geometry.savingMarker;

  let activeObjekt = state.objektEdited ? state.objektEdited : (state.objekt ? state.objekt : null);
  let activeObjektId = activeObjekt ? activeObjekt.objektId : null;

  let onClickMarker = (vegObjekt) => {
    RegDemActions.setObjektID(state.listPosition, vegObjekt.objektId);
  };

  for (let index in objekter) {
    let vegObjekt = objekter[index];
    if ((addingMarker && activeObjektId && vegObjekt.objektId === activeObjektId) || (savingMarker && vegObjekt.objektId === activeObjektId)) {
      continue;
    }

    if (vegObjekt.objektId === activeObjektId) {
      vegObjekt = activeObjekt;
    }
    let posisjon = vegObjekt.lokasjon.geometriWgs84;
    let geom = omnivore.wkt.parse(posisjon);

    geom.on('click', onClickMarker.bind(null, vegObjekt));

    markerList[vegObjekt.objektId] = {obj: geom, type: posisjon.charAt(0)};
    markers.addLayer(geom);
  }

  if (activeObjektId === -1 && activeObjekt.lokasjon.geometriWgs84 && !addingMarker && !savingMarker) {
    let posisjon = activeObjekt.lokasjon.geometriWgs84;
    let geom = omnivore.wkt.parse(posisjon);

    geom.on('click', () => {
      RegDemActions.setObjektID(state.listPosition, activeObjekt.objektId);
    });

    markerList[activeObjekt.objektId] = {obj: geom, type: posisjon.charAt(0)};
    markers.addLayer(geom);
  }

  kart.addLayer(markers);
  focusMarker(activeObjektId);
  kart.addLayer(editLayer);
};

// ObjektID brukes for å håndtere opacity-endringer.
let update = function (kart, state) {
  clearMarkers();
  if (state.searchResults && state.searchResults.totaltAntallReturnert > 0) {
    displayMarkers(kart, state);
  }
};

let unfocusMarker = function () {
  if(markerList) {
    for (var i in markerList) {
      setGeomOpacity(markerList[i].obj.getLayers()[0], 1, markerList[i].type);
    }
  }
};

let centerAroundMarker = function (id) {
  for (var i in markerList) {
      if (parseInt(id) === parseInt(i)) {
        MapFunctions.mapData().panTo(markerList[i].obj.getLayers()[0]._latlng);
        break;
      }
  }
};

let setGeomOpacity = function (geom, opacity, type) {
  switch (type) {
    case 'P':
      geom.setOpacity(opacity);
      break;
    case 'L':
    case 'F':
      geom.setStyle({opacity: opacity / 2}); // Linjer og Flaters default opacity er 0,5.
      break;
    default:
      break;
  }
};

let addGeom = function (kart, type, state) {
  editLayer.clearLayers();
  if (type === 'marker') {

    kart.options.scrollWheelZoom = 'center';
    kart.options.doubleClickZoom = 'center';

    centerAroundMarker(state.geometry.current);
    currentEditGeom = L.marker(kart.getCenter(), {icon: redIcon}).addTo(kart);
    update(kart, state);
  } else if (type === 'strekning') {
    currentEditGeom = kart.editTools.startPolyline();
  } else {
    currentEditGeom = kart.editTools.startPolygon();
  }
};

let removeGeom = function (kart, state) {
  kart.options.scrollWheelZoom = true;
  kart.options.doubleClickZoom = true;

  if (currentEditGeom) {
    kart.removeLayer(currentEditGeom);
    currentEditGeom = null;
  }

  update(kart, state);
};

let returnCurrentEditGeom = function () {
  return currentEditGeom;
};

module.exports = {
  editLayer: editLayer,
  clearMarkers: clearMarkers,
  clearEditGeom: clearEditGeom,
  update: update,
  addGeom: addGeom,
  removeGeom: removeGeom,
  focusMarker: focusMarker,
  unfocusMarker: unfocusMarker,
  currentEditGeom: returnCurrentEditGeom
};
