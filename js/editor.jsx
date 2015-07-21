let React = require('react/addons');
let RegDemActions = require('./actions');
var RegDemConstants = require('./constants');
var Validator = require('./validator.js');
let Helper = require('./helper.js');

let GeometryFields = require('./geometryFields.jsx');
let Fields = require('./fields.jsx');

let { Card, CardActions, FlatButton, CardTitle, CardText, CircularProgress } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Editor = React.createClass({
  // Mixins, for linked state
  mixins: [React.addons.LinkedStateMixin],

  closeDialog: function () {
    RegDemActions.closeEditor();
  },

  saveObjekt: function () {
    //==== Mock feedback ======
    RegDemActions.updateValidationMessage("Objektet, av typen 95 (Skiltpunkt), mangler anbefalte egenskaper: [Antall oppsettingsutstyr (1877), Assosierte Skiltplate (220004), Assosierte Variabelt skilt (220006), Avskjæringsledd (8772), Geometri, punkt (4794), Fundamentering (1671), Oppsettingsutstyr (1876)]");
    //==== /Mock Feedbak ======

    Validator.validateObjekt(this.props.data);
  },

  expandForm: function () {
    if (!this.props.data.editor.expanded) {
      RegDemActions.expandEditor();
    }
  },

  // Finner verdien til egenskapen til objektet. Brukes til å pre-populate egenskapene
  finnVerdi: function (egenskap, returFunksjon) {
    let dataTilEgenskap = [];
    let objekt = this.props.data.objektEdited || this.props.data.objekt;

    if (objekt && objekt.egenskaper) {
      for (var i = 0; i < objekt.egenskaper.length; i++) {
        if (objekt.egenskaper[i].id === egenskap.id) {
          return returFunksjon(objekt.egenskaper[i]);
        }
      }
    }
    return '';
  },

  finnENUMVerdi: function (egenskap) {
    return this.finnVerdi(egenskap, function (obj) { return obj.enumVerdi.id; });
  },

  finnTekstVerdi: function (egenskap) {
    return this.finnVerdi(egenskap, function (obj) { return obj.verdi; });
  },

  render: function() {
    // Initaliserer variabler
    let objektId = this.props.data.objektId;
    let objekt = this.props.data.objektEdited || this.props.data.objekt;
    let objektTypeNavn = this.props.data.objektType ? this.props.data.objektType.navn : '';
    let vegreferanse = (objekt && objekt.lokasjon && objekt.lokasjon.vegReferanser) ? Helper.vegReferanseString(objekt.lokasjon.vegReferanser[0]) : '';
    let egenskapsTyper = this.props.data.objektType ? this.props.data.objektType.egenskapsTyper : [];
    let manglendeEgenskaper = this.props.data.editor.validationMessage ? Helper.getManglendeEgenskaper(this.props.data.editor.validationMessage) : [];

    // Forbereder validering
    let manglendeEgenskapMap = {};
    manglendeEgenskaper = manglendeEgenskaper.map(function (obj) {
      return parseInt(obj);
    });

    for (var i in egenskapsTyper) {
      let index = egenskapsTyper[i].id
      manglendeEgenskapMap[index] = manglendeEgenskaper.indexOf(index) != -1;
    }

    // Forbereder tittel og subtittel
    let formName, subtitle;
    if (objektId && objektId !== -1) {
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

    } else if (objektId === -1) {
      formName = 'Lag nytt objekt';
      subtitle = ( <div style={{fontWeight: 'bold', fontSize: '16px'}}>{objektTypeNavn}</div> );
    }

    // Pre-compute forms
    let EditorFields = null;
    let GeomFields = null;

    // CSS Styles
    let EditorClassName = 'Editor Editor-Visible-Hidden';
    let EditorCardClassName = 'Editor-Card';
    let EditorCloseClassName = 'Editor-lukk Editor-lukk-hidden';
    let CircularProgressClassName = 'Editor-loader Editor-hidden';
    let CardTitleClassName = 'Editor-hidden';
    let CardTextClassName = 'Editor-hidden';
    let CardActionsClassName = 'Editor-knapp-container Editor-hidden';

    // Hvis state er loading
    if (this.props.data.editor.loading) {
      EditorClassName = 'Editor';
      EditorCardClassName = 'Editor-Card Editor-Card-loader';
      EditorCloseClassName = 'Editor-lukk';
      CircularProgressClassName = 'Editor-loader';
      CardTitleClassName = 'Editor-hidden';
      CardTextClassName = 'Editor-hidden';
      CardActionsClassName = 'Editor-knapp-container Editor-hidden';
    }

    // Når objektet er hentet og ikke laster lenger
    if ((objekt || objektId === -1)  && !this.props.data.editor.loading && !this.props.data.geometry.addingMarker) {
      EditorClassName = 'Editor';
      EditorCloseClassName = 'Editor-lukk';
      EditorCardClassName = 'Editor-Card Editor-Card-loaded';
      CircularProgressClassName = 'Editor-loader Editor-hidden';
      CardTitleClassName = 'Editor-CardTitle';

      // Bare vis resten hvis den er expanded
      if (this.props.data.editor.expanded || window.matchMedia('(min-width: ' + RegDemConstants.values.REGDEM_SIZE_DESKTOP + 'px)').matches) {
        CardTextClassName = 'Editor-CardText';
        CardActionsClassName = 'Editor-knapp-container';

        let geomEgenskaper = {};
        for (var i = 0; i < egenskapsTyper.length; i++) {
          let navn = egenskapsTyper[i].navn;
          if (navn.indexOf('Geometri') === 0 ) {
            if (navn.indexOf('punkt') >= 0) {
              geomEgenskaper.punkt = true;
            } else if (navn.indexOf('linje') >= 0) {
              geomEgenskaper.linje = true;
            } else if (navn.indexOf('flate') >= 0) {
              geomEgenskaper.flate = true;
            }
          }
        }

        GeomFields = (<GeometryFields.Geom
                        objektId={objektId}
                        egenskaper={geomEgenskaper}
                        result={this.props.data.geometry.result}
                        resultType={this.props.data.geometry.resultType}
                        data={this.props.data}
                      />);

        EditorFields = egenskapsTyper.map((egenskap) => {
                          switch (egenskap.type) {
                            case 'ENUM':
                              return (<Fields.ENUM
                                        verdi={this.finnENUMVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        manglendeEgenskaper={manglendeEgenskapMap[egenskap.id]}
                                        key={objektId + '-' + egenskap.id}
                                      />);
                            case 'Tekst':
                              return (<Fields.Tekst
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        manglendeEgenskaper={manglendeEgenskapMap[egenskap.id]}
                                        key={objektId + '-' + egenskap.id}
                                      />);
                            case 'Tall':
                              return (<Fields.Tall
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        manglendeEgenskaper={manglendeEgenskapMap[egenskap.id]}
                                        key={objektId + '-' + egenskap.id}
                                      />);
                            case 'Klokkeslett':
                              return (<Fields.Klokkeslett
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        manglendeEgenskaper={manglendeEgenskapMap[egenskap.id]}
                                        key={objektId + '-' + egenskap.id}
                                        />);
                            case 'Dato':
                              return (<Fields.Dato
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        manglendeEgenskaper={manglendeEgenskapMap[egenskap.id]}
                                        key={objektId + '-' + egenskap.id}
                                      />);
                            default:
                              break;
                          }
                        });
      } else {
        EditorCardClassName += ' Editor-pointer';
      }
    }

    return (
      <div className={EditorClassName}>
        <Card className={EditorCardClassName} onTouchTap={this.expandForm}>
            <CardActions className={EditorCloseClassName}><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
            <CircularProgress mode="indeterminate" className={CircularProgressClassName} />

            <CardTitle title={formName} subtitle={subtitle} className={CardTitleClassName} />
            <CardText className={CardTextClassName}>
              {GeomFields}
              {EditorFields}
            </CardText>
            <CardActions className={CardActionsClassName}>
              <FlatButton label="Lagre" primary={true} onTouchTap={this.saveObjekt} disabled={!this.props.data.objektEdited} />
              <FlatButton label="Avbryt" onTouchTap={this.closeDialog} />
            </CardActions>
        </Card>
      </div>
    );


  }

});

module.exports = Editor;
