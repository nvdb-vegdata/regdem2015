var React = require('react');
var Typeahead = require('react-typeahead-component');

var Fetch = require('./fetch.js');
var Marker = require('./marker.js');
var OptionTemplate = require('./optiontemplate.jsx');

module.exports.ObjektSok = React.createClass({
  getInitialState: function() {
    return {
      inputValue: '',
      options: []
    };
  },

  render: function() {
    return (
      <div>
      <i className="material-icons search-icon">search</i>
      <Typeahead
      inputValue={this.state.inputValue}
      options={this.state.options}
      onChange={this.handleChange}
      optionTemplate={OptionTemplate}
      onOptionChange={this.handleOptionChange}
      onOptionClick={this.handleOptionClick}
      onKeyDown={this.handleKeyDown}
      />
      {this.renderRemoveIcon()}
      </div>
    );
  },

  renderRemoveIcon: function() {
    if(this.state.inputValue.length > 0) {
      return (
        <i
        onClick={this.handleRemoveClick}
        className="material-icons clear-icon">clear</i>
      );
    }

  },

  handleChange: function(event) {
    var value = event.target.value;
    this.setInputValue(value);
    this.getOptions(value);
  },

  getOptions: function(input) {
    var that = this;
    Fetch.fetch( input, function(data) {
      that.setOptions(data);
    });

  },

  handleOptionChange: function(event, option) {
    this.setInputValue(option.label);
  },

  handleOptionClick: function(event, option) {
    this.setInputValue(option.label);
    Marker.update(this.props.map.kart, option.value);
  },

  setInputValue: function(value) {
    this.setState({
      inputValue: value
    });
  },

  setOptions: function(options) {
        this.setState({
            options: options
        });
    },

  handleRemoveClick: function() {
    this.setInputValue("");
    this.setOptions([]);
  }
});
