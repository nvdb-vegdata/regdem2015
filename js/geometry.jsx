let React = require('react');
let RegDemActions = require('./actions.js');

let { FlatButton } = require('material-ui');

let Marker = React.createClass({
  handleClick: function () {
    RegDemActions.placeMarker();
  },

  render: function () {
    return (
      <FlatButton label="Plassér Markør" onTouchTap={this.handleClick} />
    )
  }
});

module.exports = {
  Marker: Marker
}
