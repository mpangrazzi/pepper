
/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname)));

app.get('*', function(req, res) {
  fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
});

app.listen(4000, function() {
  console.log('Test server up on port 4000');
});
