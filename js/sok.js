var React = require('react');
var Typeahead = require('react-typeahead-component');

var Fetch = require('./fetch.js')
var OptionTemplate = require('./optiontemplate.jsx');

// var getOptions = function(input, callback) {
//   Fetch.fetch(function(data) {
//     callback(null, {
//       options: data,
//       complete: true
//     });
//   });
// };
//
// React.render(
//     <Typeahead
//         placeholder = 'Search'
//         optionTemplate = {OptionTemplate}
//         options = {getOptions() }
//     />,
//
//     // Render Typeahead into the container of your choice.
//     document.getElementById('sok')
// );


module.exports.ObjektSok = React.createClass({
  getInitialState: function() {
    return {
      inputValue: '',
      options: []
    };
  },

  render: function() {
    return (
      <Typeahead
      inputValue={this.state.inputValue}
      options={this.state.options}
      onChange={this.handleChange}
      optionTemplate={OptionTemplate}
      onOptionChange={this.handleOptionChange}
      onOptionClick={this.handleOptionClick}
      />
    );
  },

  handleChange: function(event) {
    var value = event.target.value;
    this.setInputValue(value);
    this.getOptions(value);
  },

  getOptions: function(input) {
    var _this = this;
    Fetch.fetch( input, function(data) {
      _this.handleStoreChange(data);
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
