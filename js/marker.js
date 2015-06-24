var omnivore = require('leaflet-omnivore');

var Fetch = require('./fetch.js');

var objektID;

var markers = new L.MarkerClusterGroup({
  maxClusterRadius: 50,
  disableClusteringAtZoom:16
});



function displayMarkers(kart, id) {
  var mapbox = kart.getBounds();
  Fetch.fetchAPIObjekter(id, mapbox, function(data){

    data.vegObjekter.forEach(function (vegObjekt) {
      var posisjon = vegObjekt.lokasjon.geometriWgs84;
      var marker = omnivore.wkt.parse(posisjon);
      markers.addLayer(marker);
    });

    kart.addLayer(markers);
  });
}

function clearAllMarkers() {
  markers.clearLayers();
}

module.exports.update = function (kart, id) {
  if (id) {
    objektID = id;
    clearAllMarkers();
    displayMarkers(kart, id);
  } else if (objektID) {
    clearAllMarkers();
    displayMarkers(kart, objektID);
  }
}
