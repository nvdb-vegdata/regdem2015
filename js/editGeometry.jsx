let React = require('react');
let RegDemActions = require('./actions');
let { Card, CardActions, FlatButton } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let EditGeometry = React.createClass({
  handleCancel: function () {
    RegDemActions.abortGeomAdd();
  },

  handleSave: function () {
    RegDemActions.addGeomEnd(null);
  },

  render: function() {
    if (!this.props.data.geometry.addingMarker) {
      return null;
    }

    return (
      <Card className="edit-geometry">
        <CardActions>
          <FlatButton label="Avbryt" onTouchTap={this.handleCancel} />
          <FlatButton label="Lagre Plassering" primary={true} onTouchTap={this.handleSave} />
        </CardActions>
      </Card>
    );
  }
});

module.exports = EditGeometry;
