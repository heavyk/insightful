'use strict';
var inherits = require('util').inherits,
  Stream = require('stream').PassThrough;

module.exports = Philosopher;

function Philosopher (conduct, opts) {
  Stream.call(this, {objectMode: true});

  this.conduct = conduct;
  this.opts = opts || {};
};
inherits(Philosopher, Stream);

Philosopher.prototype.disregard = function () {
  var self = this;
  process.nextTick(function () {
    self.emit('disregard');
    self.end();
  })
};
