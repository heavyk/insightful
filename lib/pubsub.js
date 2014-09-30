'use strict';

var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter,
  Channel = require('./channel');

module.exports = PubSub;

function PubSub(opts) {
  EventEmitter.call(this);
  this.opts = opts || {};
  this._initListeners();
}
inherits(PubSub, EventEmitter);

PubSub.prototype.channel = function (channelName, opts) {
  var channel = new Channel(channelName, opts);
  this.emit('newChannel', channel);
  return channel;
}

PubSub.prototype._onNewChannel = function (channel) {
  channel.on('close', this._onChannelClose);
}

PubSub.prototype._onChannelClose = function (channel, reason) {
  this.emit('channelClosed', channel, reason);
}

PubSub.prototype._initListeners = function () {
  this.on('newChannel', this._onNewChannel);
}