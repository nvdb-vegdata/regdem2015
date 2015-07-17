let Helper = require('./helper.js');

let validateNewObjektAndReturnJSON = function (data) {
  if (data && data.objektEdited) {
    let objekt = data.objektEdited;
    let vegLenke = objekt.lokasjon.vegLenker[0];

    let punkt = [{ lenkeId: vegLenke.id, posisjon: vegLenke.fra }];
    let lokasjon = { punkt: punkt };

    let typeId = data.objektTypeId;
    let tempId = '-1';

    let egenskaper = objekt.egenskaper;
    egenskaper.push(
      {
        //Byggår
        typeId: 10288,
        verdi: [
          "2004"
        ]
      },
      {
        //Materiale
        typeId: 8798,
        verdi: [
          "Asfalt"
        ]
      },
      {
        //Type
        typeId: 1156,
        verdi: [
          "Fartshump"
        ]
      },
      {
        //Profil
        typeId: 8799,
        verdi: [
          "Profil 5, modifisert sirkel-40"
        ]
      }
    );

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


module.exports.validateNewObjektAndReturnJSON = validateNewObjektAndReturnJSON;
