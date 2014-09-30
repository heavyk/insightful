var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('Subscriber', function () {
  var Subscriber = require('../lib/subscriber');
  var sub, cb;

  beforeEach(function () {
    cb = sinon.spy();
    sub = new Subscriber('testName', cb);
  });

  describe('#unsubscribe()', function () {
    it('should emit `unsubscribe` event', function (done) {
      var spy = sinon.spy();
      sub.on('unsubscribe', spy);
      sub.unsubscribe();

      setTimeout(function () {
        spy.should.have.been.calledOnce;
        done();
      }, 10);
    })
  })
})