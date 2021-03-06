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
  handleCancel: function (e) {
    e.stopPropagation();
    RegDemActions.addGeomAbort(this.props.data.listPosition);
  },

  handleSave: function (e) {
    e.stopPropagation();
    RegDemActions.addGeomEnd(this.props.data.listPosition);
  },

  render: function() {
    let editGeometryClassName = 'edit-geometry';

    if (!this.props.data.geometry.addingMarker) {
      editGeometryClassName = ' edit-geometry-hidden';
    }

    return (
      <Card className={editGeometryClassName}>
        <CardActions>
          <FlatButton label="Lagre Plassering" primary={true} onTouchTap={this.handleSave} />
          <FlatButton label="Avbryt" onTouchTap={this.handleCancel} />
        </CardActions>
      </Card>
    );
  }
});

module.exports = EditGeometry;
