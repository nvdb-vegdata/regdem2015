var React = require('react');
var Typeahead = require('react-typeahead-component');

var Fetch = require('./fetch.js');
var OptionTemplate = require('./optiontemplate.jsx');

let Sok = React.createClass({
  getInitialState: function() {
    return {
      inputValue: '',
      options: []
    };
  },

  render: function() {
    return (
      <div className="sok">
        <i className="material-icons search-icon">search</i>
        <Typeahead
        inputValue={this.state.inputValue}
        options={this.state.options}
        onChange={this.handleChange}
        optionTemplate={OptionTemplate}
        onOptionChange={this.handleOptionChange}
        onOptionClick={this.handleOptionClick}
        onKeyDown={this.handleKeyDown}
        onComplete={this.handleComplete}
        handleHint={this.handleHint}
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
    this.executeSearch(option.value);
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

  handleHint: function(inputValue, options) {
    for(var opt in options){
      if (new RegExp('^' + inputValue).test(options[opt].label)){
        return options[opt].label;
      }
    }
    return '';
  },

  handleComplete: function (event, completedInputValue) {
    this.setInputValue(completedInputValue);
    this.getOptions(completedInputValue);
  },

  handleKeyDown: function(event, optionData) {
    if (event.keyCode === 13) {
      if (optionData.value) {
        this.executeSearch(optionData.value);
      } else {
        for (var opt in this.state.options) {
          var obj = this.state.options[opt];
          if (obj.label.toLowerCase() === optionData.toLowerCase()) {
            this.executeSearch(obj.value);
          }
        }
      }
    }
  },

  executeSearch: function (id) {
    app.setObjektID(null);
    this.props.updateMarkers(this, id);
  },

  handleRemoveClick: function() {
    this.setInputValue('');
    this.setOptions([]);
  }
});

module.exports = Sok;
