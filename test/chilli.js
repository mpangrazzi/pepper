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

// status sample object

var status = {
  version: '1.0',
  clientState: 0,
  challenge: 'f3a2c156428029ae0f18da67cff02bbc',
  location: {
    name: 'My HotSpot'
  },
  redir: {
    originalURL: 'http:///',
    redirectionURL: '',
    logoutURL: 'http://10.137.220.129:3990/logoff',
    ipAddress: '10.137.220.131',
    macAddress: 'C8-E0-EB-16-89-87'
  }
};

// logon sample object

var logon = {
  version: '1.0',
  clientState: 1,
  session: {
    sessionid: '54b7c4b200000004',
    userName: 'test',
    startTime: 1421940977,
    terminateTime: 0,
    ideTimeout: 300
  },
  accounting: {
    sessionTime: 1,
    idleTime: 0,
    inputOctets: 1234,
    outputOctets: 234,
    inputGigaWords: 0,
    outputgigaWords: 0,
    viewPoint: 'client'
  }
};

// logoff sample object

var logoff = {
  version: '1.0',
  clientState: 0,
  challenge: '8561b644a9c14dbcdea738991cd4a0c9',
  session: {
    sessionid: '54b7c4b200000004',
    userName: 'test',
    startTime: 1421940977,
    terminateTime: 0,
    ideTimeout: 0
  },
  accounting: {
    sessionTime: 0,
    idleTime: 0,
    inputOctets: 0,
    outputOctets: 0,
    inputGigaWords: 0,
    outputgigaWords: 0,
    viewPoint: 'client'
  }
};


app.get('/json/status', function(req, res) {
  res.jsonp(status);
});

app.get('/json/logon', function(req, res) {

  var username = req.query.username;

  if (username === 'test') {
    res.jsonp(logon);
  } else {
    res.jsonp(status);
  }

});

app.get('/json/logoff', function(req, res) {
  res.jsonp(logoff);
});

app.listen(5000, function() {
  console.log('Fake CoovaChilli JSON interface up on port 5000');
});