var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('Wisdom', function () {
  var Wisdom = require('../lib/pubsub');
  var wisdom;

  beforeEach(function () {
    wisdom = new Wisdom();
  });

  describe('#examine()', function () {
    var conduct, eventSpy, insight;
    beforeEach(function () {
      eventSpy = sinon.spy();
      wisdom.on('newInsight', eventSpy);
      insight = wisdom.examine(conduct);
    });

    it('should emit `newInsight` event', function (done) {
      eventSpy.should.be.calledOnce;
      setTimeout(done, 10);
    })

    it('with a new Insight as an argument', function (done) {
      eventSpy.getCall(0).args[0].should.be.instanceOf(require('../lib/channel'));
      setTimeout(done, 10);
    })
  })
})
