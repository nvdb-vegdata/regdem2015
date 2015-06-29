var React = require('react');
var Select = require('react-select');
var RedigerObjekt = require('./redigerObjekt.jsx');
var Fetch = require('./fetch.js');
var Map = require('./map.js');
var Marker = require('./marker.js');

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


var render = function () {
  // Renderer søkefeltet med autocomplete
  React.render(
    <Select
    name="sok"
    placeholder="Søk etter vegobjekt"
    asyncOptions={getOptions}
    noResultsText="Ingen treff i datakatalogen"
    searchPromptText = "Søk etter vegobjekt"
    onChange={Marker.update.bind(null, Map.kart)}
    />,
    document.getElementById('sok')
  );
};

window.visObjekt = function (objektID) {
  React.render(
    <RedigerObjekt objektID={objektID} />,
    document.getElementById('rediger-vegobjekt')
  );

  document.getElementById('rediger-vegobjekt').style.display = 'block';
};

render();
