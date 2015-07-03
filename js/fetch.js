var stub = '';
var objektListe = null;
var prevSingleConnection = null;

var containsInput = function(obj) {
  var string = obj.label.toLowerCase();
  return string.includes(stub.toLowerCase());
};

var convert = function(list) {
  return list.map( function(obj) {
    return {value: obj.id, label: obj.navn, geom: obj.geometriType};
  });
};

var comparator = function (a, b) {
  if (a.label > b.label) {
    return 1;
  }

  if (a.label < b.label) {
    return -1;
  }

  return 0;
};

let requestHTTP = function (url, callback, onlyOneConnection) {
  if (onlyOneConnection && prevSingleConnection) {
    if (prevSingleConnection.readyState !== 4) {
      prevSingleConnection.abort();
    }
    prevSingleConnection = null;
  }

  var r = new XMLHttpRequest();

  r.open('GET', url, true);
  r.onreadystatechange = () => {
    if (r.readyState !== 4 || r.status !== 200) {
      return;
    }

    callback(JSON.parse(r.responseText));
  };

  r.send();

  if (onlyOneConnection) {
    prevSingleConnection = r;
  }
};

module.exports.fetch = function(input, callback) {
  stub = input;

  var filterCallback = (responseData) => {
    var listObjects = convert(responseData.vegObjektTyper).filter(containsInput).sort(comparator);
    callback(listObjects);
  };

  var url = 'https://www.vegvesen.no/nvdb/api/datakatalog/objekttyper/.json';

  // Implementerer caching
  if (this.objektListe) {
    filterCallback(this.objektListe);
  } else {
    requestHTTP(url, (responseData) => {
      this.objektListe = responseData;
      filterCallback(this.objektListe);
    });
  }
};

module.exports.fetchObjektType = function(objektTypeID, callback) {
  var url = 'https://www.vegvesen.no/nvdb/api/datakatalog/objekttyper/' + objektTypeID + '/.json';
  requestHTTP(url, callback);
};

module.exports.fetchObjekt = function(objektID, callback) {
  var url = 'https://www.vegvesen.no/nvdb/api/vegobjekter/objekt/' + objektID + '/.json';
  requestHTTP(url, callback);
};

module.exports.fetchAPIObjekter = function(objectID, box, callback) {
  var nelat = box._northEast.lat;
  var nelng = box._northEast.lng;
  var swlat = box._southWest.lat;
  var swlng = box._southWest.lng;

  var kriterie = {
    lokasjon: {
      bbox: nelng + ',' + nelat + ',' + swlng + ',' + swlat,
      srid: 'WGS84'
    },
    objektTyper: [
      {id: objectID,
      antall: 2000}
    ]
  };

  var select = 'objektId,objektTypeId,vegObjektLokasjon/geometriWgs84';

  var url = 'https://www.vegvesen.no/nvdb/api/sok?kriterie=' + encodeURIComponent(JSON.stringify(kriterie)) + '&select=' + encodeURIComponent(select);
  requestHTTP(url, callback, true);
};
