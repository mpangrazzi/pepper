
/**
 * Module dependencies
 */

var querystring = require('querystring');
var core_md5 = require('./core_md5');

/**
 * Get CoovaChilli JSON interface base url
 *
 * @param  {String} host
 * @param  {Number} port
 * @param  {Boolean} ssl
 *
 * @returns {String|null}
 */


var getBaseUrl = exports.getBaseUrl = function(host, port, ssl) {
  var base = null;

  if (host) {
    var protocol = ssl ? 'https:' : 'http:';
    if (protocol === 'https:') port = null;

    base = protocol + '//' + host + (port ? ':' + port : '') + '/json/';
  }

  return base;
};

/**
 * Parse CoovaChilli querystring
 * after captive portal redirection to UAMSERVER
 *
 * @param  {String} qs
 * @return {Object|null}
 */

var parseQS = exports.parseQS = function(qs) {
  if (!qs) return {};

  var data = querystring.parse(qs.slice(1));
  if (!data.loginurl) return {};

  return querystring.parse(data.loginurl);
};


/**
 * Calculate chap MD5
 * NOTE: ident and challenge are 'hex' strings
 *
 * @param  {String} ident
 * @param  {String} password
 * @param  {String} challenge
 *
 * @return {String}
 */

var chap = exports.chap = function(ident, password, challenge) {
  var hexPassword = str2hex(password);

  var hex = ident + hexPassword + challenge;
  var bin = hex2binl(hex);
  var md5 = core_md5(bin, hex.length * 4);

  return binl2hex(md5);
};

/**
 * hex2binl / binl2hex / str2hex (extracted from ChilliMD5 object)
 */

var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
var b64pad = ''; /* base-64 pad character. "=" for strict RFC compliance */
var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode */

var str2hex = exports.str2hex = function(str) {
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var hex = '';
  var val;
  for (var i = 0; i < str.length; i++) {
    /* TODO: adapt this if chrz=16   */
    val = str.charCodeAt(i);
    hex = hex + hex_tab.charAt(val / 16);
    hex = hex + hex_tab.charAt(val % 16);
  }
  return hex;
};

var hex2binl = exports.hex2binl = function(hex) {
  /*  Clean-up hex encoded input string */
  hex = hex.toLowerCase();
  hex = hex.replace(/ /g, '');

  var bin = [];

  /* Transfrom to array of integers (binary representation) */
  for (i = 0; i < hex.length * 4; i = i + 8) {
    octet = parseInt(hex.substr(i / 4, 2), 16);
    bin[i >> 5] |= (octet & 255) << (i % 32);
  }
  return bin;
};

var binl2hex = exports.binl2hex = function(binarray) {
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = '';
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
      hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
  }
  return str;
};
