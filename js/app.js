let React = require('react');

let Map = require('./map.js');
let Editor = require('./editor.jsx');
let List = require('./list.jsx');
let Search = require('./search.js');
let Buttons = require('./buttons.jsx');
let RegDemStore = require('./store');

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

  componentDidMount: function () {
    RegDemStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    RegDemStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div>
        <Editor data={this.state} />
        <Map data={this.state} />
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

React.render(<RegDemApp />, document.body);
