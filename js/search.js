var React = require('react');
var Typeahead = require('react-typeahead-component');

var Indicator = require('./indicator.jsx');
var OptionTemplate = require('./optiontemplate.jsx');

let RegDemActions = require('./actions');

let Sok = React.createClass({
  render: function() {
    return (
      <div className="sok">
        <i className="material-icons search-icon">search</i>
        <Typeahead
          inputValue={this.props.data.search.inputValue}
          options={this.props.data.search.options}
          onChange={this.handleChange}
          onInputClick={this.handleInputClick}
          optionTemplate={OptionTemplate}
          onOptionChange={this.handleOptionChange}
          onOptionClick={this.handleOptionClick}
          onKeyDown={this.handleKeyDown}
          onComplete={this.handleComplete}
          handleHint={this.handleHint}
        />
        {this.renderIndicator()}
        {this.renderRemoveIcon()}
      </div>
    );
  },

  renderRemoveIcon: function() {
    if (this.props.data.search.inputValue.length > 0 || this.props.data.objektTypeID !== null) {
      return (
        <i
        onTouchTap={this.handleRemoveClick}
        className="material-icons clear-icon">clear</i>
      );
    }
  },

  renderIndicator: function () {
    return (
      <Indicator
        visible={this.props.data.search.loading}
      />
    );
  },

  handleInputClick: function(event) {
    if(this.props.data.search.inputValue === ''){
      this.handleChange(event);
    }
  },

  handleChange: function(event) {
    var value = event.target.value;
    this.setInputValue(value);
    this.getOptions(value);
  },

  getOptions: function(input) {
    RegDemActions.fetchObjektTypes(input);
  },

  handleOptionChange: function(event, option) {
    this.setInputValue(option.label);
  },

  handleOptionClick: function(event, option) {
    this.setInputValue(option.label);
    this.executeSearch(option.value);
  },

  setInputValue: function(value) {
    RegDemActions.setInputValue(value);
  },

  setLoading: function (val) {
    if (this.props.data.search.inputValue) {
      this.setState({
        loading: val
      });
    }
  },

  handleHint: function(inputValue, options) {
    if (inputValue) {
      var expression = new RegExp('^' + inputValue.toLowerCase());
      for(var opt in options){
        if (expression.test(options[opt].label.toLowerCase())){
          return inputValue + options[opt].label.slice(inputValue.length);
        }
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
        for (var opt in this.props.data.search.options) {
          var obj = this.props.data.search.options[opt];
          if (obj.label.toLowerCase() === optionData.toLowerCase()) {
            this.executeSearch(obj.value);
          }
        }
      }
    }
  },

  executeSearch: function (objektTypeID) {
    RegDemActions.executeSearch(objektTypeID);
  },

  handleRemoveClick: function() {
    RegDemActions.resetApp();
  }
});

module.exports = Sok;
