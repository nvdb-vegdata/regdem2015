let React = require('react');
let Marker = require('./marker');
let RegDemActions = require('./actions');
let Editable = require('leaflet-editable');
let mapData = null;
let locationControl = null;

let MapComponent = React.createClass({
  componentDidMount: function() {

    let L = window.L || {};

    // Spesifisering av vegkartets projeksjon
    let crs = new L.Proj.CRS('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs ',
    {
      origin: [-2500000.0, 9045984.0],
      resolutions: [
        21674.7100160867,
        10837.35500804335,
        5418.677504021675,
        2709.3387520108377,
        1354.6693760054188,
        677.3346880027094,
        338.6673440013547,
        169.33367200067735,
        84.66683600033868,
        42.33341800016934,
        21.16670900008467,
        10.583354500042335,
        5.291677250021167,
        2.6458386250105836,
        1.3229193125052918,
        0.6614596562526459,
        0.33072982812632296,
        0.1653649140631615
      ]
    });

    let kartcache = 'http://m{s}.nvdbcache.geodataonline.no/arcgis/rest/services/Trafikkportalen/GeocacheTrafikkJPG/MapServer/tile/{z}/{y}/{x}';

    // Oppsett av bakgrunnskartet
    let bakgrunnskart = new L.tileLayer(kartcache, {
      maxZoom: 17,
      maxNativeZoom: 16,
      minZoom: 3,
      subdomains: '123456789',
      continuousWorld: true,
      attribution: 'Registratordemonstrator'
    });

    mapData = L.map(React.findDOMNode(this.refs.map), {
      crs: crs,
      continuousWorld: true,
      worldCopyJump: false,
      layers: [
        bakgrunnskart
      ],
      center: [63.43, 10.40],
      zoom: 13,
      zoomControl: false,
      editable: true,
      editOptions: {
        featuresLayer: Marker.editLayer
      }
    });

    // PLassering av zoom kontrollene
    new L.Control.Zoom( {position: 'bottomleft'}).addTo(mapData);

    // Min posisjon

    locationControl = L.control.locate({
      showPopup: false,
      remainActive: true,
      onLocationError: function(err) { console.log(err.message); },
       locateOptions: {
         maxZoom: 15
       }
    }).addTo(mapData);

    locationControl.start();

    // Events
    mapData.on('locationfound', () => {
      RegDemActions.locationHasBeenSet();
    });

    mapData.on('locationerror', () => {
      RegDemActions.locationHasBeenSet();
    });

    mapData.on('moveend', () => {
      if (this.props.data.objektTypeID) {
        RegDemActions.fetchObjektPositions();
      }
    });

    mapData.on('editable:drawing:commit', (result) => {
      RegDemActions.addGeomEnd(result.layer);
    });
  },

  shouldComponentUpdate: function () {
    return false;
  },

  componentWillUnmount: function() {
    mapData = null;
  },

  render: function() {
    return (
      <div ref="map" className="kart"></div>
    );
  }
});

window.MapFunctions = {
  focusMarker: function (id) {
    Marker.focusMarker(id);
  },
  findMyPosition: function () {
    locationControl.stop();
    locationControl.start();
  },
  updateMarkers: function (searchResult, objekt, edited) {
    Marker.update(mapData, searchResult, objekt, edited);
  },
  clearMarkers: function () {
    Marker.clearMarkers();
  },
  clearEditGeom: function () {
    Marker.clearEditGeom();
  },
  getBounds: function () {
    return mapData.getBounds();
  },
  mapData: function () {
    return mapData;
  },
  addGeom: function (objektID, type) {
    Marker.addGeom(mapData, objektID, type);
  }
};

module.exports = MapComponent;
