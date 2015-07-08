let React = require('react/addons');
let mui = require('material-ui');
let RegDemActions = require('./actions');
var RegDemConstants = require('./constants');
let Helper = require('./helper.js');

let Fields = require('./fields.jsx');

let { Mixins, SelectField, TextField, TimePicker, DatePicker, Card,
  ClearFix, CardActions, FlatButton, CardTitle, CardText, CircularProgress } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Colors = mui.Styles.Colors;

let Editor = React.createClass({
  // Mixins, for linked state
  mixins: [React.addons.LinkedStateMixin],

  closeDialog: function () {
    RegDemActions.closeEditor();
  },

  expandForm: function () {
    if (!this.props.data.editor.expanded) {
      RegDemActions.expandEditor();
    }
  },

  // Finner verdien til egenskapen til objektet. Brukes til å pre-populate egenskapene
  finnVerdi: function (egenskap, returFunksjon) {
    let dataTilEgenskap = [];

    if (this.props.data.objekt.egenskaper) {
      dataTilEgenskap = this.props.data.objekt.egenskaper.filter((objektEgenskap) => { return objektEgenskap.id === egenskap.id; });
    }

    if (dataTilEgenskap.length > 0) {
      return returFunksjon(dataTilEgenskap[0]);
    } else {
      return '';
    }
  },

  finnENUMVerdi: function (egenskap) {
    return this.finnVerdi(egenskap, function (obj) { return obj.enumVerdi.id; });
  },

  finnTekstVerdi: function (egenskap) {
    return this.finnVerdi(egenskap, function (obj) { return obj.verdi; });
  },

  render: function() {
    let objektTypeNavn = this.props.data.objektType ? this.props.data.objektType.navn : '';
    let objektId = this.props.data.objekt ? this.props.data.objekt.objektId : '';
    let vegreferanse = this.props.data.objekt ? Helper.vegReferanseString(this.props.data.objekt.lokasjon.vegReferanser[0]) : '';
    let egenskapsTyper = this.props.data.objektType ? this.props.data.objektType.egenskapsTyper : [];
    let objekt = this.props.data.objekt ? this.props.data.objekt : [];

    let formName, subtitle;
    if (this.props.data.objektID && this.props.data.objektID !== -1) {
      // Skjemanavn
      formName = 'Rediger objekt';

      // Subtitle
      subtitle = (
        <div style={{fontSize: '16px'}}>
          <div style={{fontWeight: 'bold'}}>{objektTypeNavn}</div>
          <div>Objektid: {objektId}</div>
          <div>Vegreferanse: {vegreferanse}</div>
        </div>
      );

    } else if (this.props.data.objektID === -1) {
      formName = 'Lag nytt objekt';
      subtitle = ( <div style={{fontWeight: 'bold', fontSize: '16px'}}>{objektTypeNavn}</div> );
    }

    // Pre-compute forms
    let EditorFields = null;

    // CSS Styles
    let EditorClassName = 'Editor';
    let EditorCardClassName = 'Editor-Card';
    let CircularProgressClassName = 'Editor-loader Editor-hidden';
    let CardTitleClassName = 'Editor-hidden';
    let CardTextClassName = 'Editor-hidden';
    let CardActionsClassName = 'Editor-knapp-container Editor-hidden';

    // Hvis state er loading
    if (this.props.data.editor.loading) {
      EditorCardClassName = 'Editor-Card Editor-Card-loader';
      CircularProgressClassName = 'Editor-loader';
      CardTitleClassName = 'Editor-hidden';
      CardTextClassName = 'Editor-hidden';
      CardActionsClassName = 'Editor-knapp-container Editor-hidden';
    }

    // Når objektet er hentet og ikke laster lenger
    if (this.props.data.objekt && !this.props.data.editor.loading) {
      EditorClassName = 'Editor';
      EditorCardClassName = 'Editor-Card';
      CircularProgressClassName = 'Editor-loader Editor-hidden';
      CardTitleClassName = '';

      // Bare vis resten hvis den er expanded
      if (this.props.data.editor.expanded || window.matchMedia('(min-width: ' + RegDemConstants.values.REGDEM_SIZE_DESKTOP + 'px)').matches) {
        CardTextClassName = '';
        CardActionsClassName = 'Editor-knapp-container';

        EditorFields = egenskapsTyper.map((egenskap) => {
                          switch (egenskap.type) {
                            case 'ENUM':
                              return (<Fields.ENUM verdi={this.finnENUMVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                            case 'Tekst':
                              return (<Fields.Tekst verdi={this.finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                            case 'Tall':
                              return (<Fields.Tall verdi={this.finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                            case 'Klokkeslett':
                              return (<Fields.Klokkeslett verdi={this.finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                            case 'Dato':
                              return (<Fields.Dato verdi={this.finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                            default:
                              break;
                          }
                        });
      } else {
        EditorCardClassName += ' Editor-pointer';
      }
    }

    // Hvis ingen objektID er satt skal ikke skjemaet vises.
    if (!this.props.data.objektID) {
      return null;
    } else {
      return (
        <div className={EditorClassName}>
          <Card className={EditorCardClassName} onTouchTap={this.expandForm}>
              <CardActions className="Editor-lukk"><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
              <CircularProgress mode="indeterminate" className={CircularProgressClassName} />
              <CardTitle title={formName} subtitle={subtitle} className={CardTitleClassName} />
              <CardText className={CardTextClassName}>
                {EditorFields}
              </CardText>
              <CardActions className={CardActionsClassName}>
                <FlatButton label="Lagre" primary={true} />
                <FlatButton label="Avbryt" onTouchTap={this.closeDialog} />
              </CardActions>
          </Card>
        </div>
      );
    }

  }

});

module.exports = Editor;
