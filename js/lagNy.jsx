let React = require('react');
let mui = require('material-ui');
let { FloatingActionButton, FontIcon, Dialog, FlatButton } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

let LagNy = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
  },

  handleTap: function () {
    if (!app.state.objektTypeID) {
      this.refs.noObjectTypeSetDialog.show();
    } else {
      app.setObjektID(-1);
    }
  },

  handleCancel: function () {
    this.refs.noObjectTypeSetDialog.dismiss();
  },

  handleOk: function () {
    this.refs.noObjectTypeSetDialog.dismiss();
    app.refs.mapAndSearch.refs.search.setFocus();
  },

  render: function() {
    let actions = [
      <FlatButton
        key={1}
        label="Avbryt"
        secondary={true}
        onTouchTap={this.handleCancel} />,
      <FlatButton
        key={2}
        label="Ok"
        primary={true}
        onTouchTap={this.handleOk}
        ref="okButton" />
    ];

    return (
      <div className="lagNy-container">
        <FloatingActionButton onTouchTap={this.handleTap}>
          <FontIcon className="material-icons add-icon" color={Colors.white}>add</FontIcon>
        </FloatingActionButton>
        <Dialog
          ref="noObjectTypeSetDialog"
          title="Du må velge objekttype"
          actions={actions}>
          For å kunne lage et nytt objekt må du først velge en objekt type fra søkefeltet. Trykk OK for å gå til søkefeltet.
        </Dialog>
      </div>
    );
  }
});

module.exports = LagNy;
