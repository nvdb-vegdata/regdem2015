let React = require('react');
let RegDemActions = require('./actions.js');

let { FlatButton } = require('material-ui');

let Marker = React.createClass({

  getInitialState: function () {
    return {
      markerPlaced: false,
      currentMarker: null
    };
  },

  handleClick: function () {
    RegDemActions.addGeomStart();
    this.setMarkerPlaced(true);
  },

  setMarkerPlaced: function (value) {
    this.setState({
      markerPlaced: value
    });
  },

  render: function () {
    return (
      <FlatButton label="Plassér Markør" onTouchTap={this.handleClick} />
    );
  }
});

module.exports = {
  Marker: Marker
};
