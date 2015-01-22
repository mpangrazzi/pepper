
/**
 * Chai expect BDD
 */

var expect = chai.expect;

//

var sampleQs = '?loginurl=http%3a%2f%2flogin.freeluna.it%2f%3fres%3dnotyet%26uamip%3d10.9.12.1%26uamport%3d3990%26challenge%3d8561b644a9c14dbcdea738991cd4a0c9%26called%3dDC-9F-DB-06-D9-C5%26mac%3dC8-E0-EB-16-89-87%26ip%3d10.9.12.14%26nasid%3dnas-LA2CF00048%26sessionid%3d54b7c4b200000004%26userurl%3dhttp%253a%252f%252frepubblica.it%252f%26md%3d66634960BBE6BCF9D4A3EA957089B4E7';

//

describe('Pepper', function() {

  it('Should throw if no CoovaChilli querystring is present, \
    and host / port are not specified', function() {

    function getPepper() { return Pepper(); }
    expect(getPepper).to.throw('Cannot determine CoovaChilli JSON API base url');
  });


  it('Should extract all CoovaChilli data from querystring (including base API url)', function() {
    var pepper = Pepper({
      querystring: sampleQs
    });

    expect(pepper.data).to.have.property('called');
    expect(pepper.data).to.have.property('challenge');
    expect(pepper.data).to.have.property('ip');
    expect(pepper.data).to.have.property('mac');
    expect(pepper.data).to.have.property('nasid');
    expect(pepper.data).to.have.property('sessionid');
    expect(pepper.data).to.have.property('uamip');
    expect(pepper.data).to.have.property('uamport');
    expect(pepper.data).to.have.property('userurl');
  });


  it('Should build base API url from host/port/ssl params', function() {
    var pepper = Pepper({
      host: '10.10.0.1',
      port: 3990,
      ssl: false
    });

    expect(pepper._baseUrl).to.equal('http://10.10.0.1:3990/json/');
  });


  it('Should build base API url ignoring querystring data if host/port/ssl params are present', function() {
    var pepper = Pepper({
      host: '10.10.0.1',
      port: 3990,
      ssl: false,
      querystring: sampleQs
    });

    expect(pepper._baseUrl).to.equal('http://10.10.0.1:3990/json/');
  });


  it('Should do a "refresh" action and refresh status', function(done) {
    var pepper = Pepper({
      host: 'localhost',
      port: 5000,
      ssl: false
    });

    pepper.refresh(function(err, data) {
      expect(data).to.have.property('clientState');
      expect(data).to.have.property('challenge');
      expect(data).to.have.property('location');
      expect(data).to.have.property('redir');
      expect(pepper.status).to.eql(data);
      done();
    });
  });


  it('Should do a successful "logon" action update clientState', function(done) {
    var pepper = Pepper({
      host: 'localhost',
      port: 5000,
      ssl: false
    });

    pepper.logon('test', 'test', function(err, data) {
      expect(data).to.have.property('clientState');
      expect(data.clientState).to.equal(1);
      expect(pepper.status.clientState).to.equal(1);

      done();
    });
  });

});
