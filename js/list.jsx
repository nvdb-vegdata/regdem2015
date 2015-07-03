let React = require('react/addons');
let mui = require('material-ui');
let Fetch = require('./fetch.js');
let Helper = require('./helper.js');
let { Mixins, Card, ClearFix, CardActions, FlatButton, CardTitle, CardText, CircularProgress } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

let { StyleResizable } = Mixins;

let List = React.createClass({
  getInitialState: function() {
    return {
      objektTypeID: null,
      objekter: []
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

  setObjekter: function (objekter) {
    this.setState({
      objekter: objekter
    })
  },

  render: function() {
    let objektTypeNavn = this.state.objektType ? this.state.objektType.navn : '';
    let objekter = this.state.objekter ? this.state.objekter : [];

    // Hvis ingen objektID er satt skal ikke skjemaet vises.
    if (objekter.length == 0) {
      return null;
    } else {
      var elements = objekter.resultater[0].vegObjekter;
      console.log(elements);
      return (
        <div className="list">
        <Card className="list-card">
        <ClearFix>
        <div className="list-container">
        <CardActions className="list-lukk"><i className="material-icons" onTouchTap={this.closeDialog}>clear</i></CardActions>
        <CardText>
        {
          elements.map(function (objekt) {
            return (
              <ListElement objekt={objekt}/>
            );
          })
        }
        </CardText>
        </div>
        </ClearFix>
        </Card>
        </div>
      );
    }

  }
});

let ListElement = React.createClass({
  render: function () {
    var vegref = Helper.vegReferanseString(this.props.objekt.lokasjon.vegReferanser[0]);
    return (
      <div className='list-element'>{vegref}</div>
    );
  }

});

module.exports = List;
