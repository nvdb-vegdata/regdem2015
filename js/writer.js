let RegDemActions = require('./actions');
let Helper = require('./helper.js');
let Fetch = require('./fetch.js');

let createJSONFromState = function (data) {
  if (data && data.objektEdited) {
    let objekt = data.objektEdited;
    let punkt, lokasjon, vegObjekter;
    let veglenke = null;

    if (objekt.lokasjon.veglenker) {
      veglenke = objekt.lokasjon.veglenker[0];

      punkt = [{ lenkeId: veglenke.id, posisjon: veglenke.fra }];
      lokasjon = { punkt: punkt };
    }

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

    if (objekt.lokasjon.veglenker) {
      vegObjekter = [{
        lokasjon: lokasjon,
        typeId: typeId,
        tempId: tempId,
        egenskaper: egenskaper
       }];
     } else {
       vegObjekter = [{
         typeId: typeId,
         tempId: tempId,
         egenskaper: egenskaper
        }];
     }

    let registrer = {vegObjekter: vegObjekter};
    let job = {
      registrer: registrer,
      effektDato: effektDato,
      datakatalogversjon: datakatalogversjon
    };

    return job;
  }
};

let validateObjekt = function (_state) {
  let queryJSON = createJSONFromState(_state);
  let url = '/nvdb/apiskriv/v2/endringssett/validator';

  if (queryJSON) {
    Fetch.sendQuery('POST', url, queryJSON, (returnData) => {
      RegDemActions.updateValidatorResponse(_state.listPosition, returnData);
    });
  }
};

let checkProgress = function (_state, url) {
  Fetch.sendQuery('GET', url, {}, (response) => {
    console.log(response);
    RegDemActions.updateProgressStatus(_state.listPosition, response);
    if (response === 'UTFØRT') {
      RegDemActions.updateWriteStatus(_state.listPosition, 'done');
    } else if (response === 'AVVIST') {
      RegDemActions.updateWriteStatus(_state.listPosition, 'error');
    } else if (response === 'KANSELLERT') {
      RegDemActions.updateWriteStatus(_state.listPosition, 'error');
    } else {
      checkProgress(_state, url);
    }
  });
};

let processObjekt = function (_state, data) {
  // TODO: Mer robust trimming av lenken.
  let startURL = data[1].src.substring(27);
  let statusURL = data[4].src.substring(27);
  Fetch.sendQuery('POST', startURL, {}, (response) => {
    console.log('processing: ', response);
    checkProgress(_state, statusURL);
  });
};

let registerObjekt = function (_state) {
  let queryJSON = createJSONFromState(_state);
  let url = '/nvdb/apiskriv/v2/endringssett';
  Fetch.sendQuery('POST', url, queryJSON, (responseData) => {
    processObjekt(_state, responseData);
  });
};

module.exports = {
  validateObjekt: validateObjekt,
  registerObjekt: registerObjekt
};
