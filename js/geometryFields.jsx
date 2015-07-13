let React = require('react');
let RegDemActions = require('./actions.js');

let { FlatButton } = require('material-ui');

let Marker = React.createClass({

  getInitialState: function () {
    return {
      markerPlaced: false,
      currentMarkerID: this.props.objektID
    };
  },

  handleClick: function () {
    this.setMarkerPlaced(true);
    RegDemActions.addGeomStart(this.props.objektID);
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
