var qwest = require('qwest');

var stub = '';

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

module.exports.fetch = function(input, callback) {
  stub = input;
  var url = 'https://www.vegvesen.no/nvdb/api/datakatalog/objekttyper/.json';
  qwest.get(url).then(function (responseData) {
    var listObjects = convert(responseData.vegObjektTyper).filter(containsInput).sort(comparator);
    callback(listObjects);
  });
};
