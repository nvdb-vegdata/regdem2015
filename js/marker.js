var omnivore = require('leaflet-omnivore');

var objektID = null;
var curPosLayer = new L.FeatureGroup();
var markers = new L.MarkerClusterGroup({
  maxClusterRadius: 30
});

// Fjerner alle markører på kartet.
function clearMarkers() {
  markers.clearLayers();
}

// Viser listen av objekter på kartet som enten punkt, linje eller flate.
function displayMarkers(kart, objekter) {
  objekter.forEach(function (vegObjekt) {
    var posisjon = vegObjekt.lokasjon.geometriWgs84;
    var marker = omnivore.wkt.parse(posisjon);

    marker.on('click', () => {
      app.setObjektID(vegObjekt.objektId);
    });

    markers.addLayer(marker);
  });

  kart.addLayer(markers);
}

let update = function (kart, data, callback) {
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
}
