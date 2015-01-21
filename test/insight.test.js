var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('Insight', function () {
  var Insight = require('../lib/insight');
  var eventSpy, insight, insightTopic;
  beforeEach(function () {
    insightTopic = 'testInsight';
    insight = new Insight(insightTopic);
    eventSpy = sinon.spy();
  });

  describe('#consider()', function () {
    it('should emit a `consideration` event', function (done) {
      insight.on('consideration', eventSpy);
      insight.consider('testConduct', 'testMessage');
      eventSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })

    it('with message as the first arg', function (done) {
      insight.on('examined', function (msg) {
        msg.should.have.ownProperty('topic');
        msg.should.have.ownProperty('conduct');
        msg.should.have.ownProperty('insight');
        msg.should.have.ownProperty('at');
      });
      insight.examine('testConduct', 'testMsg');
      setTimeout(done, 10);
    })

    it('and message must have the proper `msg` and `eventName`', function (done) {
      insight.on('examined', function (msg) {
        msg.name.should.be.equal('testConduct');
        msg.msg.should.be.equal('testMsg');
      });
      insight.examine('testConduct', 'testMsg');
      setTimeout(done, 10);
    })
  })

  describe('#examine()', function () {
    var tstCb, tstConductName;

    beforeEach(function () {
      tstCb = sinon.spy();
      tstConductName = sinon.spy();

      insight.on('newPhilosopher', eventSpy);
      insight.examine(tstConductName, tstCb);
    });

    it('should emit a `newPhilosopher` event', function (done) {
      eventSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })

    it('with an instance of `Philosopher`', function (done) {
      eventSpy.getCall(0).args[0].should.be.instanceOf(require('../lib/philosopher'));
      setTimeout(done, 10);
    })
  })

  describe('#destroy()', function () {
    var removeAllListenersSpy;
    beforeEach(function () {
      removeAllListenersSpy = sinon.spy(insight, 'removeAllListeners');
      insight.on('peace', eventSpy);
      insight.destroy();
    });

    it('should emit a `peace` event', function (done) {
      eventSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })

    it('and remove all listeners', function (done) {
      removeAllListenersSpy.should.have.been.calledOnce;
      setTimeout(done, 10);
    })
  })
})
