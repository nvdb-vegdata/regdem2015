var React = require('react');
var Sok = require('../js/sok.js');
var L = window.L || {};

/* Naiv kart implementasjon
------------------------------------------------------*/
var crs = new L.Proj.CRS('EPSG:25833',
  '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs ',
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
  }
);

var kartcache = 'http://m{s}.nvdbcache.geodataonline.no/arcgis/rest/services/Trafikkportalen/GeocacheTrafikkJPG/MapServer/tile/{z}/{y}/{x}';

var bakgrunnskart = new L.tileLayer(kartcache, {
  maxZoom: 16,
  minZoom: 3,
  subdomains: '123456789',
  continuousWorld: true,
  detectRetina: true,
  attribution: 'Registratordemonstrator'
});

var kart = new L.map('kart', {
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

new L.Control.Zoom( {position: 'bottomleft'}).addTo(kart);
kart.locate({setView: true, maxZoom: 14});

L.easyButton('<i class="material-icons target">my_location</i>', function (){
  kart.locate({setView: true, maxZoom: 14});
}).addTo( kart );

React.render(<Sok.ObjektSok />, document.getElementById('sok'));
