let React = require('react');
let RegDemActions = require('./actions.js');

let { RaisedButton } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Geom = React.createClass({

  getInitialState: function () {
    return {
      currentGeom: null,
      currentType: null
    };
  },

  setCurrentGeom: function (val) {
    this.setState({
      currentGeom: val
    });
  },

  setCurrentType: function (val) {
    this.setState({
      currentType: val
    });
  },

  componentWillReceiveProps: function (nextProps) {
    if(this.state.currentGeom !== nextProps.result){
      this.setCurrentGeom(nextProps.result);
    }

    if (this.state.currentType !== nextProps.resultType) {
      this.setCurrentType(nextProps.resultType);
    }
  },

  render: function () {
    return (
      <div className="Editor-geom">
        <Marker
          enabled={this.props.egenskaper.punkt}
          objektId={this.props.objektId}
          data={this.props.data}
          selected={this.state.currentType === "marker"}
        />
        <Strekning
          enabled={this.props.egenskaper.linje}
          objektId={this.props.objektId}
          data={this.props.data}
          selected={this.state.currentType === "strekning"}
        />
        <Flate
          enabled={this.props.egenskaper.flate}
          objektId={this.props.objektId}
          data={this.props.data}
          selected={this.state.currentType === "flate"}
        />
      </div>
    );
  }
});

let Marker = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektId, 'marker');
  },

  render: function () {
    if (!this.props.enabled) {
      return null;
    }

    return (
      <RaisedButton
        style={{margin: '5px'}}
        label="Plassér Punkt"
        className='Editor-geom-button'
        onTouchTap={this.handleClick}
        disabled = {this.props.data.search.loading}
        primary = {this.props.selected}
      />
    );
  }
});

let Strekning = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektId, 'strekning');
  },

  render: function () {
    if (!this.props.enabled) {
      return null;
    }

    return (
    <RaisedButton
      style={{margin: '5px'}}
      label="Plassér Linje"
      className='Editor-geom-button'
      onTouchTap={this.handleClick}
      disabled = {true || this.props.data.search.loading} // TODO Midlertidig inaktivt siden vi ikke har implementert lagring av strekning
      primary = {this.props.selected}
    />
  );
}
});

let Flate = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektId, 'flate');
  },

  render: function () {
    if (!this.props.enabled) {
      return null;
    }

    return (
    <RaisedButton
      style={{margin: '5px'}}
      label="Plassér Flate"
      className='Editor-geom-button'
      onTouchTap={this.handleClick}
      disabled = {true || this.props.data.search.loading} // TODO Midlertidig inaktivt siden vi ikke har implementert lagring av flate
      primary = {this.props.selected}
    />
  );
}
});

module.exports = {
  Geom: Geom
};
