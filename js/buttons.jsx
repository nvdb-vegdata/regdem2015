let React = require('react');
let RegDemActions = require('./actions.js');
let mui = require('material-ui');
let { FloatingActionButton, FontIcon, Snackbar } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Colors = mui.Styles.Colors;

let Buttons = React.createClass({
  handleTap: function () {
    if (!this.props.data.objektTypeID) {
      this.refs.snackbar.show();
    } else {
      RegDemActions.setObjektID(-1);
    }
  },

  handleAction: function () {
    this.refs.snackbar.dismiss();
  },

  render: function() {
    return (
      <div className="buttons-container">
        <FloatingActionButton onTouchTap={this.handleTap}>
          <FontIcon className="material-icons add-icon" color={Colors.white}>add</FontIcon>
        </FloatingActionButton>
        <Snackbar
          ref="snackbar"
          message="Du må først velge en objekttype fra søkefeltet"
          action="Ok"
          onActionTouchTap={this.handleAction} />
      </div>
    );
  }
});

module.exports = Buttons;
