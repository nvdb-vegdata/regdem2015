let React = require('react');
let Kart = require('./map.js');
let RedigerObjekt = require('./redigerObjekt.jsx');
let List = require('./list.jsx');
let LagNy = require('./lagNy.jsx');

// For React developer tools
window.React = React;

let App = React.createClass({
  getInitialState: function() {
    return {
      objektID: null,
      objektTypeID: null
    };
  },

  setObjektID: function (id) {
    this.setState({objektID: id});
  },

  setObjektTypeID: function (id) {
    this.setState({objektTypeID: id});
  },

  setObjektAndObjektTypeID: function (objektID, objektTypeID) {
    this.setState({
      objektID: objektID,
      objektTypeID: objektTypeID
    });
  },

  render: function() {
    return (
      <div>
        <RedigerObjekt objektID={this.state.objektID} objektTypeID={this.state.objektTypeID} />
        <Kart ref="mapAndSearch" objektID={this.state.objektID} objektTypeID={this.state.objektTypeID} />
        <List ref="list" objektTypeID={this.state.objektTypeID} />
        <LagNy />
      </div>
    );
  }
});

window.app = React.render(<App />, document.body);
