let React = require('react');
let RegDemActions = require('./actions.js');

let { FlatButton } = require('material-ui');

let Marker = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektID);
  },

  render: function () {
    return (
      <FlatButton label="Plassér Markør" onTouchTap={this.handleClick} />
    );
  }
});

let Strekning = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektID);
  },

  render: function () {
    return (
      <FlatButton label="Plassér Strekning" onTouchTap={this.handleClick} />
    );
  }
});

let Flate = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektID);
  },

  render: function () {
    return (
      <FlatButton label="Plassér Flate" onTouchTap={this.handleClick} />
    );
  }
});

module.exports = {
  Marker: Marker,
  Strekning: Strekning,
  Flate: Flate
};
