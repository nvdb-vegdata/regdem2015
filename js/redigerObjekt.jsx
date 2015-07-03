let React = require('react/addons');
let mui = require('material-ui');
let Fetch = require('./fetch.js');
let Helper = require('./helper.js');
let { Mixins, SelectField, TextField, TimePicker, DatePicker, Card,
  ClearFix, CardActions, FlatButton, CardTitle, CardText, CircularProgress } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

let { StyleResizable } = Mixins;

let RedigerObjekt = React.createClass({
  // Mixins, for linked state
  mixins: [StyleResizable, React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      objekt: null,
      objektType: null,
      loaded: false,
      expanded: false
    };
  },

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
  },

  componentDidMount: function () {
    // Hent data på objektet
    this.getNewData(this.props.objektID);
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.objektID) {
      this.getNewData(nextProps.objektID);
    } else {
      this.replaceState(this.getInitialState());
    }
  },

  getNewData: function (objektID) {
    // Finnes det en ObjektID?
    if (objektID) {
      // Skal vi lage nytt objekt?
      if (objektID === -1) {
        this.replaceState(this.getInitialState());
        // Har vi oppgitt
        if (this.props.objektTypeID) {
          // Kun hent ObjektType data, sett Objekt data til null
          this.fetchObjekTypetData(null, this.props.objektTypeID);
        }
      } else {
        // Finne det allerede et objekt i state, og er dette objektet det
        // samme som det vi prøver å laste inn?
        if (this.state.objekt && objektID !== this.state.objekt.objektId) {
          this.replaceState(this.getInitialState());
          this.fetchObjektData(objektID);
        } else {
          this.fetchObjektData(objektID);
        }
      }
    }
  },

  fetchObjektData: function (objektID) {
    Fetch.fetchObjekt(objektID, (objektData) => {
      if (this.isMounted()) {
        // Når du har hentet Objekt data må du hente ObjektTypeData. Sender ObjektData
        // som parameter slik at fetchObjektTypeData kan oppdatere state.
        this.fetchObjekTypetData(objektData, objektData.objektTypeId);
      }
    });
  },

  fetchObjekTypetData: function (objektData, objektTypeId) {
    // Nå som vi har objektet, kan vi hente objekttype
    Fetch.fetchObjektType(objektTypeId, (objektTypeData) => {
      if (this.isMounted()) {
        // Sorterer egenskaper til objekttype etter viktighet og sorteringsnummer
        objektTypeData.egenskapsTyper.sort(function (a, b) {
          let differanseMellomAogB = Helper.objektTypeViktighetTilNummer(a.viktighet) - Helper.objektTypeViktighetTilNummer(b.viktighet);

          if (differanseMellomAogB === 0) {
            // Sorter på sorteringsnummer, nivå 2
            return a.sorteringsnummer - b.sorteringsnummer;
          } else {
            // Sorter på viktighet, nivå 1
            return differanseMellomAogB;
          }
        });

        this.setState({
          objekt: objektData,
          objektType: objektTypeData,
          loaded: true
        });
      }
    });
  },

  closeDialog: function () {
    app.setObjektID(null);
  },

  expandForm: function () {
    if (!this.state.expanded) {
      this.setState({
        expanded: true
      });
    }
  },

  render: function() {
    let objektTypeNavn = this.state.objektType ? this.state.objektType.navn : '';
    let objektId = this.state.objekt ? this.state.objekt.objektId : '';
    let vegreferanse = this.state.objekt ? Helper.vegReferanseString(this.state.objekt.lokasjon.vegReferanser[0]) : '';
    let egenskapsTyper = this.state.objektType ? this.state.objektType.egenskapsTyper : [];
    let objekt = this.state.objekt ? this.state.objekt : [];

    // Finner verdien til egenskapen til objektet. Brukes til å pre-populate egenskapene
    let finnVerdi = function (egenskap, returFunksjon) {
      let dataTilEgenskap = [];
      if (objekt.egenskaper) {
        dataTilEgenskap = objekt.egenskaper.filter((objektEgenskap) => { return objektEgenskap.id === egenskap.id; });
      }

      if (dataTilEgenskap.length > 0) {
        return returFunksjon(dataTilEgenskap[0]);
      } else {
        return '';
      }
    };

    let finnENUMVerdi = function (egenskap) {
      return finnVerdi(egenskap, function (obj) { return obj.enumVerdi.id; });
    };

    let finnTekstVerdi = function (egenskap) {
      return finnVerdi(egenskap, function (obj) { return obj.verdi; });
    };

    // Skjemanavn
    let formName = 'Rediger objekt';

    // Subtitle
    let subtitle = (
      <div style={{fontSize: '16px'}}>
        <div style={{fontWeight: 'bold'}}>{objektTypeNavn}</div>
        <div>Objektid: {objektId}</div>
        <div>Vegreferanse: {vegreferanse}</div>
      </div>
    );

    if (this.props.objektID === -1) {
      formName = 'Lag nytt objekt';
      subtitle = (
          <div style={{fontWeight: 'bold', fontSize: '16px'}}>{objektTypeNavn}</div>
      );

    }

    let redigerObjektClassName = 'RedigerObjekt';
    let formFieldsAndButtons = (<div></div>);

    // Hvis state skal være minimized
    if (!this.state.expanded) {
      if (this.props.objektID === -1) {
        redigerObjektClassName += ' RedigerObjekt-small-new RedigerObjekt-pointer';
      } else {
        redigerObjektClassName += ' RedigerObjekt-small-edit RedigerObjekt-pointer';
      }
    } else {
      formFieldsAndButtons = (
        <div>
          <CardText>
          {
              egenskapsTyper.map(function (egenskap) {
                switch (egenskap.type) {
                  case 'ENUM':
                    return (<RSkjema.ENUM verdi={finnENUMVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                  case 'Tekst':
                    return (<RSkjema.Tekst verdi={finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                  case 'Tall':
                    return (<RSkjema.Tall verdi={finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                  case 'Klokkeslett':
                    return (<RSkjema.Klokkeslett verdi={finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                  case 'Dato':
                    return (<RSkjema.Dato verdi={finnTekstVerdi(egenskap)} egenskaper={egenskap} key={egenskap.id} />);
                  default:
                    break;
                }
              })
          }
          </CardText>

          <CardActions className="RedigerObjekt-knapp-container">
            <FlatButton label="Lagre" primary={true} />
            <FlatButton label="Avbryt" onTouchTap={this.closeDialog} />
          </CardActions>
        </div>
      );
    }

    // Hvis ingen objektID er satt skal ikke skjemaet vises.
    if (!this.props.objektID) {
      return null;
    } else if (!this.state.loaded) {
      return (
        <div className={redigerObjektClassName}>
          <Card className="RedigerObjekt-Card">
            <ClearFix>
              <div className="RedigerObjekt-container RedigerObjekt-container-loader">
                <CardActions className="RedigerObjekt-lukk"><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
                <CircularProgress mode="indeterminate" className="RedigerObjekt-loader" />
              </div>
            </ClearFix>
          </Card>
        </div>
      );
    } else {
      return (
        <div className={redigerObjektClassName}>
          <Card className="RedigerObjekt-Card" onTouchTap={this.expandForm}>
            <ClearFix>
              <div className="RedigerObjekt-container">
                <CardActions className="RedigerObjekt-lukk"><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
                <CardTitle title={formName} subtitle={subtitle}  />
                {formFieldsAndButtons}
              </div>
            </ClearFix>
          </Card>
        </div>
      );
    }

  }

});

let RSkjema = {
  ENUM: React.createClass({
    mixins: [StyleResizable, React.addons.LinkedStateMixin],

    getInitialState: function() {
      return {selectLinkValue: this.props.verdi};
    },

    render: function() {
      let egenskaper = this.props.egenskaper;
      let viktighetTall = Helper.objektTypeViktighetTilNummer(egenskaper.viktighet);

      let genererMenuItems = function (egenskap) {
        var enumListeTilMenuItems = Object.keys(egenskap.enumVerdier).map( function(enumVerdi) {
            return {payload: egenskap.enumVerdier[enumVerdi].id, text: egenskap.enumVerdier[enumVerdi].verdi};
        });

        // Legg til blank førstevalg på enums som ikke er obligatorisk
        if (viktighetTall > 2) {
          enumListeTilMenuItems.unshift({payload: 0, text: ''});
        }

        return enumListeTilMenuItems;
      };

      let SelectFieldClassName = 'RedigerObjekt-selectField RedigerObjekt-permanentEtikett';
      if (this.state.selectLinkValue !== '') {
        SelectFieldClassName += ' RedigerObjekt-endretVerdi';
      }

      return (
          <div className="RedigerObjekt-enum">
            <RSkjema.Viktighet viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />
            <SelectField
              valueLink={this.linkState('selectLinkValue')}
              floatingLabelText={egenskaper.navn}
              fullWidth={true}
              menuItems={genererMenuItems(egenskaper)}
              className={SelectFieldClassName}
            />
            <RSkjema.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
          </div>
      );
    }

  }),

  Tekst: React.createClass({
    mixins: [StyleResizable, React.addons.LinkedStateMixin],

    getInitialState: function() {
      return { textLinkValue: this.props.verdi };
    },

    render: function() {
      let egenskaper = this.props.egenskaper;

      let TextFieldClassName = 'RedigerObjekt-permanentEtikett';
      if (this.state.textLinkValue !== '') {
        TextFieldClassName += ' RedigerObjekt-endretVerdi';
      }

      return (
        <div className="RedigerObjekt-tekst">
          <RSkjema.Viktighet viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />
          <TextField
            floatingLabelText={egenskaper.navn}
            valueLink={this.linkState('textLinkValue')}
            fullWidth={true}
            className={TextFieldClassName}
          />
          <RSkjema.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  Tall: React.createClass({
    mixins: [StyleResizable],

    getInitialState: function() {
      return {
        numberValue: this.props.verdi,
        numberValueErrorText: ''
      };
    },

    handleChange: function (event) {
      function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      let newValue = event.target.value;

      if (isNumber(newValue) || newValue === '') {
        this.setState({
          numberValue: newValue,
          numberValueErrorText: ''
        });
      } else {
        this.setState({
          numberValue: newValue,
          numberValueErrorText: 'Dette feltet må være et tall'
        });
      }

    },

    render: function() {
      let egenskaper = this.props.egenskaper;

      let NumberFieldClassName = 'RedigerObjekt-permanentEtikett';
      if (this.state.numberValue !== '') {
        NumberFieldClassName += ' RedigerObjekt-endretVerdi';
      }
      if (this.state.numberValueErrorText !== '') {
        NumberFieldClassName += ' RedigerObjekt-feilmelding';
      }

      return (
        <div className="RedigerObjekt-tall">
          <RSkjema.Viktighet viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />
          <TextField
            floatingLabelText={egenskaper.navn}
            value={this.state.numberValue}
            onChange={this.handleChange}
            errorText={this.state.numberValueErrorText}
            fullWidth={true}
            className={NumberFieldClassName}
          />
          <RSkjema.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  Klokkeslett: React.createClass({
    mixins: [StyleResizable],

    getInitialState: function() {
      return {klokkeVerdi: ''};
    },

    handleChange: function (error, time) {
      let nyTid = new Date(time);
      this.setState({klokkeVerdi: Helper.minstToSiffer(nyTid.getHours()) + ':' + Helper.minstToSiffer(nyTid.getMinutes())});
    },

    handleClear: function () {
      this.refs.tidvelger.refs.input.clearValue();
      this.replaceState(this.getInitialState());
    },

    componentDidMount: function () {
      if (this.refs.tidvelger) {
        if (this.props.verdi.length > 0) {
          let tidObjekt = new Date();
          tidObjekt.setHours((this.props.verdi).substr(0, 2));
          tidObjekt.setMinutes((this.props.verdi).substr(-2));
          this.refs.tidvelger.setTime(tidObjekt);

          this.setState({klokkeVerdi: this.props.verdi});
        }
      }
    },

    render: function() {
      let egenskaper = this.props.egenskaper;

      // Setter klassenavn
      let classNameLabelText = 'RedigerObjekt-etikett';

      let TimePickerClassName = 'RedigerObjekt-timePicker';
      if (this.state.klokkeVerdi !== '') {
        TimePickerClassName += ' RedigerObjekt-endretVerdi';
      }

      return (
        <div className="RedigerObjekt-klokkeslett" >
          <RSkjema.Viktighet viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />

          <div className="RedigerObjekt-timePickerContainer">
            <div className={classNameLabelText}>{egenskaper.navn}</div>

            <TimePicker
              ref="tidvelger"
              format="24hr"
              onChange={this.handleChange}
              className={TimePickerClassName}
            />
          </div>
          <RSkjema.TomFelt tomFelt={this.handleClear} tomt={(this.state.klokkeVerdi.length === 0)} />
          <RSkjema.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  Dato: React.createClass({
    mixins: [StyleResizable],

    getInitialState: function() {
      return {datoVerdi: this.props.verdi};
    },

    handleChange: function (error, dato) {
      let nyDato = new Date(dato);
      this.setState({datoVerdi: Helper.minstToSiffer(nyDato.getFullYear()) + '-' + Helper.minstToSiffer(nyDato.getMonth() + 1) + '-' + Helper.minstToSiffer(nyDato.getDate())});
    },

    handleClear: function () {
      this.refs.datovelger.refs.input.clearValue();
      this.replaceState(this.getInitialState());
    },

    componentDidMount: function () {
      if (this.refs.datovelger) {
        if (this.state.datoVerdi.length > 0) {
          let datoObjekt = new Date();
          datoObjekt.setYear((this.state.datoVerdi).substr(0, 4));
          datoObjekt.setMonth((this.state.datoVerdi).substr(4, 2));
          datoObjekt.setDate((this.state.datoVerdi).substr(-2));
          this.refs.datovelger.setDate(datoObjekt);
        }
      }
    },

    render: function() {
      let egenskaper = this.props.egenskaper;

      // Setter klassenavn
      let classNameLabelText = 'RedigerObjekt-etikett';

      let DatePickerClassName = 'RedigerObjekt-datePicker';
      if (this.state.datoVerdi !== '') {
        DatePickerClassName += ' RedigerObjekt-endretVerdi';
      }

      return (
        <div className="RedigerObjekt-klokkeslett">
          <RSkjema.Viktighet viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />

          <div className="RedigerObjekt-datePickerContainer">
            <div className={classNameLabelText}>{egenskaper.navn}</div>

            <DatePicker
              ref="datovelger"
              showYearSelector={true}
              onChange={this.handleChange}
              className={DatePickerClassName}
            />
          </div>
          <RSkjema.TomFelt tomFelt={this.handleClear} tomt={(this.state.datoVerdi.length === 0)} />
          <RSkjema.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  TomFelt: React.createClass({
    render: function() {
      // Setter klassenavn
      let classNameTomKnapp = 'RedigerObjekt-tomKnapp';
      if (this.props.tomt) {
        classNameTomKnapp += ' RedigerObjekt-tomKnappSkjul';
      }

      return (
        <div className={classNameTomKnapp}>
          <i className="material-icons" onTouchTap={this.props.tomFelt}>clear</i>
        </div>
      );
    }

  }),

  Beskrivelse: React.createClass({
    render: function() {
      return (
        <div className="RedigerObjekt-beskrivelse">
          <div className="RedigerObjekt-beskrivelseTekst">{this.props.beskrivelse}</div>
        </div>
      );
    }

  }),

  Viktighet: React.createClass({
    render: function() {
      // Setter klassenavn
      let viktighetTall = Helper.objektTypeViktighetTilNummer(this.props.viktighet);
      let classNameViktighet = 'RedigerObjekt-viktighet RedigerObjekt-viktighet-' + viktighetTall;

      return (
        <div className="RedigerObjekt-viktighetContainer">
          <div className={classNameViktighet}>{this.props.viktighet}</div>
        </div>
      );
    }

  })

};

module.exports = RedigerObjekt;
