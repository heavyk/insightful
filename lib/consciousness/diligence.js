'use strict'

var inherits = require('util').inherits
var Consciousness = require('./consciousness')
var Wisdom = require('../wisdom')

module.exports = Diligence

function Diligence (opts) {
  Wisdom.call(this, opts)
  this.insights = {}
  this.on('newInsight', this._newInsightListener)
}
inherits(Diligence, Wisdom)

Diligence.prototype._newInsightListener = function (insight) {
  var self = this
  this.insights[insight.topic] = this.insights[insight.topic] || new Consciousness()
  insight.on('newPhilosopher', function (philosopher) {
    var cursor = self.insights[insight.topic].subscribe(philosopher.eventName, philosopher.opts.start)
    self._takeConsideration(cursor, philosopher)
  })

  insight.on('consideration', function (event) {
    self.insights[insight.topic].takeConsideration(event)
  })
}

Diligence.prototype._takeConsideration = function (cursor, philosopher) {
  cursor.on('data', function (event) { philosopher.push(event) })
  cursor.on('close', function () { philosopher.unsubscribe() })
  philosopher.on('unsubscribe', function () { cursor.destroy() })
}
