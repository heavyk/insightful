var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('Channel', function () {
  var Channel = require('../lib/channel');
  var eventSpy, channel, channelName;
  beforeEach(function () {
    channelName = 'testChannel';
    channel = new Channel(channelName);
    eventSpy = sinon.spy();
  });

  describe('#publish()', function () {
    it('should emit a `published` event', function (done) {
      channel.on('published', eventSpy);
      channel.publish('testEvent', 'testMessage');
      eventSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })

    it('with message as the first arg', function (done) {
      channel.on('published', function (msg) {
        msg.should.have.ownProperty('name');
        msg.should.have.ownProperty('channel');
        msg.should.have.ownProperty('timestamp');
        msg.should.have.ownProperty('msg');
      });
      channel.publish('testEvent', 'testMsg');
      setTimeout(done, 10);
    })

    it('and message must have the proper `msg` and `eventName`', function (done) {
      channel.on('published', function (msg) {
        msg.name.should.be.equal('testEvent');
        msg.msg.should.be.equal('testMsg');
      });
      channel.publish('testEvent', 'testMsg');
      setTimeout(done, 10);
    })
  })

  describe('#subscribe()', function () {
    var tstCb, tstEventName;

    beforeEach(function () {
      tstCb = sinon.spy();
      tstEventName = sinon.spy();

      channel.on('newSubscriber', eventSpy);
      channel.subscribe(tstEventName, tstCb);
    });

    it('should emit a `newSubscriber` event', function (done) {
      eventSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })

    it('with an instance of `Subscriber`', function (done) {
      eventSpy.getCall(0).args[0].should.be.instanceOf(require('../lib/subscriber'));
      setTimeout(done, 10);
    })
  })

  describe('#destroy()', function () {
    var removeAllListenersSpy;
    beforeEach(function () {
      removeAllListenersSpy = sinon.spy(channel, 'removeAllListeners');
      channel.on('close', eventSpy);
      channel.destroy();
    });

    it('should emit a `close` event', function (done) {
      eventSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })

    it('and remove all listeners', function (done) {
      removeAllListenersSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })
  })
})