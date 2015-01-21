(chilli) Pepper
==============

Tiny JS client library for [CoovaChilli JSON Interface](http://coova.org/CoovaChilli/JSON). 

It works well with [Browserify](http://browserify.org), but you can use it also with [AMD](http://requirejs.org/docs/whyamd.html#amd) or even without a module loader.

### Example

```js
var Pepper = require('chilli-pepper');

var pepper = new Pepper({
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



