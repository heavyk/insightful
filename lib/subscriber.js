'use strict';
var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter;

module.exports = Subscriber;

function Subscriber (eventName, opts, cb) {
  EventEmitter.call(this);

  if (!cb) {
    cb = opts;
    opts = {};
  }

  this.eventName = eventName;
  this.opts = opts;
  this._cb = cb;
};
inherits(Subscriber, EventEmitter);

Subscriber.prototype.unsubscribe = function () { this.emit('unsubscribe'); this.removeAllListeners(); };
Subscriber.prototype.tick = function (event) { this._cb(event); };