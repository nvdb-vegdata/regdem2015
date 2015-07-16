var express = require('express');
var cookieMonster = require('../lib/cookieMonster');

var router = express.Router();

router.get('/status', function (req, res) {
  var options = {
    path: '/nvdb/apiskriv/status'
  };

  cookieMonster.getData(function (data) {
    res.json({ response: data.toString() });
  }, options);
});

module.exports = router;
