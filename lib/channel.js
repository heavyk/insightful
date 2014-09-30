'use strict';

var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter,
  Subscriber = require('./subscriber');

module.exports = Channel;

function Channel(name, opts) {
  EventEmitter.call(this);
  this.name = name;
  this.opts = opts || {};
}
inherits(Channel, EventEmitter);

Channel.prototype.publish = function (eventName, message) {
  var event = {
    name: eventName,
    channel: this.name,
    timestamp: new Date().getTime(),
    msg: message
  }

  this.emit('published', event);
}

Channel.prototype.subscribe = function (eventName, options, cb) {
  if (typeof cb == 'undefined') {
    cb = options;
    options = {};
  }

  var subscriber = new Subscriber(eventName, options, cb);
  this.emit('newSubscriber', subscriber);
  return subscriber;
}

Channel.prototype.destroy = function (reason) {
  this.emit('close', this, reason);
  this.removeAllListeners();
}

Channel.prototype._onNewSubscriber = function (subscriber) {
  var self = this;

  subscriber.on('unsubscribe', function () {self.emit('unsubscribed', subscriber)});
  this.on('close', function () {subscriber.unsubscribe()});
}