var React = require('react');
var omniscient = require('omniscient');
var immstruct = require('immstruct');
var qwest = require('qwest');

const data = immstruct({
  indekseringsstatus: {}
});

module.exports.fetch = function(callback) {
  qwest.get('resources/objekttyper.json').then(function (responseData) {
      callback(responseData);
  });
}
