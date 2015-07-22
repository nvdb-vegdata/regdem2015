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

// Get current App state
let getRegDemState = function () {
  return RegDemStore.getAll();
};

let RegDemApp = React.createClass({
  getInitialState: function() {
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
    return (
      <div>
        <EditGeometry data={this.state} />
        <Editor data={this.state} />
        <MapComponent data={this.state} />
        <Search data={this.state} />
        <List data={this.state} />
        <Buttons data={this.state} />
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
