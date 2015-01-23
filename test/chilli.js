/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

/**
 * Emulating CoovaChilli JSON API
 */

var response = {
  logon: require('./fixtures/logon'),
  logoff: require('./fixtures/logoff'),
  status: require('./fixtures/status')
};

app.get('/json/status', function(req, res) {
  res.jsonp(response.status);
});

app.get('/json/logon', function(req, res) {

  var username = req.query.username;

  if (username === 'test') {
    res.jsonp(response.logon);
  } else {
    res.jsonp(response.status);
  }

});

app.get('/json/logoff', function(req, res) {
  res.jsonp(response.logoff);
});

app.listen(5000, function() {
  console.log('Fake CoovaChilli JSON interface up on port 5000');
});
