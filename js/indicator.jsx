var React = require('react');
var mui = require('material-ui');
let { CircularProgress } = require('material-ui');

module.exports = React.createClass({

  render: function () {
    var style = 'indicator';
    if (!this.props.visible) {
      style += ' hidden';
    }
    return (
      <div className="indicator_container">
        <CircularProgress
          mode="indeterminate"
          size={0.25}
          className={style}
        />
      </div>
    );
  }
});
