let React = require('react');
let mui = require('material-ui');

var ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

let MapComponent = require('./map.js');
let Editor = require('./editor.jsx');
let EditGeometry = require('./editGeometry.jsx');
let List = require('./list.jsx');
let Search = require('./search.jsx');
let Buttons = require('./buttons.jsx');
let RegDemStore = require('./store.js');

// For React developer tools
window.React = React;

let getRegDemState = function () {
  return {
    active: RegDemStore.getActiveState(),
    inactive: RegDemStore.getInactiveState(),
    all: RegDemStore.getAll()
  };
};

let RegDemApp = React.createClass({
  getInitialState: function () {
    return getRegDemState();
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() {
    ThemeManager.setPalette({
      primary1Color: '#008ec2',
      primary2Color: '#008ec2',
      primary3Color: '#008ec2',
      accent1Color: '#008ec2'
    });
  },

  componentDidMount: function () {
    RegDemStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    RegDemStore.removeChangeListener(this._onChange);
  },

  render: function() {
    let numberOfInactive = this.state.inactive.length;

    return (
      <div>
        <div>
        {
          this.state.all.map((obj) => {
            let inactiveNumber = obj.listPosition + (this.state.active.listPosition <= obj.listPosition ? -1 : 0);
            return (<Editor data={obj} numberOfInactive={numberOfInactive} inactiveNumber={inactiveNumber} key={'listNo-' + obj.listPosition} />);
          })
        }
        </div>
        <MapComponent data={this.state.active} />
        <Search data={this.state.active} />
        <List data={this.state.active} />
        <Buttons data={this.state.active} />
        <EditGeometry data={this.state.active} />
      </div>
    );
  },

  _onChange: function() {
    this.setState(getRegDemState());
  }
});

RegDemApp.childContextTypes = {
  muiTheme: React.PropTypes.object
};

React.render(<RegDemApp />, document.body);
