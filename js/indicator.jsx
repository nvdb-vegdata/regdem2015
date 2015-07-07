var React = require('react');
var mui = require('material-ui');
let { CircularProgress } = require('material-ui');
let ThemeManager = new mui.Styles.ThemeManager();

module.exports = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

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
