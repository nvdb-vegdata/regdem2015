let React = require('react/addons');
let mui = require('material-ui');
let RegDemActions = require('./actions');
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

let Editor = React.createClass({
  // Mixins, for linked state
  mixins: [StyleResizable, React.addons.LinkedStateMixin],

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

  closeDialog: function () {
    RegDemActions.closeEditor();
  },

  expandForm: function () {
    if (!this.props.data.editor.expanded) {
      RegDemActions.expandEditor();
    }
  },

  render: function() {
    let objektTypeNavn = this.props.data.objektType ? this.props.data.objektType.navn : '';
    let objektId = this.props.data.objekt ? this.props.data.objekt.objektId : '';
    let vegreferanse = this.props.data.objekt ? Helper.vegReferanseString(this.props.data.objekt.lokasjon.vegReferanser[0]) : '';
    let egenskapsTyper = this.props.data.objektType ? this.props.data.objektType.egenskapsTyper : [];
    let objekt = this.props.data.objekt ? this.props.data.objekt : [];

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

    if (this.props.data.objektID === -1) {
      formName = 'Lag nytt objekt';
      subtitle = (
          <div style={{fontWeight: 'bold', fontSize: '16px'}}>{objektTypeNavn}</div>
      );

    }

    let EditorClassName = 'Editor';
    let formFieldsAndButtons = (<div></div>);

    // Hvis state skal være minimized
    if (!this.props.data.editor.expanded) {
      if (this.props.data.objektID === -1) {
        EditorClassName += ' Editor-small-new Editor-pointer';
      } else {
        EditorClassName += ' Editor-small-edit Editor-pointer';
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

          <CardActions className="Editor-knapp-container">
            <FlatButton label="Lagre" primary={true} />
            <FlatButton label="Avbryt" onTouchTap={this.closeDialog} />
          </CardActions>
        </div>
      );
    }

    // Hvis ingen objektID er satt skal ikke skjemaet vises.
    if (!this.props.data.objektID) {
      return null;
    } else if (this.props.data.editor.loading) {
      return (
        <div className={EditorClassName}>
          <Card className="Editor-Card">
            <ClearFix>
              <div className="Editor-container Editor-container-loader">
                <CardActions className="Editor-lukk"><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
                <CircularProgress mode="indeterminate" className="Editor-loader" />
              </div>
            </ClearFix>
          </Card>
        </div>
      );
    } else {
      return (
        <div className={EditorClassName}>
          <Card className="Editor-Card" onTouchTap={this.expandForm}>
            <ClearFix>
              <div className="Editor-container">
                <CardActions className="Editor-lukk"><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
                <CardTitle title={formName} subtitle={subtitle} />
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

      let SelectFieldClassName = 'Editor-selectField Editor-permanentEtikett';
      if (this.state.selectLinkValue !== '') {
        SelectFieldClassName += ' Editor-endretVerdi';
      }

      return (
          <div className="Editor-enum">
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

      let TextFieldClassName = 'Editor-permanentEtikett';
      if (this.state.textLinkValue !== '') {
        TextFieldClassName += ' Editor-endretVerdi';
      }

      return (
        <div className="Editor-tekst">
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

      let NumberFieldClassName = 'Editor-permanentEtikett';
      if (this.state.numberValue !== '') {
        NumberFieldClassName += ' Editor-endretVerdi';
      }
      if (this.state.numberValueErrorText !== '') {
        NumberFieldClassName += ' Editor-feilmelding';
      }

      return (
        <div className="Editor-tall">
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
      let classNameLabelText = 'Editor-etikett';

      let TimePickerClassName = 'Editor-timePicker';
      if (this.state.klokkeVerdi !== '') {
        TimePickerClassName += ' Editor-endretVerdi';
      }

      return (
        <div className="Editor-klokkeslett" >
          <RSkjema.Viktighet viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />

          <div className="Editor-timePickerContainer">
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
        if (this.state.datoVerdi.length !== 0) {
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
      let classNameLabelText = 'Editor-etikett';

      let DatePickerClassName = 'Editor-datePicker';
      if (this.state.datoVerdi !== '') {
        DatePickerClassName += ' Editor-endretVerdi';
      }

      return (
        <div className="Editor-klokkeslett">
          <RSkjema.Viktighet viktighet={egenskaper.viktighet} byttBeskrivelse={this.toggleDescription} />

          <div className="Editor-datePickerContainer">
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
      let classNameTomKnapp = 'Editor-tomKnapp';
      if (this.props.tomt) {
        classNameTomKnapp += ' Editor-tomKnappSkjul';
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
        <div className="Editor-beskrivelse">
          <div className="Editor-beskrivelseTekst">{this.props.beskrivelse}</div>
        </div>
      );
    }

  }),

  Viktighet: React.createClass({
    render: function() {
      // Setter klassenavn
      let viktighetTall = Helper.objektTypeViktighetTilNummer(this.props.viktighet);
      let classNameViktighet = 'Editor-viktighet Editor-viktighet-' + viktighetTall;

      return (
        <div className="Editor-viktighetContainer">
          <div className={classNameViktighet}>{this.props.viktighet}</div>
        </div>
      );
    }

  })

};

module.exports = Editor;
