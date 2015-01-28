'use strict';

var inherits = require('util').inherits,
  Conductor = require('./conductor'),
  Insight = require('./insight');

module.exports = Wisdom;

function Wisdom(opts) {
  Conductor.call(this);
  this.opts = opts || {};
  this._initPhilosophers();
}
inherits(Wisdom, Conductor);

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
