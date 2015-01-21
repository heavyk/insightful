'use strict';

var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter,
  Philosopher = require('./subscriber');

module.exports = Insight;

function Insight(topic, opts) {
  EventEmitter.call(this);
  this.topic = topic;
  this.opts = opts || {};
}
inherits(Insight, EventEmitter);

Insight.prototype.consider = function (conduct, insight) {
  var event = {
    conduct: conduct,
    topic: this.topic,
    insight: insight,
    at: new Date().getTime()
  }

  this.emit('considered', event);
}

Insight.prototype.examine = function (conduct, options) {
  var philosopher = new Philosopher(conduct, options);
  this.emit('newPhilosopher', philosopher);
  return philosopher;
}

Insight.prototype.destroy = function (reason) {
  this.emit('peace', this, reason);
  this.removeAllListeners();
}

Insight.prototype._onNewPhilosopher = function (philosopher) {
  var self = this;
  philosopher.on('disregard', function () {self.emit('peace', philosopher)});
  this.on('peace', function () {philosopher.disregard()});
}
