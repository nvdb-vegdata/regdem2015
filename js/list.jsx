let React = require('react/addons');
let Helper = require('./helper.js');
let RegDemActions = require('./actions.js');

let KeyboardArrowDown = require('material-ui/lib/svg-icons/hardware/keyboard-arrow-down');
let Clear = require('material-ui/lib/svg-icons/content/clear');
let { Card, CardActions, CardTitle, CardText, List, ListItem, IconButton, IconMenu, FlatButton } = require('material-ui');
let MenuItem = require('material-ui/lib/menus/menu-item');



//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();


let ListComponent = React.createClass({

  closeList: function () {
    RegDemActions.closeList();
  },

  handleEgenskapChange: function (e, value) {
    RegDemActions.selectExtraEgenskap(value);
  },

  render: function() {
    // Hvis ingen objektID er satt skal ikke skjemaet vises.
    if (this.props.data.list.open && this.props.data.searchResults) {
      var elements = this.props.data.searchResultsFull || this.props.data.searchResults;
      elements = elements.resultater[0].vegObjekter || [];
      var size = elements.length;

      let egenskapsTyper = this.props.data.objektType ? this.props.data.objektType.egenskapsTyper : [];

      let extraEgenskapName = '';
      if (this.props.data.list.extraEgenskap) {
        for (var i = 0; i < egenskapsTyper.length; i++) {
          if (egenskapsTyper[i].id === this.props.data.list.extraEgenskap) {
            extraEgenskapName = egenskapsTyper[i].navn;
            break;
          }
        }
      }

      // let iconButtonElement = <FlatButton label={[extraEgenskapName || 'Vis ekstra informasjon ', <div className="list-extra-egenskap-choser-icon"><KeyboardArrowDown /></div>]} />;
      let iconButtonElement = <div>{[extraEgenskapName || 'Vis ekstra informasjon ', <div className="list-extra-egenskap-choser-icon"><KeyboardArrowDown /></div>]}</div>;

      let listOfProperties = egenskapsTyper.filter((egenskap) => {
        if (egenskap) {
          switch (egenskap.type) {
            case 'ENUM':
            case 'Tekst':
            case 'Tall':
            case 'Klokkeslett':
            case 'Dato':
              return true;
              break;
            default:
              return false;
          }
        };
      });

      return (
        <div className="list">
          <Card className="list-card">
            <div className="list-container">
              <CardActions className="list-lukk"><i className="material-icons" onTouchTap={this.closeList}>clear</i></CardActions>
              <CardTitle title="Liste" subtitle={size + ' elementer'} />
              <CardText>
                <div className="heading-vegref">Vegreferanse</div>
                <div className="heading-extra-egenskap">
                  <IconMenu iconButtonElement={iconButtonElement} onChange={this.handleEgenskapChange} value={this.props.data.list.extraEgenskap}>
                    <MenuItem primaryText="Ingen" value="0" />
                    {
                      listOfProperties.map((egenskap) => {
                        return (
                          <MenuItem primaryText={egenskap.navn} value={egenskap.id} key={egenskap.id} />
                        );
                      })
                    }
                  </IconMenu>
                </div>
              </CardText>
              <List className="list-element-container">
                {
                  elements.map((objekt) => {
                    return (
                      <ListElement objekt={objekt} data={this.props.data} key={objekt.objektID} />
                    );
                  })
                }
              </List>
            </div>
          </Card>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }
});

let ListElement = React.createClass({

  handleMouseEnter: function (event) {
    let id = this.props.objekt.objektId;
    RegDemActions.highlightMarker(id);
  },

  handleMouseLeave: function () {
    RegDemActions.highlightMarker(null);
  },

  handleClick: function (event) {
    let id = this.props.objekt.objektId;

    RegDemActions.closeList();
    RegDemActions.setObjektID(id);
  },

  render: function () {
    var objektID = this.props.objekt.objektId;
    let vegref = '--';
    let extraEgenskap;

    if (this.props.objekt.lokasjon.vegReferanser) {
      vegref = Helper.vegReferanseString(this.props.objekt.lokasjon.vegReferanser[0]);
    }

    if (this.props.data.list.extraEgenskap) {
      extraEgenskap = '--';
      
      // Ser om det finnes en egenskap på objektet for valgt egenskap
      let egenskapDetails = null;
      for (var i = 0; i < this.props.objekt.egenskaper.length; i++) {
        if (this.props.objekt.egenskaper[i].id === this.props.data.list.extraEgenskap) {
          egenskapDetails = this.props.objekt.egenskaper[i];
          break;
        }
      }

      if (egenskapDetails) {
        // Finner ut hvordan man skal hente ut egenskap
        for (var i = 0; i < this.props.data.objektType.egenskapsTyper.length; i++) {
          let egenskapDetailFromObjektType = this.props.data.objektType.egenskapsTyper[i];

          if (egenskapDetailFromObjektType.id === this.props.data.list.extraEgenskap) {

            switch (egenskapDetailFromObjektType.type) {
              case 'ENUM':
                extraEgenskap = egenskapDetails.enumVerdi.verdi;
                break;
              case 'Tekst':
              case 'Tall':
              case 'Klokkeslett':
              case 'Dato':
                extraEgenskap = egenskapDetails.verdi;
                break;
              default:
                break;
            }
            break;
          }
        }
      }
    }

    return (
      <ListItem
        onMouseOver={this.handleMouseEnter}
        onMouseOut={this.handleMouseLeave}
        onTouchTap={this.handleClick}
        key={objektID}>
          <div className="list-vegref">{vegref}</div>
          <div className="list-extra-egenskap">{extraEgenskap}</div>
      </ListItem>
    );
  }

});

module.exports = ListComponent;
