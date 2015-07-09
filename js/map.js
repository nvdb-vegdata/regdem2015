let React = require('react');
let Marker = require('./marker');
let RegDemActions = require('./actions');

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
        0.33072982812632296
      ]
    });

    let kartcache = 'http://m{s}.nvdbcache.geodataonline.no/arcgis/rest/services/Trafikkportalen/GeocacheTrafikkJPG/MapServer/tile/{z}/{y}/{x}';

    // Oppsett av bakgrunnskartet
    let bakgrunnskart = new L.tileLayer(kartcache, {
      maxZoom: 16,
      minZoom: 3,
      subdomains: '123456789',
      continuousWorld: true,
      attribution: 'Registratordemonstrator'
    });

    this.mapData = L.map(React.findDOMNode(this.refs.map), {
      crs: crs,
      continuousWorld: true,
      worldCopyJump: false,
      layers: [
        bakgrunnskart
      ],
      center: [63.43, 10.40],
      zoom: 13,
      zoomControl: false
    });

    // PLassering av zoom kontrollene
    new L.Control.Zoom( {position: 'bottomleft'}).addTo(this.mapData);

    this.mapData.locate({setView: true, maxZoom: 15});

    this.mapData.on('locationfound', (e) => {
      Marker.displayCurrentPosition(e, this.mapData);
      RegDemActions.locationHasBeenSet();
    });

    this.mapData.on('locationerror', () => {
      RegDemActions.locationHasBeenSet();
    });

    // Legg mapData inn som referanse i store
    RegDemActions.addMapDataAsReference(this.mapData);

    this.mapData.on('moveend', () => {
      if (this.props.data.objektTypeID) {
        RegDemActions.fetchObjektPositions(null);
      }
    });
  },

  componentWillReceiveProps: function (nextProps) {
    var wasHighlighted = this.props.data.list.highlighted;

    if (this.props.data.searchResults !== nextProps.data.searchResults && nextProps.data.searchResults == null) {
      Marker.clearMarkers();
    } else if (this.props.data.searchResults !== nextProps.data.searchResults) {
      Marker.update(this.mapData, nextProps.data.searchResults);
    }

    if(nextProps.data.list.highlighted && nextProps.data.list.higlighted !== wasHighlighted) {
      Marker.colorize(nextProps.data.list.highlighted);
    }

    if (nextProps.data.map.myLocation) {
      this.mapData.locate({setView: true, maxZoom: 15});
    }
  },

  componentWillUnmount: function() {
    this.mapData = null;
  },

  render: function() {
    return (
      <div ref="map" className="kart"></div>
    );
  }
});

module.exports = MapComponent;
