var qwest = require('qwest');

module.exports.fetch = function(callback) {
      qwest.get('resources/objekttyper.json').then(function (responseData) {
      var listObjects = responseData.vegObjektTyper.map( function(obj) {
        return {value: obj.id, label:obj.navn}
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
}
