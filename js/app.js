var React = require('react');
var Sok = require('../js/sok.js');

var RedigerObjekt = require('./redigerObjekt.jsx');
var Map = require('./map.js');

React.render(<Sok.ObjektSok map={Map}/>, document.getElementById('sok'));

window.visObjekt = function (objektID) {
  React.render(
    <RedigerObjekt objektID={objektID} />,
    document.getElementById('rediger-vegobjekt')
  );

  document.getElementById('rediger-vegobjekt').style.display = 'block';
};
