var React = require('react');
var Typeahead = require('react-typeahead-component');

var Indicator = require('./indicator.jsx');
var OptionTemplate = require('./optiontemplate.jsx');

let RegDemActions = require('./actions');


//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Sok = React.createClass({

  render: function() {
    let leftMostIcon = (<i className="material-icons search-field-search-icon">search</i>);
    let rightMostIcon = this.renderRemoveIcon();
    let searcFieldClassName = 'search-field';

    if (this.props.data.objektTypeId) {
      let listIconClassName = 'material-icons search-field-list-icon';
      if (this.props.data.list.open) {
        listIconClassName += ' search-field-list-icon-opened';
      }
      // Listen bruker onClick. Får registrert dobbelt trykk ellers
      leftMostIcon = (<i className={listIconClassName} onClick={this.handleOpenList}>list</i>);
      searcFieldClassName = 'search-field search-field-objekttype-selected';
    }

    if (this.props.data.geometry.addingMarker) {
      searcFieldClassName += ' search-field-hidden';
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
                hoverSelect={false}
                ref="typeahead"
              />
              {this.renderIndicator()}
              {rightMostIcon}
            </div>);
  },

  renderRemoveIcon: function() {
    if ((this.props.data.search.inputValue && this.props.data.search.inputValue.length > 0) || this.props.data.objektTypeId !== null) {
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

  componentDidMount: function () {
    this.getOptions('');
  },

  componentDidUpdate: function (prevProps) {
    if (prevProps.data.listPosition !== this.props.data.listPosition) {
      this.refs.typeahead.getDOMNode().querySelector('input[role="combobox"]').removeAttribute('disabled');
    }

    if (prevProps.data.objektTypeId && !this.props.data.objektTypeId) {
      this.refs.typeahead.showDropdown();
      this.refs.typeahead.focus();
    }
  },

  handleInputClick: function(event) {
    if (this.props.data.objektTypeId) {
      this.refs.typeahead.getDOMNode().querySelector('input[role="combobox"]').removeAttribute('disabled');
      RegDemActions.goBackAndReset(this.props.data.listPosition, this.refs.typeahead.userInputValue);
    } else if (this.props.data.search.inputValue === ''){
      this.handleChange(event);
    }
  },

  handleChange: function(event) {
    var value = event.target.value;
    this.setInputValue(value);
    this.getOptions(value);
  },

  getOptions: function(input) {
    RegDemActions.fetchObjektTypes(this.props.data.listPosition, input);
  },

  handleOptionChange: function(event, option) {
    this.setInputValue(option.label);
  },

  handleOptionClick: function(event, option) {
    this.setInputValue(option.label);
    this.executeSearch(option.value);
  },

  setInputValue: function(value) {
    RegDemActions.setInputValue(this.props.data.listPosition, value);
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
    if (selectedIndex === -1 && this.props.data.search.selectedIndex !== selectedIndex) {
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
    RegDemActions.setPrevSelectedIndex(this.props.data.listPosition, selectedIndex);
  },

  executeSearch: function (objektTypeId) {
    RegDemActions.executeSearch(this.props.data.listPosition, objektTypeId);
    this.refs.typeahead.getDOMNode().querySelector('input[role="combobox"]').setAttribute('disabled', 'disabled');
  },

  handleRemoveClick: function() {
    this.refs.typeahead.getDOMNode().querySelector('input[role="combobox"]').removeAttribute('disabled');
    RegDemActions.terminateState(this.props.data.listPosition);
  },

  handleOpenList: function() {
    RegDemActions.showList(this.props.data.listPosition);
  }
});

module.exports = Sok;
