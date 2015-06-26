let React = require('react/addons');
let mui = require('material-ui');
let Fetch = require('./fetch.js');
let Helper = require('./helper.js');
let { Mixins, SelectField, TextField, RaisedButton, TimePicker, DatePicker } = require('material-ui');

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
      objektType: null
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
    Fetch.fetchObjekt(this.props.objektID, (objektData) => {
      if (this.isMounted()) {
        this.setState({objekt: objektData});

        // Nå som vi har objektet, kan vi hente objekttype
        Fetch.fetchObjektType(objektData.objektTypeId, (objektTypeData) => {
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

            this.setState({objektType: objektTypeData});
          }
        });
      }
    });
  },

  render: function() {
    let objektTypeNavn = this.state.objektType ? this.state.objektType.navn : '';
    let objektId = this.state.objekt ? this.state.objekt.objektId : '';
    let vegreferanse = this.state.objekt ? Helper.vegReferanseString(this.state.objekt.lokasjon.vegReferanser[0]) : '';
    let egenskapsTyper = this.state.objektType ? this.state.objektType.egenskapsTyper : [];
    let objekt = this.state.objekt ? this.state.objekt : [];

    // Finner verdien til egenskapen til objektet. Brukes til å pre-populate egenskapene
    let finnVerdi = function (egenskap, returFunksjon) {
      let dataTilEgenskap = objekt.egenskaper.filter((objektEgenskap) => { return objektEgenskap.id === egenskap.id; });

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

    return (
      <div className="RedigerObjekt-container">

        <div className="RedigerObjekt-info-container">
          <div className="text-headline">{objektTypeNavn}</div>
          <div className="text-subhead">Objektid: {objektId}</div>
          <div className="text-subhead">Vegreferanse: {vegreferanse}</div>
        </div>

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

        <div className="RedigerObjekt-knapp-container">
          <RaisedButton label="Lagre" primary={true} /> <RaisedButton label="Avbryt" />
        </div>

      </div>
    );
  }

});

let RSkjema = {
  ENUM: React.createClass({
    mixins: [StyleResizable, React.addons.LinkedStateMixin],

    getInitialState: function() {
      return {selectLinkValue: this.props.verdi};
    },

    toggleDescription: function () {
      this.refs.beskrivelse.setState({visBeskrivelse: !this.refs.beskrivelse.state.visBeskrivelse});
    },

    render: function() {
      let egenskaper = this.props.egenskaper;
      let viktighetTall = Helper.objektTypeViktighetTilNummer(egenskaper.viktighet);

      let genererMenuItems = function (egenskap) {
        var enumListeTilMenuItems = Object.keys(egenskap.enumVerdier).map( function(enumVerdi) {
            return {payload: egenskap.enumVerdier[enumVerdi].id, text: egenskap.enumVerdier[enumVerdi].verdi};
        });

        // Legg til blank førstevalg.
        if (viktighetTall > 2) {
          enumListeTilMenuItems.unshift({payload: 0, text: ''});
        }

        return enumListeTilMenuItems;
      };

      return (
          <div className="RedigerObjekt-enum">
            <RSkjema.Ekstra viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />
            <SelectField
              valueLink={this.linkState('selectLinkValue')}
              floatingLabelText={egenskaper.navn}
              fullWidth={true}
              menuItems={genererMenuItems(egenskaper)}
              className="RedigerObjekt-selectField"
            />
            <RSkjema.Beskrivelse ref="beskrivelse" beskrivelse={egenskaper.beskrivelse} />
          </div>
      );
    }

  }),

  Tekst: React.createClass({
    mixins: [StyleResizable, React.addons.LinkedStateMixin],

    getInitialState: function() {
      return { textLinkValue: this.props.verdi };
    },

    toggleDescription: function () {
      this.refs.beskrivelse.setState({visBeskrivelse: !this.refs.beskrivelse.state.visBeskrivelse});
    },

    render: function() {
      let egenskaper = this.props.egenskaper;

      return (
        <div className="RedigerObjekt-tekst">
          <RSkjema.Ekstra viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />
          <TextField
            floatingLabelText={egenskaper.navn}
            valueLink={this.linkState('textLinkValue')}
            fullWidth={true}
          />
          <RSkjema.Beskrivelse ref="beskrivelse" beskrivelse={egenskaper.beskrivelse} />
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

      if (isNumber(newValue)) {
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

    toggleDescription: function () {
      this.refs.beskrivelse.setState({visBeskrivelse: !this.refs.beskrivelse.state.visBeskrivelse});
    },

    render: function() {
      let egenskaper = this.props.egenskaper;

      return (
        <div className="RedigerObjekt-tall">
          <RSkjema.Ekstra viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />
          <TextField
            floatingLabelText={egenskaper.navn}
            value={this.state.numberValue}
            onChange={this.handleChange}
            errorText={this.state.numberValueErrorText}
            fullWidth={true}
          />
          <RSkjema.Beskrivelse ref="beskrivelse" beskrivelse={egenskaper.beskrivelse} />
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

    toggleDescription: function () {
      this.refs.beskrivelse.setState({visBeskrivelse: !this.refs.beskrivelse.state.visBeskrivelse});
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

      // Setter på et nytt klassenavn hvis datofelt er tomt. Det gjør at vi kan lage
      // en større label mer likt TextField
      if (this.state.klokkeVerdi.length === 0) {
        classNameLabelText += ' RedigerObjekt-etikettTom';
      }

      return (
        <div className="RedigerObjekt-klokkeslett" >
          <RSkjema.Ekstra viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />

          <div className="RedigerObjekt-timePickerContainer">
            <div className={classNameLabelText}>{egenskaper.navn}</div>

            <TimePicker
              ref="tidvelger"
              format="24hr"
              onChange={this.handleChange}
              className="RedigerObjekt-timePicker"
            />
          </div>
          <RSkjema.TomFelt tomFelt={this.handleClear} tomt={(this.state.klokkeVerdi.length === 0)} />
          <RSkjema.Beskrivelse ref="beskrivelse" beskrivelse={egenskaper.beskrivelse} />
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

    toggleDescription: function () {
      this.refs.beskrivelse.setState({visBeskrivelse: !this.refs.beskrivelse.state.visBeskrivelse});
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

      if (this.state.datoVerdi.length === 0) {
        classNameLabelText += ' RedigerObjekt-etikettTom';
      }

      return (
        <div className="RedigerObjekt-klokkeslett">
          <RSkjema.Ekstra viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />

          <div className="RedigerObjekt-datePickerContainer">
            <div className={classNameLabelText}>{egenskaper.navn}</div>

            <DatePicker
              ref="datovelger"
              showYearSelector={true}
              onChange={this.handleChange}
              className="RedigerObjekt-datePicker"
            />
          </div>
          <RSkjema.TomFelt tomFelt={this.handleClear} tomt={(this.state.datoVerdi.length === 0)} />
          <RSkjema.Beskrivelse ref="beskrivelse" beskrivelse={egenskaper.beskrivelse} />
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
          <i className="material-icons" onClick={this.props.tomFelt}>clear</i>
        </div>
      );
    }

  }),

  Beskrivelse: React.createClass({
    getInitialState: function() {
      return { visBeskrivelse: false };
    },

    toggleDescription: function () {
      this.setState({visBeskrivelse: !this.state.visBeskrivelse});
    },

    render: function() {
      // Setter klassenavn
      let classNameBeskrivelse = 'RedigerObjekt-beskrivelseTekst';
      if (this.state.visBeskrivelse) {
        classNameBeskrivelse += ' RedigerObjekt-beskrivelseTekstVis';
      }

      return (
        <div className="RedigerObjekt-beskrivelse">
          <div className="RedigerObjekt-beskrivelseKnapp" onClick={this.toggleDescription}>Info</div>
          <div className={classNameBeskrivelse}>{this.props.beskrivelse}</div>
        </div>
      );
    }

  }),

  Ekstra: React.createClass({
    render: function() {
      // Setter klassenavn
      let viktighetTall = Helper.objektTypeViktighetTilNummer(this.props.viktighet);
      let classNameViktighet = 'RedigerObjekt-viktighet RedigerObjekt-viktighet-' + viktighetTall;

      return (
        <div className="RedigerObjekt-ekstra">
          <div className={classNameViktighet}>{this.props.viktighet}</div>
        </div>
      );
    }

  })

};

module.exports = RedigerObjekt;
