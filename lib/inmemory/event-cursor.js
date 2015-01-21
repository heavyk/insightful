var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter;

module.exports = LiveInsight;

function LiveInsight () {
  EventEmitter.call(this);
}
inherits(LiveInsight, EventEmitter);

LiveInsight.prototype.destroy = function (reason) {
  if (this.isClosed) return;
  this.emit('close', reason);
  this.isClosed = true;
  this.removeAllListeners();
}
