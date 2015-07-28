let React = require('react/addons');
let Helper = require('./helper.js');
let RegDemActions = require('./actions');

let { SelectField, TextField, TimePicker, DatePicker } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let Fields = {
  ENUM: React.createClass({
    getInitialState: function() {
      return {
        selectValue: this.props.verdi,
        selectValueErrorText: this.props.warning
      };
    },

    handleChange: function (e) {
      this.setState({
        selectValue: e.target.value.payload,
        selectValueErrorText: ''
      });
      RegDemActions.updateENUMValue(this.props.data.listPosition, this.props.egenskaper.id, e.target.value);
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
      if (this.state.selectValue !== '') {
        SelectFieldClassName += ' Editor-endretVerdi';
      }
      if (this.state.selectValueErrorText !== '') {
        SelectFieldClassName += ' Editor-feilmelding';
      }

      return (
          <div className="Editor-enum">
            <Fields.Viktighet viktighet={egenskaper.viktighet} />
            <SelectField
              value={this.state.selectValue}
              onChange={this.handleChange}
              floatingLabelText={egenskaper.navn}
              fullWidth={true}
              errorText={this.state.selectValueErrorText}
              menuItems={genererMenuItems(egenskaper)}
              className={SelectFieldClassName}
            />
            <Fields.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
          </div>
      );
    }

  }),

  Tekst: React.createClass({
    getInitialState: function() {
      return {
        textValue: this.props.verdi,
        textValueErrorText: this.props.warning
      };
    },

    handleChange: function (e) {
      this.setState({
        textValue: e.target.value,
        textValueErrorText: ''
      });
      RegDemActions.updateFieldValue(this.props.data.listPosition, this.props.egenskaper.id, e.target.value, 'Tekst');
    },

    render: function() {
      let egenskaper = this.props.egenskaper;

      let TextFieldClassName = 'Editor-permanentEtikett';
      if (this.state.textValue !== '') {
        TextFieldClassName += ' Editor-endretVerdi';
      }
      if (this.state.textValueErrorText !== '') {
        TextFieldClassName += ' Editor-feilmelding';
      }

      return (
        <div className="Editor-tekst">
          <Fields.Viktighet viktighet={egenskaper.viktighet} />
          <TextField
            floatingLabelText={egenskaper.navn}
            value={this.state.textValue}
            onChange={this.handleChange}
            errorText={this.state.textValueErrorText}
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
        numberValueErrorText: this.props.warning
      };
    },

    handleChange: function (event) {
      let newValue = event.target.value;

      if (Helper.isNumber(newValue) || newValue === '') {
        this.setState({
          numberValue: newValue,
          numberValueErrorText: ''
        });
        RegDemActions.updateFieldValue(this.props.data.listPosition, this.props.egenskaper.id, newValue, 'Tall');
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

      let enhet = '';
      if (egenskaper.enhet) {
        enhet = (
          <div>
            Enhet: {egenskaper.enhet.navn}
          </div>
        );
      }

      let beskrivelse = (
        <div>
          {egenskaper.beskrivelse}
          {enhet}
        </div>
      );

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
        <Fields.Beskrivelse beskrivelse={beskrivelse} />
        </div>
      );
    }

  }),

  Klokkeslett: React.createClass({
    getInitialState: function() {
      return {
        klokkeVerdi: '',
        klokkeVerdiErrorText: ''
        };
    },

    componentWillReceiveProps: function (nextProps) {
      if (nextProps.warning) {
        this.setState({
          klokkeVerdiErrorText: nextProps.warning
        });
      } else {
        this.setState({
          klokkeVerdieErrorText: ''
        });
      }
    },

    handleChange: function (error, time) {
      let nyTid = new Date(time);
      let timeValue = Helper.twoDigits(nyTid.getHours()) + ':' + Helper.twoDigits(nyTid.getMinutes());
      this.setState({
        klokkeVerdi: timeValue,
        klokkeVerdieErrorText: ''
      });
      RegDemActions.updateFieldValue(this.props.data.listPosition, this.props.egenskaper.id, timeValue, 'Tid');
    },

    handleClear: function () {
      this.refs.tidvelger.refs.input.clearValue();
      this.setState({
        klokkeVerdi: '',
        klokkeVerdiErrorText: ''
      });
      RegDemActions.updateFieldValue(this.props.data.listPosition, this.props.egenskaper.id, '', 'Tid');
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
      if (this.state.klokkeVerdiErrorText !== '') {
        TimePickerClassName += ' Editor-feilmelding';
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
              errorText={this.state.klokkeVerdierrorText}
              className={TimePickerClassName}
            />
          </div>
          <Fields.TomFelt
            tomFelt={this.handleClear}
            tomt={(this.state.klokkeVerdi.length === 0)}
          />
          <Fields.Beskrivelse beskrivelse={egenskaper.beskrivelse} />
        </div>
      );
    }

  }),

  Dato: React.createClass({
    getInitialState: function() {
      return {
        datoVerdi: this.props.verdi,
        datoVerdiErrorText: this.props.warning
      };
    },

    handleChange: function (error, dato) {
      let nyDato = new Date(dato);
      let dateValue = Helper.twoDigits(nyDato.getFullYear()) + '-' + Helper.twoDigits(nyDato.getMonth() + 1) + '-' + Helper.twoDigits(nyDato.getDate());
      this.setState({
        datoVerdi: dateValue,
        datoVerdiErrorText: ''
      });
      RegDemActions.updateFieldValue(this.props.data.listPosition, this.props.egenskaper.id, dateValue, 'Dato');
    },

    handleClear: function () {
      this.refs.datovelger.refs.input.clearValue();
      this.setState({
        datoVerdi: '',
        datoVerdiErrorText: ''
      });
      RegDemActions.updateFieldValue(this.props.data.listPosition, this.props.egenskaper.id, '', 'Dato');
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
      if (this.state.datoVerdiErrorText !== '') {
        DatePickerClassName += ' Editor-feilmelding';
      }

      return (
        <div className="Editor-datePicker">
          <Fields.Viktighet viktighet={egenskaper.viktighet} />

          <div className="Editor-datePickerContainer">
            <div className={classNameLabelText}>{egenskaper.navn}</div>

            <DatePicker
              ref="datovelger"
              showYearSelector={true}
              onChange={this.handleChange}
              errorText={this.state.datoVerdiErrorText}
              className={DatePickerClassName}
            />
          </div>
          <Fields.TomFelt
            tomFelt={this.handleClear}
            tomt={(this.state.datoVerdi.length === 0)}
          />
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

  }),

  ErrorInfo: React.createClass({
    render: function () {
      return (
        <div className='Editor-ErrorInfo'>{this.props.text}</div>
      );
    }
  })

};

module.exports = Fields;
