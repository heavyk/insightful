'use strict';

var inherits = require('util').inherits,
  ChannelStore = require('./channel-store'),
  SuperPubSub = require('../pubsub');

module.exports = PubSub;

function PubSub(opts) {
  SuperPubSub.call(this, opts);
  this.channels = {};

  this.on('newChannel', this._newChannelListener);
}
inherits(PubSub, SuperPubSub);

PubSub.prototype._newChannelListener = function (channel) {
  var self = this;
  this.channels[channel.name] =  this.channels[channel.name] || new ChannelStore();
  channel.on('newSubscriber', function (subscriber) {
    var cursor = self.channels[channel.name].subscribe(subscriber.eventName, subscriber.opts.start);
    self._createSubscription(cursor, subscriber);
  })

  channel.on('published', function (event) {
    self.channels[channel.name].addEvent(event);
  })
}

PubSub.prototype._createSubscription = function (cursor, subscriber) {
  cursor.on('data', function (event) {subscriber.tick(event)});
  cursor.on('close', function () {subscriber.unsubscribe()});
  subscriber.on('unsubscribe', function () {cursor.destroy(); })
}