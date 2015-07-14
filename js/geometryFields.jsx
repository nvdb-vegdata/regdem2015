let React = require('react');
let RegDemActions = require('./actions.js');

let { RaisedButton, TextField } = require('material-ui');

let Geom = React.createClass({
  render: function () {
    return (
      <div className="Editor-tekst">
        <TextField
          floatingLabelText='Geometri'
          defaultValue='Plassér i kart.'
          fullWidth={true}
          disabled={true}
          className='Editor-geom-field'
        />
        <Marker egenskaper={this.props.egenskaper} objektID={this.props.objektID}/>
        <Strekning egenskaper={this.props.egenskaper} objektID={this.props.objektID}/>
        <Flate egenskaper={this.props.egenskaper} objektID={this.props.objektID}/>
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
        disabled = {!this.props.egenskaper.punkt}
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
      disabled = {!this.props.egenskaper.linje}
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
      disabled = {!this.props.egenskaper.flate}
    />
  );
}
});

module.exports = {
  Geom: Geom
};
