'use strict';

var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter,
  Insight = require('./channel');

module.exports = Wisdom;

function Wisdom(opts) {
  EventEmitter.call(this);
  this.opts = opts || {};
  this._initPhilosophers();
}
inherits(Wisdom, EventEmitter);

Wisdom.prototype.examine = function (conduct, opts) {
  var insight = new Insight(conduct, opts);
  this.emit('newInsight', insight);
  return insight;
}

Wisdom.prototype._onNewInsight = function (insight) {
  insight.on('peace', this._onInsightPeace);
}

Wisdom.prototype._onInsightPeace = function (insight, conclusion) {
  this.emit('peace', insight, conclusion);
}

Wisdom.prototype._initPhilosophers = function () {
  this.on('newInsight', this._onNewInsight);
}
