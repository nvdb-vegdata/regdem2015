var qwest = require('qwest');

module.exports.fetchObjekttyper = function(callback) {
  qwest.get('resources/objekttyper.json').then(function (responseData) {
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

module.exports.fetchDatakatalogBomstasjoner = function(callback) {
  qwest.get('resources/datakatalog-bomstasjoner.json').then(function (responseData) {
    callback(responseData);
  });
};

module.exports.fetchBomstasjoner = function(callback) {
  qwest.get('resources/bomstasjoner.json').then(function (responseData) {
    callback(responseData);
  });
};

module.exports.fetchAPIObjekter = function(objectID, box, callback) {
  var nelat = box._northEast.lat;
  var nelng = box._northEast.lng;
  var swlat = box._southWest.lat;
  var swlng = box._southWest.lng;
  var url = 'https://www.vegvesen.no/nvdb/api/vegobjekter/' + objectID + '/.json?bbox='+ nelng + ','+ nelat +','+ swlng + ',' + swlat + '&srid=WGS84';
  console.log(url);
  qwest.get(url).then(function(responseData) {
    callback(responseData);
  });
};
