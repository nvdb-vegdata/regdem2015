let React = require('react');
let RegDemActions = require('./actions.js');
let mui = require('material-ui');
let { FloatingActionButton, FontIcon, CircularProgress } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Colors = mui.Styles.Colors;

let Buttons = React.createClass({
  getInitialState: function () {
    return {
      dialOpen: false
    };
  },

  handleAdd: function () {
    RegDemActions.setObjektID(-1);
  },

  handleChangeMyLocation: function () {
    RegDemActions.getCurrentLocation();
  },

  expand: function () {
    this.setState({
      dialOpen: !this.state.dialOpen
    })
  },

  showLogin: function () {

  },

  showStatus: function () {

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
                                    <FontIcon className="material-icons" color={Colors.orange700}>my_location</FontIcon>
                                </FloatingActionButton>);

    let myLocationButton = this.props.data.map.myLocation ? loadingLocationButton : passiveLocationButton;

    let dialIcon = (this.state.dialOpen)? 'clear':'keyboard_arrow_up';

    let dialButton = (<FloatingActionButton onTouchTap={this.expand}>
                     <FontIcon className="material-icons" color={Colors.white}>{dialIcon}</FontIcon>
                     </FloatingActionButton>);

    let loginButton = (<FloatingActionButton onTouchTap={this.showLogin} secondary={true} mini={true}>
                      <FontIcon className="material-icons" color={Colors.white}>vpn_key</FontIcon>
                      </FloatingActionButton>);

    let statusButton = (<FloatingActionButton onTouchTap={this.showStatus} secondary={true} mini={true}>
                      <FontIcon className="material-icons" color={Colors.white}>storage</FontIcon>
                      </FloatingActionButton>);


    let addButton = (<FloatingActionButton onTouchTap={this.handleAdd} secondary={true} mini={true}>
                      <FontIcon className="material-icons" color={Colors.white}>add</FontIcon>
                      </FloatingActionButton>);

    addButton = this.props.data.objektType ? addButton : null;

    let dialContainer = (
      <div className='mini-buttons-container'>
        <div className="buttons-button buttons-button-mini">
          {addButton}
        </div>
        <div className="buttons-button buttons-button-mini">
          {loginButton}
        </div>
        <div className="buttons-button buttons-button-mini">
          {statusButton}
        </div>
      </div>
    );

    dialContainer = this.state.dialOpen ? dialContainer : null;

    return (
      <div className="buttons-container">
        {dialContainer}
        <div className="buttons-button">
          {dialButton}
          </div>
        <div className="buttons-button">
          {myLocationButton}
        </div>
      </div>
    );
  }
});

module.exports = Buttons;
