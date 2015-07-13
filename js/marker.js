let omnivore = require('leaflet-omnivore');
let RegDemActions = require('./actions');

let L = window.L || {};

let curPosLayer = new L.FeatureGroup();
let editLayer = new L.FeatureGroup();
let currentEditGeom = null;
let markers = new L.MarkerClusterGroup({
  maxClusterRadius: 50
});

//Brukes for å mappe markers til deres IDer.
let markerList = {};
let highlightedMarker = null;

// Definerer ikon
let redIcon = L.icon({
  iconUrl: 'libs/leaflet-0.7.3/images/marker-icon-red.png',
  shadowUrl: 'libs/leaflet-0.7.3/images/marker-shadow.png'
});

let blueIcon = L.icon({
  iconUrl: 'libs/leaflet-0.7.3/images/marker-icon.png',
  shadowUrl: 'libs/leaflet-0.7.3/images/marker-shadow.png'
});

// Fjerner alle markører på kartet.
let clearMarkers = function () {
  markerList = {};
  markers.clearLayers();
  editLayer.clearLayers();
  highlightedMarker = null;
};

// Viser listen av objekter på kartet som enten punkt, linje eller flate.
let displayMarkers = function (kart, objekter) {
  objekter.forEach(function (vegObjekt) {
    let posisjon = vegObjekt.lokasjon.geometriWgs84;
    let marker = omnivore.wkt.parse(posisjon);

    marker.on('click', () => {
      RegDemActions.setObjektID(vegObjekt.objektId);
    });

    markerList[vegObjekt.objektId] = marker;
    markers.addLayer(marker);

  });
  kart.addLayer(markers);
  kart.addLayer(editLayer);
};

let update = function (kart, data) {
  clearMarkers();
  if (data.totaltAntallReturnert > 0) {
    displayMarkers(kart, data.resultater[0].vegObjekter);
  }
};

let focusMarker = function ( id ) {
  for (var i in markerList) {
    if (id != i) {
      markerList[i].getLayers()[0].setOpacity(0.3);
    }
  }
}

let unfocusMarker = function ( id ) {
  for (var i in markerList) {
    markerList[i].getLayers()[0].setOpacity(1);
  }
}

let displayCurrentPosition = function (pos, kart) {
  curPosLayer.clearLayers();
  curPosLayer.addLayer(L.marker(pos.latlng, {icon: redIcon}));
  kart.addLayer(curPosLayer);
};

let colorize = function (id) {
  if(highlightedMarker){
    highlightedMarker.setIcon(blueIcon);
  }
  if (markerList[id]) {
    highlightedMarker = markerList[id].getLayers()[0];
    highlightedMarker.setIcon(redIcon);
  }
};

let addGeom = function (kart, id) {
  editLayer.clearLayers();
  focusMarker(id);
  currentEditGeom = kart.editTools.startMarker();
};

let getEditLayer = function () {
  let that = this;
  return that.editLayer;
};

module.exports = {
  editLayer: editLayer,
  clearMarkers: clearMarkers,
  update: update,
  displayCurrentPosition: displayCurrentPosition,
  colorize: colorize,
  addGeom: addGeom,
  unfocusMarker: unfocusMarker
};
