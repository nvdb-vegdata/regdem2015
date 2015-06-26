var React = require('react');

module.exports = React.createClass({
    render: function() {
        var selected = 'optionElement';
        // If this option is currently selected, render it with a green background.
        if (this.props.isSelected) {
            selected = 'optionElement selected';
        }

        return (
            <div className={selected}>
                <p><i className="material-icons">room</i></p>
                <p>{this.props.data.label}</p>
            </div>
        );
    }
});
