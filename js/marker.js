var omnivore = require('leaflet-omnivore');

var Fetch = require('./fetch.js');

var objektID = null;
var curPosLayer = new L.FeatureGroup();
var markers = new L.MarkerClusterGroup({
  maxClusterRadius: 30
});

// Tar inn kart og objektID, fetcher objekter og viser på kart.
function updateMarkers(kart, id, callback) {
  var mapbox = kart.getBounds();

  Fetch.fetchAPIObjekter(id, mapbox, function(data){
    clearMarkers();
    displayMarkers(kart, data.vegObjekter);
    callback();
  });
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

// Fjerner alle markører på kartet.
function clearMarkers() {
  markers.clearLayers();
}

module.exports.update = function (kart, id, callback) {
  if (id) {
    objektID = id;
    updateMarkers(kart, id, callback);
  } else if (objektID) {
    updateMarkers(kart, objektID, callback);
  }
}

module.exports.displayCurrentPosition = function (pos, kart) {
  curPosLayer.clearLayers();
  curPosLayer.addLayer(L.marker(pos.latlng));
  kart.addLayer(curPosLayer);
}
