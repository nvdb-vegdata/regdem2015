var omnivore = require('leaflet-omnivore');
let RegDemActions = require('./actions');

var curPosLayer = new L.FeatureGroup();
var markers = new L.MarkerClusterGroup({
  maxClusterRadius: 50
});
//Brukes for å mappe markers til deres IDer.
var markerList = {};
var highlightedMarker = null;

// Fjerner alle markører på kartet.
let clearMarkers = function () {
  markerList = {};
  markers.clearLayers();
  highlightedMarker = null;
};

// Viser listen av objekter på kartet som enten punkt, linje eller flate.
let displayMarkers = function (kart, objekter) {
  objekter.forEach(function (vegObjekt) {
    var posisjon = vegObjekt.lokasjon.geometriWgs84;
    var marker = omnivore.wkt.parse(posisjon);

    marker.on('click', () => {
      RegDemActions.setObjektID(vegObjekt.objektId);
    });

    markerList[vegObjekt.objektId] = marker;
    markers.addLayer(marker);

  });
  kart.addLayer(markers);
};

let update = function (kart, data) {
  clearMarkers();
  if (data.totaltAntallReturnert > 0) {
    displayMarkers(kart, data.resultater[0].vegObjekter);
  }
};

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

let redIcon = L.icon({
  iconUrl: 'libs/leaflet-0.7.3/images/marker-icon-red.png',
  shadowUrl: 'libs/leaflet-0.7.3/images/marker-shadow.png',
});

let blueIcon = L.icon({
  iconUrl: 'libs/leaflet-0.7.3/images/marker-icon.png',
  shadowUrl: 'libs/leaflet-0.7.3/images/marker-shadow.png',
});

module.exports = {
  clearMarkers: clearMarkers,
  update: update,
  displayCurrentPosition: displayCurrentPosition,
  colorize: colorize
};
