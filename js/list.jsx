let React = require('react/addons');
let Helper = require('./helper.js');
let RegDemActions = require('./actions.js');
let { Card, CardActions, CardTitle, CardText, List, ListItem, DropDownMenu, Toolbar, ToolbarGroup, ToolbarTitle, DropDownIcon, FontIcon } = require('material-ui');

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

  handleEgenskapChange: function (e, selectedIndex, menuItem) {
    RegDemActions.selectExtraEgenskap(menuItem.payload);
  },

  render: function() {
    // Hvis ingen objektID er satt skal ikke skjemaet vises.
    if (!this.props.data.list.open ) {
      return null;
    } else if (this.props.data.searchResults) {
      var elements = this.props.data.searchResultsFull || this.props.data.searchResults;
      elements = elements.resultater[0].vegObjekter || [];
      var size = elements.length;

      let egenskapsTyper = this.props.data.objektType ? this.props.data.objektType.egenskapsTyper : [];

      let listOfProperties = egenskapsTyper.map((egenskap) => {
        switch (egenskap.type) {
          case 'ENUM':
          case 'Tekst':
          case 'Tall':
          case 'Klokkeslett':
          case 'Dato':
            return {
              payload: egenskap.id,
              text: egenskap.navn
            };
            break;
          default:
        }
      });

      listOfProperties = listOfProperties.filter((egenskap) => {return egenskap;});
      listOfProperties.unshift({payload: 0, text: ''});

      return (
        <div className="list">
          <Card className="list-card">
            <div className="list-container">
              <CardActions className="list-lukk"><i className="material-icons" onTouchTap={this.closeList}>clear</i></CardActions>
              <CardTitle title="Liste" subtitle={size + ' elementer'} />
              <Toolbar className="list-toolbar">
                <ToolbarGroup key={0} float="right">
                  <ToolbarTitle text="Filtrer på egenskap" />
                  <DropDownIcon className="list-toolbar-dropdown" menuItems={listOfProperties} onChange={this.handleEgenskapChange}>
                    <FontIcon className="material-icons list-keyboard-arrow-down">keyboard_arrow_down</FontIcon>
                  </DropDownIcon>
                </ToolbarGroup>
              </Toolbar>
              <List className="list-element-container">
                {
                  elements.map((objekt) => {
                    return (
                      <ListElement objekt={objekt} data={this.props.data} />
                    );
                  })
                }
              </List>
            </div>
          </Card>
        </div>
      );
    } else {
      return null;
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
    let vegref, extraEgenskap;
    if (this.props.objekt.lokasjon.vegReferanser) {
      vegref = Helper.vegReferanseString(this.props.objekt.lokasjon.vegReferanser[0]);

      if (this.props.data.list.extraEgenskap) {
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
    } else {
      vegref = '--';
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
