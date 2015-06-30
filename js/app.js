var React = require('react');
var Kart = require('./map.js');
var RedigerObjekt = require('./redigerObjekt.jsx');

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
      </div>
    );
  }
});

window.app = React.render(<App />, document.body);
