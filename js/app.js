var React = require('react');
var Kart = require('./map.js');
var RedigerObjekt = require('./redigerObjekt.jsx');

var App = React.createClass({

window.visObjekt = function (objektID) {
  React.render(
    <RedigerObjekt objektID={objektID} />,
    document.getElementById('rediger-vegobjekt')
  );
  render: function() {
    return (
      <div>
        <Kart />
      </div>
    );
  }
});

  document.getElementById('rediger-vegobjekt').style.display = 'block';
};
window.app = React.render(<App />, document.body);
