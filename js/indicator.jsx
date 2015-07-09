var React = require('react');
let { CircularProgress } = require('material-ui');

module.exports = React.createClass({

  render: function () {
    var style = 'search-field-indicator';
    if (!this.props.visible) {
      style += ' search-field-indicator-hidden';
    }
    return (
      <div className="search-field-indicator-container">
        <CircularProgress
          mode="indeterminate"
          size={0.35}
          className={style}
        />
      </div>
    );
  }
});
