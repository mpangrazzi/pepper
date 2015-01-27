(chilli) Pepper
==============

[![Build Status](https://travis-ci.org/mpangrazzi/pepper.svg?branch=master)](https://travis-ci.org/mpangrazzi/pepper)

Tiny JS client library for [CoovaChilli JSON Interface](http://coova.org/CoovaChilli/JSON). 

It works well with [Browserify](http://browserify.org), but you can use it also with [AMD](http://requirejs.org/docs/whyamd.html#amd) or even globally, without a module loader.

### Browserify example

```js
var Pepper = require('chilli-pepper');

var pepper = Pepper({
  host: '192.168.1.1',
  port: 3990
});

pepper.logon('john', 'd0E', function(err, data) {

  if (data.clientState === 1) {
    // User is now logged in
  }

  // ...
  
});
```

### Global example

- `git clone` this repo
- Run `npm install`
- Build Pepper running `npm run build` or `npm run build-min` (if you want a minified version). You'll find builded version in `./dist` folder
- Include the builded script in your webapp

Then you'll have a global `Pepper` object ready to use:

```js

var pepper = Pepper({
  host: '192.168.1.1',
  port: 3990
});

pepper.logon('john', 'd0E', function(err, data) {

  if (data.clientState === 1) {
    // User is now logged in
  }

  // ...
  
});
```

### var pepper = Pepper(options)









