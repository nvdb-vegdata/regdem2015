var Helper = {

  // Tar imot et vegReferanse objekt og lager en streng
  vegReferanseString: function (vegReferanse) {
    return vegReferanse.fylke + ('0' + vegReferanse.kommune).slice(-2) + ' ' + vegReferanse.kategori + vegReferanse.status + vegReferanse.nummer + ' HP' + vegReferanse.hp + ' m' + vegReferanse.fraMeter;
  },

  // Et vegobjekt har egenskaper med ulike viktighet. Denne funskjonen mapper
  // viktighet til ekvivalent nummerrepresentasjon
  objektTypeViktighetTilNummer: function (viktighet) {
    switch (viktighet) {
      case 'PÅKREVD_ABSOLUTT':
        return 1;
      case 'PÅKREVD':
        return 2;
      case 'BETINGET':
        return 3;
      case 'OPSJONELL':
        return 4;
      case 'MINDRE_VIKTIG':
        return 7;
      case 'HISTORISK':
        return 9;
      case 'IKKE_SATT':
      default:
        return 999;
    }
  },

  minstToSiffer: function (i) {
    return (i < 10) ? '0' + i : '' + i;
  },

  // Tar inn callback fra validering og gir tilbake liste av uoppfylte påkrevde egenskaper.
  getManglendeEgenskaper: function (validationMessage) {
    let listString = validationMessage.substring(validationMessage.indexOf(':'));
    return listString.match(/\d+(?=\))/g);
  }

};

module.exports = Helper;
