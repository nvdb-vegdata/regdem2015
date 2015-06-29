var React = require('react');

module.exports = React.createClass({
    render: function() {
        var optionData = this.props.data.label;
        var input = this.props.userInputValue;

        var pos1 = optionData.toLowerCase().indexOf(input.toLowerCase());
        var pos2 = pos1 + input.length;

        var selected = 'optionElement';
        if (this.props.isSelected) {
            selected = 'optionElement selected';
        }
        return (
            <div className={selected}>
                <p>
                  {optionData.slice(0,pos1)}
                  <strong>{optionData.slice(pos1,pos2)}</strong>
                  {optionData.slice(pos2)}
                </p>
            </div>
        );
    }
});
