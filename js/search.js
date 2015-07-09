var React = require('react');
var Typeahead = require('react-typeahead-component');

var Indicator = require('./indicator.jsx');
var OptionTemplate = require('./optiontemplate.jsx');

let RegDemActions = require('./actions');

let Sok = React.createClass({
  getInitialState: function() {
    return {
      objektTypeSelected: false,
      prevSelectedIndex: null
    };
  },

  render: function() {
    let leftMostIcon = (<i className="material-icons search-field-search-icon">search</i>);
    let rightMostIcon = this.renderRemoveIcon();
    let searcFieldClassName = 'search-field';

    if (this.state.objektTypeSelected) {
      leftMostIcon = (<i className="material-icons search-field-go-back" onTouchTap={this.handleGoBack}>arrow_back</i>);
      rightMostIcon = (<i className="material-icons search-field-list-icon" onTouchTap={this.handleOpenList}>list</i>);
      searcFieldClassName = 'search-field search-field-objekttype-selected';
    }

    return (<div className={searcFieldClassName}>
              {leftMostIcon}
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
                onFocus={this.handleFocus}
                autoFocus={this.props.data.search.inputValue ? true : false}
                ref="typeahead"
              />
              {this.renderIndicator()}
              {rightMostIcon}
            </div>);
  },

  renderRemoveIcon: function() {
    if ((this.props.data.search.inputValue && this.props.data.search.inputValue.length > 0) || this.props.data.objektTypeID !== null) {
      return (
        <i
        onTouchTap={this.handleRemoveClick}
        className="material-icons search-field-clear-icon">clear</i>
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

  componentDidUpdate: function (prevProps, prevState) {
    if (prevState.objektTypeSelected && !this.state.objektTypeSelected) {
      this.refs.typeahead.showDropdown();
      this.refs.typeahead.focus();
    }
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
  },

  handleKeyDown: function(event, optionData, selectedIndex) {
    if (selectedIndex === -1 && this.state.prevSelectedIndex !== selectedIndex) {
      this.setInputValue(optionData);
    }
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
    this.state.prevSelectedIndex = selectedIndex;
  },

  executeSearch: function (objektTypeID) {
    this.setState({
      objektTypeSelected: true
    });
    RegDemActions.executeSearch(objektTypeID);
    this.refs.typeahead.getDOMNode().querySelector('input[role="combobox"]').setAttribute('disabled', 'disabled');
  },

  handleRemoveClick: function() {
    RegDemActions.resetApp();
  },

  handleOpenList: function() {
    RegDemActions.showList();
  },

  handleGoBack: function() {
    this.refs.typeahead.getDOMNode().querySelector('input[role="combobox"]').removeAttribute('disabled');
    this.setState({
      objektTypeSelected: false
    });
    RegDemActions.goBackAndReset(this.refs.typeahead.userInputValue);
  }
});

module.exports = Sok;
