let RegDemActions = require('./actions');
let Helper = require('./helper.js');
let Fetch = require('./fetch.js');

let validateObjektAndReturnJSON = function (data) {
  if (data && data.objektEdited) {
    let objekt = data.objektEdited;
    let veglenke = objekt.lokasjon.veglenker[0];

    let punkt = [{ lenkeId: veglenke.id, posisjon: veglenke.fra }];
    let lokasjon = { punkt: punkt };

    let typeId = data.objektTypeId;
    let tempId = '-1';

    let egenskaper = objekt.egenskaper.map(function (egenskap) {
      return {
        typeId: egenskap.id,
        verdi: [ egenskap.verdi ]
      };
    });

    egenskaper = egenskaper.filter(function (egenskap) {
      return egenskap.verdi[0];
    });

    let effektDato = Helper.todaysDate();
    let datakatalogversjon = '2.03';

    let vegObjekter = [{
      lokasjon: lokasjon,
      typeId: typeId,
      tempId: tempId,
      egenskaper: egenskaper
     }];

    let registrer = {vegObjekter: vegObjekter};
    let job = {
      registrer: registrer,
      effektDato: effektDato,
      datakatalogversjon: datakatalogversjon
    };

    return job;
  }
};

let validateObjekt = function (data) {
  let queryJSON = validateObjektAndReturnJSON(data);

  if (queryJSON) {
    Fetch.validateObjektSynchronized(queryJSON, (returnData) => {
      RegDemActions.updateValidatorResponse(returnData);
    });
  }
};


module.exports.validateObjekt = validateObjekt;
