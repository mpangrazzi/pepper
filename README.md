(chilli) Pepper
==============

[![Build Status](https://travis-ci.org/mpangrazzi/pepper.svg?branch=master)](https://travis-ci.org/mpangrazzi/pepper)

Tiny JS client library for [CoovaChilli JSON Interface](http://coova.org/CoovaChilli/JSON).

Basically it's a rewrite of [ChilliLibrary.js](http://dev.coova.org/svn/coova-chilli/www/ChilliLibrary.js) with some improvements:

- code is more modular
- works with [Browserify](http://browserify.org), [AMD](http://requirejs.org/docs/whyamd.html#amd) or simply including the minified script and use it globally.
- can be used both in browser or in [Node.js](http://nodejs.org)
- functional tests
- examples

## Examples

### Browserify

`npm install chilli-pepper`, then:

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

### Global

For globally use Pepper you must build it first. It's very easy:

1. `git clone` this repo
2. Run `npm install`
3. Build Pepper running `npm run build` or `npm run build-min` (if you want a minified version). You'll find builded version in `./dist` folder
4. Include the builded script in your webapp

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

## var pepper = Pepper(options)

Get a new Pepper instance. Available options are listed below. 

Note that all options are **optional**: by default Pepper will try to extract required data from CoovaChilli redirect querystring.

- `host`: _String_. Host name (or IP address) of CoovaChilli. If not specified, Pepper will try to extract host from CoovaChilli redirect querystring.

- `port`: _Number_. Port of CoovaChilli. If not specified, Pepper will try to extract host from CoovaChilli redirect querystring.

- `ssl`: _Boolean_. If you're using SSL on CoovaChilli, turn this on. By default, Pepper will automatically set this according to `window.location.protocol`.

- `ident`: _String_. Hex encoded string used for CHAP-Password calculation. Default is `00`.

- `interval`: _Number_. If specified, Pepper will update status informations (clientState, ...) every {interval} ms.

- `uamservice`: _String_. If specified, Pepper will do a JSONP call to this service in order to obtain a CHAP-Password (instead of calculating on the client side). See documentation below for more informations. 

- `querystring` _String_: Optional parameter if you want to manually pass CoovaChilli redirect querystring.

Note that Pepper will **throw an exception** if fails to build base CoovaChilli API url. This usually happens if:

- You don't specify host/port
- Pepper can't extract required data from CoovaChilli redirect querystring


## Public methods

#### .refresh(callback)

Update internal status calling CoovaChilli `status` API. Callback is **optional**.

Callback arguments are:

- `err`: Any error encountered during procedure
- `data`: CoovaChilli status response.

#### .logon(username, password, callback)

- `username`: user's username
- `password`: user's password
- `callback`: callback function. 

Performs a logon (checking current status first).

Callback arguments are:

- `err`: Any error encountered during procedure
- `data`: CoovaChilli logon response. If user is correctly authenticated, `clientState` property will be `1` (see examples above).

#### .logoff(callback)

Performs a logoff. Callback is **optional**.

Callback arguments are:

- `err`: Any error encountered during procedure
- `data`: CoovaChilli logoff response.

#### .startAutoRefresh(interval)

- `interval`: _Number_. Interval length in milliseconds.

Starts automatic status refresh every `interval` ms. 

Note that this function is called automatically if you specify `interval` option when creating Pepper instance, but you can also call it manually whenever you want.

#### .stopAutoRefresh()

Stops automatic status refresh.


## Public properties

#### .status

User's status object. This will be updated:

- Everytime you call `logon`, `logoff`, or `refresh` methods
- Every `interval` ms (if specified)


## Test

Run tests in Node.js (using [jsdom](https://github.com/tmpvar/jsdom)):

```npm test```

Run tests in browser:

```npm run test-server```

Then go to `http://localhost:4000`


## TODO

- make separate builds for browser and node, since **32k** for a browser lib is a bit much
- write more tests
- add test coverage info


## License

The MIT License (MIT)

Copyright (c) 2015 Michele Pangrazzi <<xmikex83@gmail.com>>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

