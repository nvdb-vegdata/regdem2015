var React = require('react');
var Typeahead = require('react-typeahead-component');

var Fetch = require('./fetch.js');
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
        />
      </div>
    );
  },

  handleChange: function(event) {
    var value = event.target.value;
    this.setInputValue(value);
    this.getOptions(value);
  },

  getOptions: function(input) {
    var that = this;
    Fetch.fetch( input, function(data) {
      that.handleStoreChange(data);
    });

  },

  handleOptionChange: function(event, option) {
    this.setInputValue(option.label);
  },

  handleOptionClick: function(event, option) {
    this.setInputValue(option.label);
  },

  setInputValue: function(value) {
    this.setState({
      inputValue: value
    });
  },

  handleStoreChange: function(newOptions) {
    this.setState({
      options: newOptions
    });
  }
});
