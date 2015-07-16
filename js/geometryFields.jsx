let React = require('react');
let RegDemActions = require('./actions.js');

let { RaisedButton } = require('material-ui');

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
          objektID={this.props.objektID}
          selected={this.state.currentType === "marker"}
        />
        <Strekning
          enabled={this.props.egenskaper.linje}
          objektID={this.props.objektID}
          selected={this.state.currentType === "strekning"}
        />
        <Flate
          enabled={this.props.egenskaper.flate}
          objektID={this.props.objektID}
          selected={this.state.currentType === "flate"}
        />
      </div>
    );
  }
});

let Marker = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektID, 'marker');
  },

  render: function () {
    return (
      <RaisedButton
        style={{margin: '5px'}}
        label="Plassér Punkt"
        className='Editor-geom-button'
        onTouchTap={this.handleClick}
        disabled = {!this.props.enabled}
        primary = {this.props.selected}
      />
    );
  }
});

let Strekning = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektID, 'strekning');
  },

  render: function () {
    return (
    <RaisedButton
      style={{margin: '5px'}}
      label="Plassér Linje"
      className='Editor-geom-button'
      onTouchTap={this.handleClick}
      disabled = {!this.props.enabled}
      primary = {this.props.selected}
    />
  );
}
});

let Flate = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.objektID, 'flate');
  },

  render: function () {
    return (
    <RaisedButton
      style={{margin: '5px'}}
      label="Plassér Flate"
      className='Editor-geom-button'
      onTouchTap={this.handleClick}
      disabled = {!this.props.enabled}
      primary = {this.props.selected}
    />
  );
}
});

module.exports = {
  Geom: Geom
};
