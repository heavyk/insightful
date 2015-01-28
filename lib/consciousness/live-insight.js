var inherits = require('util').inherits,
  Conductor = require('../conductor');

module.exports = LiveInsight;

function LiveInsight () {
  Conductor.call(this);
}
inherits(LiveInsight, Conductor);

LiveInsight.prototype.destroy = function (reason) {
  if (this.isClosed) return;
  this.emit('close', reason);
  this.isClosed = true;
  this.removeAllListeners();
}
