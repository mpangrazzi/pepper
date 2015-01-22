
/**
 * Module dependencies
 */

var debug = require('debug')('pepper');
var jsonp = require('jsonp');
var querystring = require('querystring');
var url = require('url');

var utils = require('./utils');


module.exports = Pepper;


function Pepper(options) {
  if (!(this instanceof Pepper)) return new Pepper(options || {});

  this.querystring = options.querystring || window.location.search;
  this.data = utils.parseQS(this.querystring);

  this.status = {};

  this.host = options.host || this.data.uamip;
  this.port = +(options.port || this.data.uamport);

  this.interval = options.interval ?
    parseInt(options.interval, 10) :
    null;

  this.ssl = typeof options.ssl === 'boolean' ?
    !!options.ssl :
    (window.location.protocol === 'https:');

  this.ident = options.ident || '00';
  this.uamservice = options.uamservice ? url.parse(options.uamservice) : null;

  //

  this._refreshInterval = null;

  this._jsonpOptions = {
    timeout: +options.timeout || 5000,
    prefix: '__Pepper'
  };

  // calculate API base url (or throw)

  this._baseUrl = utils.getBaseUrl(this.host, this.port, this.ssl);

  if (!this._baseUrl) {
    throw new Error('Cannot determine CoovaChilli JSON API base url');
  }

  // check if uamservice uri is secure

  if (this.uamservice && this.uamservice.protocol !== 'https:') {
    var message = 'warning: uamservice uri is insecure - Password will be sent in cleartext';

    if (window.console) {
      console.log(message);
    } else {
      alert(message);
    }
  }

  debug('computed CoovaChilli JSON interface baseUrl: %s', this._baseUrl);
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

  if (this.status.clientState === Pepper.stateCodes.AUTH) {
    return callback(new Error('Current clientState is already %s', Pepper.stateCodes.AUTH));
  }

  debug('starting logon for %s - %s', username, password);

  // 1. check current status on CoovaChilli

  var self = this;

  this._api(this._baseUrl + 'status', function(err, data) {

    if (err) return callback(err);

    if (!data.challenge) {
      return callback(new Error('Cannot find a challenge'));
    }

    if (data.clientState === Pepper.stateCodes.AUTH) {
      return callback(new Error('Current clientState is already %s', Pepper.stateCodes.AUTH));
    }

    self.status = data;

    if (this.uamservice) {

      // 2-A. Handle uamservice

      debug('calling uamservice uri: %s', this.uamservice);

      this._callUamservice(username, password, data.challenge, function(err, response) {
        if (err) return callback(err);

        if (!response || !response.chap) {
          return callback(new Error('uamservice response is invalid (missing "chap" field)'));
        }

        // 3-A. Call logon API

        self._callLogon({
          username: username,
          response: response.chap
        }, callback);

      });
    } else {

      // 2-B. Calculate CHAP with obtained challenge
      //    NOTE: password will be converted to hex inside utils.chap()

      self.chap = utils.chap(self.ident, password, self.status.challenge);
      debug('computed CHAP-Password: %s', self.chap);

      // 3-B. call logon API

      self._callLogon({
        username: username,
        response: self.chap
      }, callback);

    }

  });

};


/**
 * Performs a 'logoff' action on CoovaChilli
 *
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype.logoff = function(callback) {
  this._api(this._baseUrl + 'logoff', callback);
};


/**
 * Performs a 'refresh' action on CoovaChilli
 *
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype.refresh = function(callback) {
  var self = this;

  this._api(this._baseUrl + 'status', function(err, data) {
    if (data) {
      self.status = data;
      debug('status updated - clientState: %s', self.status.clientState);
    }
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
 * call logon API
 *
 * @param  {Object}   payload
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype._callLogon = function(payload, callback) {
  var self = this;

  this._api(this._baseUrl + 'logon', payload, function(err, data) {
    self.status = data;
    callback(err, data);

    if (data.clientState === Pepper.stateCodes.AUTH) {
      self.startAutoRefresh();
    }
  });
};


/**
 * Call uamservice API
 *
 * @param  {String}   username
 * @param  {String}   password
 * @param  {String}   challenge
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype._callUamservice = function(username, password, challenge, callback) {
  var payload = {
    username: username,
    password: password,
    challenge: challenge,
    userurl: this.data.userurl
  };

  var qs = this.uamservice.query ?
    this.uamservice.query + querystring.stringify(payload) :
    this.uamservice.query;

  var uri = this.uamservice.href + '?' + qs;

  this._api(uri, this._jsonpOptions, callback);
};


/**
 * Call a JSON API
 *
 * @param  {String} uri
 * @param  {String|Object|null} qs
 * @callback {Pepper~onSuccess}
 */

Pepper.prototype._api = function(uri, qs, callback) {
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
