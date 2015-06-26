var qwest = require('qwest');

module.exports.fetchObjekttyper = function(callback) {
  var url = 'https://www.vegvesen.no/nvdb/api/datakatalog/objekttyper/.json';

  qwest.get(url).then(function (responseData) {
    var listObjects = responseData.vegObjektTyper.map( function(obj) {
      return {value: obj.id, label: obj.navn};
    });

    var sortedListObjects = listObjects.sort(function (a, b) {
      if (a.label > b.label) {
        return 1;
      }

      if (a.label < b.label) {
        return -1;
      }

      return 0;
    });

    callback(sortedListObjects);
  });
};

module.exports.fetchObjektType = function(objektTypeID, callback) {
   var url = 'https://www.vegvesen.no/nvdb/api/datakatalog/objekttyper/' + objektTypeID + '/.json';

  qwest.get(url).then(function (responseData) {
    callback(responseData);
  });
};

module.exports.fetchObjekt = function(objektID, callback) {
  var url = 'https://www.vegvesen.no/nvdb/api/vegobjekter/objekt/' + objektID + '/.json';

  qwest.get(url).then(function (responseData) {
    callback(responseData);
  });
};

module.exports.fetchAPIObjekter = function(objectID, box, callback) {
  var nelat = box._northEast.lat;
  var nelng = box._northEast.lng;
  var swlat = box._southWest.lat;
  var swlng = box._southWest.lng;
  var url = 'https://www.vegvesen.no/nvdb/api/vegobjekter/' + objectID + '/.json?bbox='+ nelng + ','+ nelat +','+ swlng + ',' + swlat + '&srid=WGS84&rows=2000';
  qwest.get(url).then(function(responseData) {
    callback(responseData);
  });
};
