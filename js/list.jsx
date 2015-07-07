let React = require('react/addons');
let mui = require('material-ui');
let Helper = require('./helper.js');
let RegDemActions = require('./actions.js');
let { Mixins, Card, ClearFix, CardActions, CardTitle, CardText } = require('material-ui');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let ThemeManager = new mui.Styles.ThemeManager();

let List = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  closeList: function () {
    RegDemActions.closeList();
  },

  render: function() {
    // Hvis ingen objektID er satt skal ikke skjemaet vises.
    if (!this.props.data.list.open ) {
      return null;
    } else {
      var elements = this.props.data.searchResults.resultater[0].vegObjekter;
      var size = elements.length;
      return (
        <div className="list">
          <Card className="list-card">
            <ClearFix>
            <div className="list-container">
              <CardActions className="list-lukk"><i className="material-icons" onTouchTap={this.closeList}>clear</i></CardActions>
              <CardTitle title="Liste" subtitle={size + ' elementer'} />
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
    var vegref;
    if(this.props.objekt.lokasjon.vegReferanser){
      vegref = Helper.vegReferanseString(this.props.objekt.lokasjon.vegReferanser[0]);
    } else {
      vegref = '--';
    }
    return (
      <div className="list-element">{vegref}</div>
    );
  }

});

module.exports = List;
