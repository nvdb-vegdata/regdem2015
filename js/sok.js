var React = require('react');
var Typeahead = require('react-typeahead-component');

var Fetch = require('./fetch.js');
var Indicator = require('./indicator.jsx');
var OptionTemplate = require('./optiontemplate.jsx');

let Sok = React.createClass({
  getInitialState: function() {
    return {
      inputValue: '',
      options: [],
      loading: 'false'
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
          onInputClick={this.handleInputClick}
          optionTemplate={OptionTemplate}
          onOptionChange={this.handleOptionChange}
          onOptionClick={this.handleOptionClick}
          onKeyDown={this.handleKeyDown}
          onComplete={this.handleComplete}
          handleHint={this.handleHint}
          ref="typeahead"
        />
        {this.renderIndicator()}
        {this.renderRemoveIcon()}
      </div>
    );
  },

  renderRemoveIcon: function() {
    if(this.state.inputValue.length > 0) {
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
      visible={this.state.loading}
      />
    );
  },

  setFocus: function () {
    this.refs.typeahead.focus();
  },

  handleInputClick: function(event) {
    if(this.state.inputValue === ''){
      this.handleChange(event);
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

  setLoading: function (val) {
    if (this.state.inputValue) {
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
    app.setObjektAndObjektTypeID(null, id);

    var sok = this;
    this.props.fetchObjekter(id, () => {
      sok.setLoading('false');
    });
    this.setLoading('true');
  },

  handleRemoveClick: function() {
    app.setObjektAndObjektTypeID(null, null);
    app.refs.mapAndSearch.clearMarkers();
    this.replaceState(this.getInitialState());
  }
});

module.exports = Sok;
