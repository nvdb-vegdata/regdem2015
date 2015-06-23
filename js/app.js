var React = require('react');
var Select = require('react-select');

var Fetch = require('../js/fetch.js');
var L = window.L || {};


/* Naiv kart implementasjon
------------------------------------------------------*/
// Spesifisering av vegkartets projeksjon
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

// Oppsett av bakgrunnskartet
var bakgrunnskart = new L.tileLayer(kartcache, {
  maxZoom: 17,
  maxNativeZoom: 16,
  minZoom: 3,
  subdomains: '123456789',
  continuousWorld: true,
  detectRetina: true,
  attribution: 'Registratordemonstrator'
});

// Oppsett av kart
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

// PLassering av zoom kontrollene
new L.Control.Zoom( {position: 'bottomleft'}).addTo(kart);
kart.locate({setView: true, maxZoom: 14});

L.easyButton('<span class="target">&curren;</span>', function (){
  kart.locate({setView: true, maxZoom: 14});
}).addTo( kart );

/* Component
------------------------------------------------------*/
// Inkluderer komponenten for autocomplete. Brukes i søkefelt.


/* Rendering
------------------------------------------------------*/
// Henter inn alle dataobjektene som vises i søkefeltet med autocomplete
var getOptions = function(input, callback) {
  Fetch.fetchObjekttyper( function(data) {
    callback(null, {
      options: data,
      complete: true
    });
  });
};

function logChange(val) {
  console.log('Selected: ' + val);
}

var render = function () {
  // Renderer søkefeltet med autocomplete
  React.render(
    <Select
    name="sok"
    placeholder="Søk etter vegobjekt"
    asyncOptions={getOptions}
    noResultsText="Ingen treff i datakatalogen"
    searchPromptText = "Søk etter vegobjekt"
    onChange={logChange}
    />,
    document.getElementById('sok')
  );
};

render();
