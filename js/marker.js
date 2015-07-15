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
    let geom = omnivore.wkt.parse(posisjon);

    geom.on('click', () => {
      RegDemActions.setObjektID(vegObjekt.objektId);
    });

    markerList[vegObjekt.objektId] = {obj:geom, type:posisjon.charAt(0)};
    markers.addLayer(geom);

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
  if(!id){
    unfocusMarker();
  } else {
    for (var i in markerList) {
        if (id != i) {
          setGeomOpacity(markerList[i].obj.getLayers()[0], 0.5, markerList[i].type);
        } else {
          setGeomOpacity(markerList[i].obj.getLayers()[0], 1, markerList[i].type);
        }
    }
  }
}

let unfocusMarker = function () {
  if(markerList) {
    for (var i in markerList) {
      setGeomOpacity(markerList[i].obj.getLayers()[0], 1, markerList[i].type);
    }
  }
}

let setGeomOpacity = function (geom, opacity, type) {
  switch (type) {
    case "P":
      geom.setOpacity(opacity);
      break;
    case "L":
    case "F":
      geom.setStyle({opacity:opacity/2}); // Linjer og Flaters default opacity er 0,5.
      break;
    default:
      break;
  }
}

let displayCurrentPosition = function (pos, kart) {
  curPosLayer.clearLayers();
  curPosLayer.addLayer(L.marker(pos.latlng, {icon: redIcon}));
  kart.addLayer(curPosLayer);
};

let addGeom = function (kart, id, type) {
  editLayer.clearLayers();
  if (type == 'marker') {
    currentEditGeom = kart.editTools.startMarker();
  } else if (type == 'strekning') {
    currentEditGeom = kart.editTools.startPolyline();
  } else {
    currentEditGeom = kart.editTools.startPolygon();
  }
};

module.exports = {
  editLayer: editLayer,
  clearMarkers: clearMarkers,
  update: update,
  displayCurrentPosition: displayCurrentPosition,
  addGeom: addGeom,
  focusMarker: focusMarker,
  unfocusMarker: unfocusMarker,
  currentEditGeom: currentEditGeom
};
