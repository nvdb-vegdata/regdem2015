var omnivore = require('leaflet-omnivore');
let RegDemActions = require('./actions');

var curPosLayer = new L.FeatureGroup();
var markers = new L.MarkerClusterGroup({
  maxClusterRadius: 50
});

// Fjerner alle markører på kartet.
let clearMarkers = function () {
  markers.clearLayers();
};

// Viser listen av objekter på kartet som enten punkt, linje eller flate.
let displayMarkers = function (kart, objekter) {
  objekter.forEach(function (vegObjekt) {
    var posisjon = vegObjekt.lokasjon.geometriWgs84;
    var marker = omnivore.wkt.parse(posisjon);

    marker.on('click', () => {
      RegDemActions.setObjektID(vegObjekt.objektId);
    });

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
  curPosLayer.addLayer(L.marker(pos.latlng));
  kart.addLayer(curPosLayer);
};

module.exports = {
  clearMarkers: clearMarkers,
  update: update,
  displayCurrentPosition: displayCurrentPosition
};
