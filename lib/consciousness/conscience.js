'use strict';

var inherits = require('util').inherits,
  Conductor = require('../conductor'),
  LiveInsight = require('./live-insight');

module.exports = Conscience;

function Conscience() {
  Conductor.call(this);
  this.store = [];

  this.on('takeConsideration', this._onConsideration);
}
inherits(Conscience, Conductor);

Conscience.prototype.takeConsideration = function (insight) {
  this.emit('takeConsideration', insight);
}

Conscience.prototype.subscribe = function (insightTopic, timestamp) {
  var cursor = new LiveInsight();
  var self = this;

  process.nextTick(function () {
    if (typeof timestamp !== 'undefined')
      self._emitAllDataAfterTimestamp(cursor, insightTopic, timestamp);

    if (!cursor.isClosed) {
      self.on('insightStored:' + insightTopic, _insightStoredListener);
      cursor.on('close', function () {
        self.removeListener('insightStored:' + insightTopic, _insightStoredListener);
      })
    }
  });

  return cursor;

  function _insightStoredListener(insight) {
    cursor.emit('data', insight);
  }
}

Conscience.prototype._emitAllDataAfterTimestamp = function (cursor, insightTopic, timestamp) {
  for (var i = 0; i < this.store.length && !cursor.isClosed; ++i)
    if (this.store[i].topic == insightTopic && this.store[i].timestamp >= timestamp)
      cursor.emit('data', this.store[i]);
}

Conscience.prototype._onConsideration = function (insight) {
  this.store.push(insight);
  this.emit('insightStored', insight);
  this.emit('insightStored:' + insight.topic, insight);
}
