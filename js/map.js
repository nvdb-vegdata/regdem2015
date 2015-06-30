var React = require('react');
let Marker = require('./marker.js');
var Sok = require('./sok.js');

let Kart = React.createClass({
  componentDidMount: function() {
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
      maxZoom: 17,
      maxNativeZoom: 16,
      minZoom: 3,
      subdomains: '123456789',
      continuousWorld: true,
      detectRetina: true,
      attribution: 'Registratordemonstrator'
    });

    let kartData = this.kartData = L.map(React.findDOMNode(this.refs.kart), {
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
    new L.Control.Zoom( {position: 'bottomleft'}).addTo(this.kartData);
    this.kartData.locate({setView: true, maxZoom: 14});

    this.kartData.on('moveend', function() {
      Marker.update(this);
    });

    // Plassering av min poisisjon-knapp
    L.easyButton('<i class="material-icons target">my_location</i>', function () {
      this.kartData.locate({setView: true, maxZoom: 14});
    }).addTo( this.kartData );
  },

  componentWillUnmount: function() {
    this.kartData = null;
  },

  updateMarkers: function (sok, id) {
    Marker.update(this.kartData, id);
  },

  render: function() {
    return (
      <div>
        <Sok updateMarkers={this.updateMarkers} />
        <div ref="kart" className="kart"></div>
      </div>
    );
  }
});

module.exports = Kart;
