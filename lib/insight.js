'use strict';

var inherits = require('util').inherits,
  Conductor = require('./conductor'),
  Philosopher = require('./philosopher');

module.exports = Insight;

function Insight(topic, opts) {
  Conductor.call(this);
  this.topic = topic;
  this.opts = opts || {};
}
inherits(Insight, Conductor);

Insight.prototype.considering = function (conduct, insight) {
  var event = {
    conduct: conduct,
    topic: this.topic,
    insight: insight,
    at: new Date().getTime()
  }

  this.emit('consideration', event);
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
