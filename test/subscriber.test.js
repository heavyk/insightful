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
      spy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })
  })

  describe('#tick()', function () {
    it('should invoke the callback from the constructor', function () {
      sub.tick('test');
      cb.should.have.been.calledOnce;
      cb.should.have.been.calledWith('test');
    })
  })
})