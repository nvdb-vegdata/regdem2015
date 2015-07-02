var React = require('react');
var Kart = require('./map.js');
var RedigerObjekt = require('./redigerObjekt.jsx');
let LagNy = require('./lagNy.jsx');

// For React developer tools
window.React = React;

var App = React.createClass({
  getInitialState: function() {
    return {
      objektID: null
    };
  },

  setObjektID: function (id) {
    this.setState({objektID: id});
  },

  render: function() {
    return (
      <div>
        <RedigerObjekt objektID={this.state.objektID} />
        <Kart />
        <LagNy />
      </div>
    );
  }
});

window.app = React.render(<App />, document.body);
