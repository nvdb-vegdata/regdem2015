let React = require('react/addons');
let Helper = require('./helper.js');
let RegDemActions = require('./actions.js');

let KeyboardArrowDown = require('material-ui/lib/svg-icons/hardware/keyboard-arrow-down');
let { Card, CardText, List, ListItem, IconMenu } = require('material-ui');
let MenuItem = require('material-ui/lib/menus/menu-item');



//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();


let ListComponent = React.createClass({

  closeList: function () {
    RegDemActions.closeList(this.props.data.listPosition);
  },

  handleEgenskapChange: function (e, value) {
    RegDemActions.selectExtraEgenskap(this.props.data.listPosition, value);
  },

  render: function() {
    // Hvis ingen objektId er satt skal ikke skjemaet vises.
    if (this.props.data.list.open && this.props.data.searchResults) {

      let elements = this.props.data.searchResultsFull || this.props.data.searchResults;
      elements = elements.resultater[0].vegObjekter || [];
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

      let iconButtonElement = <div>{[extraEgenskapName || 'Vis ekstra informasjon ', <div className="list-extra-egenskap-choser-icon"><KeyboardArrowDown /></div>]}</div>;

      let listOfProperties = egenskapsTyper.filter((egenskap) => {
        if (egenskap) {
          switch (egenskap.type) {
            case 'ENUM':
            case 'Tekst':
            case 'Tall':
            case 'Klokkeslett':
            case 'Dato':
              return true;
            default:
              return false;
          }
        }
      });

      return (
        <div className="list">
          <Card className="list-card list-card-open">
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
                    <ListElement objekt={objekt} data={this.props.data} key={objekt.objektId} />
                  );
                })
              }
            </List>
          </Card>
        </div>
      );
    } else {
      return (<div className="list">
                <Card className="list-card">
                  <CardText>
                    <div className="heading-vegref"> </div>
                    <div className="heading-extra-egenskap"> </div>
                  </CardText>
                </Card>
              </div>);
    }
  }
});

let ListElement = React.createClass({

  handleMouseEnter: function () {
    let id = this.props.objekt.objektId;
    RegDemActions.highlightMarker(this.props.data.listPosition, id);
  },

  handleMouseLeave: function () {
    RegDemActions.highlightMarker(this.props.data.listPosition, null);
  },

  handleClick: function () {
    let id = this.props.objekt.objektId;

    RegDemActions.closeList(this.props.data.listPosition);
    RegDemActions.setObjektID(this.props.data.listPosition, id);
  },

  render: function () {
    var objektId = this.props.objekt.objektId;
    let vegref = '--';
    let extraEgenskap;

    if (this.props.objekt.lokasjon.vegReferanser) {
      vegref = Helper.vegReferanseString(this.props.objekt.lokasjon.vegReferanser[0]);
    }

    if (this.props.data.list.extraEgenskap && this.props.objekt && this.props.objekt.egenskaper) {
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
        for (var j = 0; j < this.props.data.objektType.egenskapsTyper.length; j++) {
          let egenskapDetailFromObjektType = this.props.data.objektType.egenskapsTyper[j];

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
        key={objektId}>
          <div className="list-vegref">{vegref}</div>
          <div className="list-extra-egenskap">{extraEgenskap}</div>
      </ListItem>
    );
  }

});

module.exports = ListComponent;
