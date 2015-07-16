var https         = require('https')
, req             = require('./Req')
, cookieHelper    = require('./CookieHelper');

var api           = '/nvdb/apiskriv/status'
, config          = require('../config')
, host            = 'www.utv.vegvesen.no'
, login           = '/openam/UI/Login?IDToken1=' + config.username + '&IDToken2=' + config.password + '&module=LDAP'
, loginCookie     = []
, result          = [];

var apiReq        = new req(host, 443, api, 'GET')
, loginReq        = new req(host, 443, login, 'GET');


/* Exports functions
------------------------------------------------------------------------------*/
module.exports = {
  getData: getData
}


/* Fetch data - do magic - Supports calls like:
   - getData(options, callback)
   - getData(callback)
------------------------------------------------------------------------------*/
function getData(options, callback) {
  // support getData(callback)
  if (typeof options === 'function') {
    callback = options;
  }

  result = [];

  apiReq.request(loginCookie.join(', '), function (res) {
    res.on('data', function (data) {
      if (res.statusCode !== 302) {
        result.push(data);
      }
    });

    res.on('end', function () {
      if (res.statusCode === 302) {
        // Login request
        loginReq.request('', function (loginRes) {
          loginRes.on('data', function (data) { });

          loginRes.on('end', function () {
            loginCookie = cookieHelper.parseCookies(loginRes.headers['set-cookie']);

            // Call itself when cookie is fetched
            getData(options, callback);
          })
        });
      }
      else {
        // successful1!!!!11
        callback(result, loginCookie);
      }
    });
  }, options);
};
