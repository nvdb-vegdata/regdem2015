let RegDemActions = require('./actions');
let Helper = require('./helper.js');
let Fetch = require('./fetch.js');

let createJSONFromState = function (data) {
  if (data && data.objektEdited) {
    let objekt = data.objektEdited;
    let punkt, lokasjon, vegObjekter;
    let veglenke = null;

    /*
    ===================== Prepares variabler =====================
    */
    let typeId = data.objektTypeId;
    let tempId = '-1';
    let effektDato = Helper.todaysDate();
    let datakatalogversjon = '2.03';
    let newObj = false;

    if (objekt.objektId === -1) {
      newObj = true;
    }

    /*
    ===================== Prepares veglenke =====================
    */
    if (objekt.lokasjon.veglenker) {
      veglenke = objekt.lokasjon.veglenker[0];

      punkt = [{ lenkeId: veglenke.id, posisjon: veglenke.fra }];
      lokasjon = {};
      lokasjon['punkt'] = punkt;
      if (!newObj) {
        lokasjon['operasjon'] = 'oppdater';
      }
    }

    /*
    ===================== Prepares egenskaper =====================
    */
    let egenskaper = objekt.egenskaper.map(function (egenskap) {
      let returnObj = {};
      returnObj['typeId'] = egenskap.id;

      if (egenskap.verdi) {
        returnObj['verdi'] = [ egenskap.verdi ];
      } else {
        returnObj['verdi'] = [];
      }

      if (!newObj) {
        if (egenskap.verdi) {
          returnObj['operasjon'] = 'oppdater';
        } else {
          returnObj['operasjon'] = 'slett';
        }
      }

      return returnObj;
    });

    /*
    ===================== Prepares vegobjekt =====================
    */
    vegObjekter = [{}];

    if (objekt.lokasjon.veglenker) {
      vegObjekter[0]['lokasjon'] = lokasjon;
     }

     vegObjekter[0]['typeId'] = typeId;
     vegObjekter[0]['egenskaper'] = egenskaper;

     if (!newObj) {
       vegObjekter[0]['nvdbId'] = objekt.objektId;
       vegObjekter[0]['versjon'] = objekt.versjonsId;
     } else {
       vegObjekter[0]['tempId'] = tempId;
     }

     /*
     ===================== Finalize objekt construction =====================
     */
    let content = {vegObjekter: vegObjekter};
    let job = {};

    if (newObj) {
      job['registrer'] = content;
    } else {
      job['delvisOppdater'] = content;
    }

    job['effektDato'] = effektDato;
    job['datakatalogversjon'] = datakatalogversjon;

    return job;
  }
};

let validateObjekt = function (_state) {
  let queryJSON = createJSONFromState(_state);
  let url = '/nvdb/apiskriv/v2/endringssett/validator';
  RegDemActions.updateWriteStatus(_state.listPosition, 'validating');
  if (queryJSON) {
    Fetch.sendQuery('POST', url, queryJSON, (returnData) => {
      console.log(returnData);
      RegDemActions.updateValidatorResponse(_state.listPosition, returnData);
    });
  }
};

let registerObjekt = function (_state) {
  let queryJSON = createJSONFromState(_state);
  let url = '/nvdb/apiskriv/v2/endringssett';
  Fetch.sendQuery('POST', url, queryJSON, (responseData) => {
    processObjekt(_state, responseData);
  });
};

let processObjekt = function (_state, data) {
  // TODO: Mer robust trimming av lenken.
  let startURL = data[1].src.substring(27);
  let statusURL = data[4].src.substring(27);
  Fetch.sendQuery('POST', startURL, {}, (response) => {
    checkProgress(_state, statusURL);
  });
}

let checkProgress = function (_state, url) {
  Fetch.sendQuery('GET', url, {}, (response) => {
    RegDemActions.updateProgressStatus(_state.listPosition, response);
    if (response === 'UTFØRT') {
      RegDemActions.updateWriteStatus(_state.listPosition, 'done');
    } else if (response === 'AVVIST') {
      RegDemActions.updateWriteStatus(_state.listPosition, 'error');
    } else if (response == 'KANSELLERT') {
      RegDemActions.updateWriteStatus(_state.listPosition, 'error');
    } else {
      checkProgress(_state, url);
    }
  });
}

module.exports = {
  validateObjekt: validateObjekt,
  registerObjekt: registerObjekt
}
