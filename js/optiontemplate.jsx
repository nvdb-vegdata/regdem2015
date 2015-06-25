var React = require('react');

module.exports = React.createClass({
    render: function() {
        var selected = null;

        // If this option is currently selected, render it with a green background.
        if (this.props.isSelected) {
            selected = "selected";
        }

        return (
            <div className={selected}>
                <p>{this.props.data.label}</p>
            </div>
        );
    }
});
