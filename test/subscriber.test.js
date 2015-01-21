var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('Philosopher', function () {
  var Philosopher = require('../lib/subscriber');
  var sub, cb;

  beforeEach(function () {
    cb = sinon.spy();
    sub = new Philosopher('awesomeness', cb);
  });

  describe('#disregard()', function () {
    it('should emit `disregard` event', function (done) {
      var spy = sinon.spy();
      sub.on('disregard', spy);
      sub.disregard();

      setTimeout(function () {
        spy.should.have.been.calledOnce;
        done();
      }, 10);
    })
  })
})
