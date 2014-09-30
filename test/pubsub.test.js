var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('PubSub', function () {
  var PubSub = require('../lib/pubsub');
  var pubsub;

  beforeEach(function () {
    pubsub = new PubSub();
  });

  describe('#channel()', function () {
    var channelName, eventSpy, channel;
    beforeEach(function () {
      eventSpy = sinon.spy();
      pubsub.on('newChannel', eventSpy);
      channel = pubsub.channel(channelName);
    });

    it('should emit `newChannel` event', function (done) {
      eventSpy.should.be.calledOnce;
      setTimeout(done, 10);
    })

    it('with a new Channel as argument', function (done) {
      eventSpy.getCall(0).args[0].should.be.instanceOf(require('../lib/channel'));
      setTimeout(done, 10);
    })
  })
})