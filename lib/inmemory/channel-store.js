'use strict';

var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter,
  EventCursor = require('./event-cursor');

module.exports = ChannelStore;

function ChannelStore() {
  EventEmitter.call(this);
  this.store = [];

  this.on('eventAdded', this._onEventAdded);
}
inherits(ChannelStore, EventEmitter);

ChannelStore.prototype.addEvent = function (event) {
  this.emit('eventAdded', event);
}

ChannelStore.prototype.subscribe = function (eventName, timestamp) {
  var cursor = new EventCursor();
  var self = this;

  process.nextTick(function () {
    if (typeof timestamp !== 'undefined')
      self._emitAllDataAfterTimestamp(cursor, eventName, timestamp);

    if (!cursor.isClosed) {
      self.on('eventStored:' + eventName, _eventStoredListener);
      cursor.on('close', function () {
        self.removeListener('eventStored:' + eventName, _eventStoredListener);
      })
    }
  });

  return cursor;

  function _eventStoredListener(event) {
    cursor.emit('data', event);
  }
}

ChannelStore.prototype._emitAllDataAfterTimestamp = function (cursor, eventName, timestamp) {
  for (var i = 0; i < this.store.length && !cursor.isClosed; ++i)
    if (this.store[i].name == eventName && this.store[i].timestamp >= timestamp)
      cursor.emit('data', this.store[i]);
}

ChannelStore.prototype._onEventAdded = function (event) {
  this.store.push(event);
  this.emit('eventStored', event);
  this.emit('eventStored:' + event.name, event);
}