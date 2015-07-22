let React = require('react');
let RegDemActions = require('./actions.js');
let mui = require('material-ui');
let { FloatingActionButton, FontIcon, CircularProgress } = require('material-ui');

let Colors = mui.Styles.Colors;

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Buttons = React.createClass({
  handleAdd: function () {
    RegDemActions.setObjektID(-1);
  },

  handleChangeMyLocation: function () {
    RegDemActions.getCurrentLocation();
  },

  render: function() {
    let loadingLocationButton = (<FloatingActionButton className="buttons-button-my-location">
                                    <CircularProgress
                                      mode="indeterminate"
                                      size={0.4}
                                      className="buttons-my-location-loading"
                                    />
                                </FloatingActionButton>);

    let passiveLocationButton = (<FloatingActionButton onTouchTap={this.handleChangeMyLocation} className="buttons-button-my-location">
                                    <FontIcon className="material-icons" color="#008ec2">my_location</FontIcon>
                                </FloatingActionButton>);

    let myLocationButton = this.props.data.map.myLocation ? loadingLocationButton : passiveLocationButton;


    let addButton = (<FloatingActionButton onTouchTap={this.handleAdd}>
                      <FontIcon className="material-icons" color={Colors.white}>add</FontIcon>
                    </FloatingActionButton>);

    addButton = (this.props.data.objektType && !this.props.data.geometry.addingMarker) ? addButton : null;

    return (
      <div className="buttons-container">
        <div className="buttons-button">
          {myLocationButton}
        </div>
        <div className="buttons-button">
          {addButton}
        </div>
      </div>
    );
  }
});

module.exports = Buttons;
