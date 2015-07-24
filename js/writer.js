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
  let url = '/nvdb/apiskriv/v2/endringssett/validator';

  if (queryJSON) {
    Fetch.sendQuery('POST', url, queryJSON, (returnData) => {
      RegDemActions.updateValidatorResponse(returnData);
    });
  }
};

let registerObjekt = function (data) {
  let queryJSON = createJSONFromState(data);
  let url = '/nvdb/apiskriv/v2/endringssett';
  Fetch.sendQuery('POST', url, queryJSON, (responseData) => {
    processObjekt(responseData)
  });
};

let processObjekt = function (data) {
  // TODO: Mer robust trimming av lenken.
  let startURL = data[1].src.substring(27);
  let statusURL = data[4].src.substring(27);
  Fetch.sendQuery('POST', startURL, {}, (response) => {
    console.log('processing: ', response);
    checkProgress(statusURL);
  });
}

let checkProgress = function (url) {
  Fetch.sendQuery('GET', url, {}, (response) => {
    console.log(response);
    RegDemActions.updateProgressStatus(response);
    if (response === 'UTFØRT') {
      RegDemActions.updateWriteStatus('done');
    } else if (response === 'AVVIST') {
      RegDemActions.updateWriteStatus('error');
    } else if (response == 'KANSELLERT') {
      RegDemActions.updateWriteStatus('error');
    } else {
      checkProgress(url);
    }
  });
}

module.exports = {
  validateObjekt: validateObjekt,
  registerObjekt: registerObjekt
}
