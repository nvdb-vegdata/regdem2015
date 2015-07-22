var Parser = {
  getKode: function (kode) {
    switch (kode) {
      case 'MANGLER_ANBEFALTE_EGENSKAPER':
        return 'Dette feltet er påkrevd.';
      case 'STØRRE_ENN_ABSOLUTT_MAKSIMUM':
        return 'Utfylt verdi overskrider feltets maksimumsverdi.';
      default:
        return kode;
    }
    return kode;
  },

  extractErrors: function (response) {
    let parser = this;
    let errors = {};
    var feil = response.resultat.vegObjekter[0].feil || [];
    var advarsler = response.resultat.vegObjekter[0].advarsel || [];

    // Legger til feil i listen.
    feil.forEach( function (obj) {
      var kode = parser.getKode(obj.kode);
      var id = obj.egenskapTypeId || null;
      errors[id] = {id:id, kode:kode, type:'feil'};
    });

    // Legger til advarsler i listen.
    advarsler.forEach( function (obj) {
      var kode = parser.getKode(obj.kode);
      // Håndterer manglende påkrevde egenskaper.
      if (kode == 'Dette feltet er påkrevd.') {
        let manglendeEgenskaper = parser.getEgenskaper(obj.melding);
        manglendeEgenskaper.forEach( function (id) {
          errors[id] = {id:id, kode:kode, type:'advarsel'};
        });
      } else {
        var id = obj.egenskapTypeId || null;
        errors[id] = {id:id, kode:kode, type:'advarsel'};
      }
    });
    return errors;
  },

  // Tar inn callback fra validering og gir tilbake liste av uoppfylte påkrevde egenskaper.
  getEgenskaper: function (validationMessage) {
    let listString = validationMessage.substring(validationMessage.indexOf(':'));
    return listString.match(/\d+(?=\))/g);
  },
}

module.exports = Parser;
