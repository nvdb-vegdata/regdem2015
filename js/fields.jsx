let React = require('react/addons');
let Helper = require('./helper.js');

let { SelectField, TextField, TimePicker, DatePicker } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Fields = {
  ENUM: React.createClass({
    mixins: [React.addons.LinkedStateMixin],

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
            <Fields.Viktighet viktighet={egenskaper.viktighet} />
            <SelectField
              valueLink={this.linkState('selectLinkValue')}
              floatingLabelText={egenskaper.navn}
              fullWidth={true}
              menuItems={genererMenuItems(egenskaper)}
              className={SelectFieldClassName}
            />
            <Fields.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
          </div>
      );
    }

  }),

  Tekst: React.createClass({
    mixins: [React.addons.LinkedStateMixin],

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
          <Fields.Viktighet viktighet={egenskaper.viktighet} />
          <TextField
            floatingLabelText={egenskaper.navn}
            valueLink={this.linkState('textLinkValue')}
            fullWidth={true}
            className={TextFieldClassName}
          />
          <Fields.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  Tall: React.createClass({
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
          <Fields.Viktighet viktighet={egenskaper.viktighet} />
          <TextField
            floatingLabelText={egenskaper.navn}
            value={this.state.numberValue}
            onChange={this.handleChange}
            errorText={this.state.numberValueErrorText}
            fullWidth={true}
            className={NumberFieldClassName}
          />
          <Fields.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  Klokkeslett: React.createClass({
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
          <Fields.Viktighet viktighet={egenskaper.viktighet} />

          <div className="Editor-timePickerContainer">
            <div className={classNameLabelText}>{egenskaper.navn}</div>

            <TimePicker
              ref="tidvelger"
              format="24hr"
              onChange={this.handleChange}
              className={TimePickerClassName}
            />
          </div>
          <Fields.TomFelt tomFelt={this.handleClear} tomt={(this.state.klokkeVerdi.length === 0)} />
          <Fields.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  Dato: React.createClass({
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
          <Fields.Viktighet viktighet={egenskaper.viktighet} />

          <div className="Editor-datePickerContainer">
            <div className={classNameLabelText}>{egenskaper.navn}</div>

            <DatePicker
              ref="datovelger"
              showYearSelector={true}
              onChange={this.handleChange}
              className={DatePickerClassName}
            />
          </div>
          <Fields.TomFelt tomFelt={this.handleClear} tomt={(this.state.datoVerdi.length === 0)} />
          <Fields.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
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

module.exports = Fields;
