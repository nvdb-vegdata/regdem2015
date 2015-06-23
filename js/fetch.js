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
