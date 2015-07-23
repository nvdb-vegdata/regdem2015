let RegDemActions = require('./actions');
let Helper = require('./helper.js');
let Fetch = require('./fetch.js');

let createJSONFromState = function (data) {
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
  let queryJSON = createJSONFromState(data);

  if (queryJSON) {
    Fetch.validateObjektSynchronized(queryJSON, (returnData) => {
      RegDemActions.updateValidatorResponse(returnData);
    });
  }
};

let registerObjekt = function (data) {
  let queryJSON = createJSONFromState(data);

  console.log('Start registration: ', queryJSON);
  Fetch.registrerEndringssett(queryJSON, (returnData) => {
    console.log(returnData);
    let startURL = returnData[1].src.substring(27);
    let statusURL = returnData[4].src.substring(27);
    console.log(startURL);
    Fetch.startBehandlingAvEndringssett('POST', startURL, (response) => {
      console.log('Skrevet. Snakkes.', response);
    });
    setInterval(function () {
      Fetch.startBehandlingAvEndringssett('GET', statusURL, (response) => {
        console.log(response);
      });
    }, 2000);

  });
};


module.exports = {
  validateObjekt: validateObjekt,
  registerObjekt: registerObjekt
}
