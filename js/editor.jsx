let React = require('react/addons');
let RegDemActions = require('./actions');
var RegDemConstants = require('./constants');
var Writer = require('./writer.js');
let Helper = require('./helper.js');
let Parser = require('./parser.js');

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

  componentDidUpdate: function () {
    if (this.props.data.scrollToTop) {
      var node = document.querySelector('.Editor-CardText');
      if (node) {
        node.scrollTop = 0;
        RegDemActions.hasScrolledToTop(this.props.data.listPosition);
      }
    }
  },

  closeDialog: function () {
    RegDemActions.closeEditor(this.props.data.listPosition);
  },

  saveObjekt: function () {
    Writer.validateObjekt(this.props.data);
  },

  tapEditor: function () {
    if (!this.props.data.active) {
      RegDemActions.makeThisStateActive(this.props.data.listPosition);
    } else if (!this.props.data.editor.expanded) {
      RegDemActions.expandEditor(this.props.data.listPosition);
    }
  },

  // Finner verdien til egenskapen til objektet. Brukes til å pre-populate egenskapene
  finnVerdi: function (egenskap, returFunksjon) {
    let objekt = this.props.data.objektEdited || this.props.data.objekt;

    if (objekt && objekt.egenskaper) {
      for (let i = 0; i < objekt.egenskaper.length; i++) {
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
    let warnings = this.props.data.validatorResponse ? Parser.extractErrors(this.props.data.validatorResponse) : [];

    // Forbereder validering
    let warningsFull = {};
    for (let i in egenskapsTyper) {
      let index = egenskapsTyper[i].id;
      warningsFull[index] = warnings[index] ? warnings[index].kode : '';
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
    let MinimizedStatusClassName = 'Editor-hidden';

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
    if ((objekt || objektId === -1)  && !this.props.data.editor.loading && !this.props.data.geometry.addingMarker && this.props.data.active) {
      EditorClassName = 'Editor';
      if (this.props.numberOfInactive > 0) {
        EditorClassName += ' Editor-other-inactive';
      }
      EditorCloseClassName = 'Editor-lukk';
      EditorCardClassName = 'Editor-Card Editor-Card-loaded';
      CircularProgressClassName = 'Editor-loader Editor-hidden';
      CardTitleClassName = 'Editor-CardTitle';

      // Bare vis resten hvis den er expanded
      if (this.props.data.editor.expanded || window.matchMedia('(min-width: ' + RegDemConstants.values.REGDEM_SIZE_DESKTOP + 'px)').matches) {
        CardTextClassName = 'Editor-CardText';
        CardActionsClassName = 'Editor-knapp-container';

        let geomEgenskaper = {};
        for (let i = 0; i < egenskapsTyper.length; i++) {
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

        let actualGeomEgenskaper = {};
        for (let i = 0; i < objekt.egenskaper.length; i++) {
          let navn = objekt.egenskaper[i].navn;
          if (navn.indexOf('Geometri') === 0 ) {
            if (navn.indexOf('punkt') >= 0) {
              actualGeomEgenskaper.punkt = true;
            } else if (navn.indexOf('linje') >= 0) {
              actualGeomEgenskaper.linje = true;
            } else if (navn.indexOf('flate') >= 0) {
              actualGeomEgenskaper.flate = true;
            }
          }
        }

        if (geomEgenskaper) {
          GeomFields = (<GeometryFields.Geom
                          objektId={objektId}
                          egenskaper={geomEgenskaper}
                          actualEgenskaper={actualGeomEgenskaper}
                          data={this.props.data}
                        />);
        }

        EditorFields = egenskapsTyper.map((egenskap) => {
                          switch (egenskap.type) {
                            case 'ENUM':
                              return (<Fields.ENUM
                                        verdi={this.finnENUMVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        warning={warningsFull[egenskap.id]}
                                        key={objektId + '.' + this.props.data.version + '-' + egenskap.id}
                                        data={this.props.data}
                                      />);
                            case 'Tekst':
                              return (<Fields.Tekst
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        warning={warningsFull[egenskap.id]}
                                        key={objektId + '.' + this.props.data.version + '-' + egenskap.id}
                                        data={this.props.data}
                                      />);
                            case 'Tall':
                              return (<Fields.Tall
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        warning={warningsFull[egenskap.id]}
                                        key={objektId + '.' + this.props.data.version + '-' + egenskap.id}
                                        data={this.props.data}
                                      />);
                            case 'Klokkeslett':
                              return (<Fields.Klokkeslett
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        warning={warningsFull[egenskap.id]}
                                        key={objektId + '.' + this.props.data.version + '-' + egenskap.id}
                                        data={this.props.data}
                                        />);
                            case 'Dato':
                              return (<Fields.Dato
                                        verdi={this.finnTekstVerdi(egenskap)}
                                        egenskaper={egenskap}
                                        warning={warningsFull[egenskap.id]}
                                        key={objektId + '.' + this.props.data.version + '-' + egenskap.id}
                                        data={this.props.data}
                                      />);
                            default:
                              break;
                          }
                        });
      } else {
        EditorCardClassName += ' Editor-pointer';
      }
    }

    if (!this.props.data.active) {
      EditorClassName = 'Editor Editor-inactive Editor-inactive-pos-' + this.props.inactiveNumber;
      EditorCloseClassName = 'Editor-lukk Editor-hidden';
      EditorCardClassName = 'Editor-Card Editor-Card-loaded Editor-pointer';
      CircularProgressClassName = 'Editor-loader Editor-hidden';
      CardTitleClassName = 'Editor-CardTitle Editor-hidden';
      MinimizedStatusClassName = 'Editor-minimized-status';
    }

    return (
      <div className={EditorClassName}>
        <Card className={EditorCardClassName} onTouchTap={this.tapEditor}>
            <CardActions className={EditorCloseClassName}><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
            <CircularProgress mode="indeterminate" className={CircularProgressClassName} />

            <CardText className={MinimizedStatusClassName}>
              {this.props.data.objektId + '-' + (this.props.data.progressStatus.length > 0 ? this.props.data.progressStatus[this.props.data.progressStatus.length - 1] : '')}
            </CardText>
            <CardTitle title={formName} subtitle={subtitle} className={CardTitleClassName} />
            <CardText className={CardTextClassName}>
              {GeomFields}
              {EditorFields}

              <CardActions className={CardActionsClassName}>
                <FlatButton label="Lagre" primary={true} onTouchTap={this.saveObjekt} disabled={!this.props.data.objektEdited} />
              </CardActions>
            </CardText>
        </Card>
      </div>
    );


  }

});

module.exports = Editor;
