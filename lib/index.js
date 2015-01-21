
/**
 * Module dependencies
 */

var debug = require('debug')('pepper');
var jsonp = require('jsonp');
var querystring = require('querystring');

var utils = require('./utils');


module.exports = Pepper;


function Pepper(options) {
  if (!(this instanceof Pepper)) return new Pepper(options || {});

  this.data = utils.parseQS(location.search);
  this.status = {};

  this.host = options.host || this.data.uamip;
  this.port = +(options.port || this.data.uamport);

  this.interval = options.interval ?
    parseInt(options.interval, 10) :
    null;

  this.ssl = typeof options.ssl === 'boolean' ?
    !!options.ssl :
    (location.protocol === 'https:');

  this.uamservice = options.uamservice || null;
  this.ident = options.ident || '00';

  //

  this._refreshInterval = null;

  this._jsonpOptions = {
    timeout: +options.timeout || 5000,
    prefix: '__Pepper'
  };

  // calculate baseurl (or throw)

  this._baseUrl = utils.getBaseUrl(this.host, this.port, this.ssl);

  if (!this._baseUrl) {
    throw new Error('Cannot determine CoovaChilli JSON API base url');
  }

  debug('Computed CoovaChilli baseUrl: %s', this._baseUrl);
}


/**
 * CoovaChilli clientState codes
 *
 * @type {Object}
 */

Pepper.stateCodes = {
  UNKNOWN: -1,
  NOT_AUTH: 0,
  AUTH: 1,
  AUTH_PENDING: 2,
  AUTH_SPLASH: 3
};


/**
 * Performs a 'logon' action on CoovaChilli
 *
 * @param  {String} username
 * @param  {String} password
 */

Pepper.prototype.logon = function(username, password, callback) {

  if (typeof username !== 'string') {
    return callback(new TypeError('username must be a string'));
  }

  if (typeof password !== 'string') {
    return callback(new TypeError('password must be a string'));
  }

  debug('Starting logon for %s - %s', username, password);

  // 1. check current status on CoovaChilli

  var self = this;

  this._api('status', function(err, data) {

    if (err) return callback(err);

    if (!data.challenge) {
      return callback(new Error('Cannot find a challenge'));
    }

    if (data.clientState === Pepper.stateCodes.AUTH) {
      return callback(new Error('Current clientState is already %s', Pepper.stateCodes.AUTH));
    }

    self.status = data;


    // TODO: call uamservice (if needed)


    // 2. Calculate CHAP with obtained challenge
    //    NOTE: password will be converted to hex inside utils.chap()

    self.chap = utils.chap(self.ident, password, self.status.challenge);
    debug('Computed CHAP-Password: %s', self.chap);

    // 3. call logon API

    var payload = {
      username: username,
      response: self.chap
    };

    self._api('logon', payload, function(err, data) {
      callback(err, data);

      if (data.clientState === Pepper.stateCodes.AUTH) {
        self.startAutoRefresh();
      }
    });

  });

};


/**
 * Performs a 'logoff' action on CoovaChilli
 *
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype.logoff = function(callback) {
  this._api('logoff', callback);
};


/**
 * Performs a 'refresh' action on CoovaChilli
 *
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype.refresh = function(callback) {
  var self = this;

  this._api('status', function(err, data) {
    if (data) self.status = data;
    callback(err, data);
  });
};


/**
 * Start auto-refresh routine
 * (will update accounting status every {interval}s)
 */

Pepper.prototype.startAutoRefresh = function() {
  if (!this.interval) return;

  clearInterval(this._refreshInterval);
  this._refreshInterval = setInterval(this.refresh, this.interval);

  debug('Auto-refreshing status every %s seconds', this.interval);
};


/**
 * Stop auto-refresh routine
 */

Pepper.prototype.stopAutoRefresh = function() {
  clearInterval(this._refreshInterval);
  debug('Stop Auto-refreshing status');
};


/**
 * Call a CoovaChilli JSON API
 * Available API endpoints: status, logon, logoff
 *
 * @param  {String} endpoint
 * @param  {String|Object|null} qs
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype._api = function(endpoint, qs, callback) {
  var uri = this._baseUrl + endpoint;

  if (typeof qs === 'function') {
    callback = qs;
  } else {
    uri += '?';

    if (typeof qs === 'string') {
      uri += qs;
    } else {
      uri += querystring.stringify(qs);
    }
  }

  jsonp(uri, this._jsonpOptions, callback);
};
