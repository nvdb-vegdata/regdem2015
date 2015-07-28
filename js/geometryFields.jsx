let React = require('react');
let RegDemActions = require('./actions.js');

let { FlatButton, TextField } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Geom = React.createClass({

  render: function () {
    let objekt = this.props.data.objektEdited || this.props.data.objekt;
    let geometriStreng = '';
    let errorText = '';

    if (objekt.lokasjon.geometriWgs84) {
      geometriStreng = objekt.lokasjon.geometriWgs84;
    } else if (this.props.data.editor.currentlyValidated) {
      errorText = 'Vegobjektet må være stedfestet.';
    }
    return (
      <div className="Editor-geom">
        <TextField
          floatingLabelText="Geometri"
          value={geometriStreng}
          errorText={errorText}
          fullWidth={true}
          className="Editor-permanentEtikett"
        />
        <div className="Editor-geom-button-container">
          <Marker
            enabled={this.props.egenskaper.punkt}
            objektId={this.props.objektId}
            data={this.props.data}
            selected={this.props.actualEgenskaper.punkt}
          />
          <Strekning
            enabled={this.props.egenskaper.linje}
            objektId={this.props.objektId}
            data={this.props.data}
            selected={this.props.actualEgenskaper.linje}
          />
          <Flate
            enabled={this.props.egenskaper.flate}
            objektId={this.props.objektId}
            data={this.props.data}
            selected={this.props.actualEgenskaper.flate}
          />
        </div>

      </div>
    );
  }
});

let Marker = React.createClass({

  handleClick: function () {
    RegDemActions.addGeomStart(this.props.data.listPosition, this.props.objektId, 'marker');
  },

  render: function () {
    if (!this.props.enabled) {
      return null;
    }

    return (
      <FlatButton
        style={{margin: '5px'}}
        label={<i className="material-icons">place</i>}
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
    RegDemActions.addGeomStart(this.props.data.listPosition, this.props.objektId, 'strekning');
  },

  render: function () {
    if (!this.props.enabled) {
      return null;
    }

    return (
    <FlatButton
      style={{margin: '5px'}}
      label={<i className="material-icons">trending_up</i>}
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
    RegDemActions.addGeomStart(this.props.data.listPosition, this.props.objektId, 'flate');
  },

  render: function () {
    if (!this.props.enabled) {
      return null;
    }

    return (
    <FlatButton
      style={{margin: '5px'}}
      label={<i className="material-icons">layers</i>}
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
