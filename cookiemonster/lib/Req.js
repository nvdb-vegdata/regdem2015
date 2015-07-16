/*
 * Performs request to given host and path
 */


var https = require('https');

var Req = function Req(host, port, path, method) {
  this.host = host;
  this.port = port;
  this.path = path;
  this.method = method || 'POST';
}

/*
 * Options: port, path, method, error
 *   PORT: the port
 *   PATH: new path to request
 *   METHOD: POST/GET/...
 *   ERROR: custom error callback
 */
Req.prototype.request = function (cookie, callback, options) {
  options = options || {};

  this.req = https.request({
    host: this.host,
    port: options.port || this.port,
    path: options.path || this.path,
    method: options.method || this.method,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false,
    headers: {
      'Cookie': cookie
    }
  }, callback);

  this.req.end();

  if (options.error !== undefined) {
    this.req.on('error', options.error);
  }
  else {
    this.req.on('error', function (err) {
      console.log(err);
    })
  }
};

module.exports = Req;
