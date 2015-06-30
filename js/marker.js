var omnivore = require('leaflet-omnivore');

var Fetch = require('./fetch.js');

var objektID = null;
var markers = new L.MarkerClusterGroup({
  maxClusterRadius: 50,
  disableClusteringAtZoom:16 // Ved bunn av zoom, vil clustering slås av.
});

// Tar inn kart og objektID, fetcher objekter og viser på kart.
function updateMarkers(kart, id) {
  var mapbox = kart.getBounds();

  Fetch.fetchAPIObjekter(id, mapbox, function(data){
    clearMarkers();
    displayMarkers(kart, data.vegObjekter);
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

module.exports.update = function (kart, id) {
  if (id) {
    objektID = id;
    updateMarkers(kart, id);
  } else if (objektID) {
    updateMarkers(kart, objektID);
  }
}
