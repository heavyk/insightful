'use strict';
var inherits = require('util').inherits,
  Stream = require('stream').PassThrough;

module.exports = Subscriber;

function Subscriber (eventName, opts) {
  Stream.call(this, {objectMode: true});

  this.eventName = eventName;
  this.opts = opts || {};
};
inherits(Subscriber, Stream);

Subscriber.prototype.unsubscribe = function () {
  var self = this;
  process.nextTick(function () {
    self.emit('unsubscribe');
    self.end();
  })
};