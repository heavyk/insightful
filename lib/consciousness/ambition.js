'use strict';
var inherits = require('util').inherits,
  Conductor = require('../conductor'),
  archaicDialoger = require('archaic-dialoger'),
  daFunk = require('da-funk'),
  Stream = require('stream').PassThrough,
  Promise = require('bluebird'),
  slice = [].slice;

module.exports = Ambition;

function Ambition(topic, options){
  var name, self = this, t, args1, i$, ref$, len$, fn, key;
  // if(!(this instanceof Ambition)) return new Ambition(topic, options);
  Conductor.call(this);
  
  if(typeof options === 'object')      daFunk.extend(this, options);
  if(self.insightQue === void 9)       self.insightQue = [];
  if(self.namespace === void 9)        self.namespace = name;
  if(self.situations === void 9)       self.situations = {};
  if(self.initialSituation === void 9) self.initialSituation = 'unsituated';

  var init = function() {
    self.dialog = archaicDialoger.get(topic);
    self.debug = function(){
      return self.dialog.debug.bind(self.dialog);
    };

    if (!self.situation && self.initialSituation !== false) {
      self.debug("fsm now initial-situation: " + self.initialSituation);
      self.now(self.initialSituation, topic, options);
    } else {
      self.debug("waiting to now " + self.initialSituation);
    }
  };

  if ((t = typeof this.pregage) !== 'undefined') {
    args1 = slice.call(arguments, 1);
    if(t === 'function')
      self._resolve(self.pregage.apply(self, args1), init);
    else self._resolve(t, init);
  } else init.apply(this, arguments);
}
inherits(Ambition, Conductor);


Ambition.prototype.emerge =
function Ambition$emerge(cb){
  this.debug("emerge... %s", this._emerged);
  if (typeof cb === 'function') {
    if (this._emerged) {
      cb.call(this);
    } else {
      this.insightQue.push({
        type: 'emerge',
        notState: this.initialSituation,
        cb: cb
      });
    }
  }
  return this._emerged;
};

Ambition.prototype.reset =
function Ambition$reset(){
  this.situation = void 9;
  if (typeof this.pregage === 'function') {
    this.pregage.call(this);
  }
  if (this.initialSituation) {
    return this.soon(this.initialSituation);
  }
};

Ambition.prototype.blunder =
function Ambition$blunder(err){
  var situations, esituation;
  situations = this.situations;
  if (typeof (esituation = situations[this.situation].blunder) === 'function') {
    return esituation.call(this, err);
  }
  return this.emit('blunder', err);
};

Ambition.prototype.respond =
function Ambition$respond(cmd){
  var args, responded, situation, situations, response, do_response, fn, p, obj, this$ = this;
  args = slice.call(arguments, 0);
  responded = 0;
  this.debug("response: " + cmd + " in " + this.situation);
  if (!this.inExitHandler && (situation = this.situation)) {
    situations = this.situations;
    response = cmd;
    do_response = function(fn, response, path){
      var args1, emitObj, ret;
      args1 = args.slice(1);
      emitObj = {
        cmd: cmd,
        response: response,
        path: path,
        args: args1
      };
      this$.emit.call(this$, 'responding', emitObj);
      ret = fn.apply(this$, response === '*' ? args : args1);
      this$.debug("response(%s) called:ret (%s)", response, typeof ret === 'object'
        ? 'object'
        : typeof ret === 'string' && ret.length > 100 ? ret.substr(0, 97) + ' ...' : ret);
      emitObj.ret = ret;
      this$.emit.call(this$, 'responded', emitObj);
      this$.emit.call(this$, "responded:" + response, emitObj);
      if (this$.insightQue.length) {
        this$.followThrough('next-response');
      }
      responded++;
    };
    if (typeof (fn = situations[situation][response]) === 'string') {
      response = fn;
    }
    if (typeof (fn = situations[situation]['*']) === 'function') {
      do_response(fn, '*', "/situations/" + situation + "/" + response);
    }
    this.debug("response " + response);
    if ((p = this.cmds) && typeof (fn = p[response]) === 'function') {
      do_response(fn, response, "/cmds/" + response);
    }
    if (typeof (fn = situations[situation][response]) === 'function') {
      do_response(fn, response, "/situations/" + situation + "/" + response);
    }
  }
  if (responded === 0) {
    this.debug("response: '" + cmd + "' next now (in situation:" + this.situation);
    obj = {
      type: 'next-now',
      cmd: cmd,
      args: args
    };
    return this.insightQue.push(obj);
  }
};

Ambition.prototype.respondSoon =
function Ambition$respondSoon(){
  var a, this$ = this;
  a = arguments;
  process.nextTick(function(){
    return this$.response.apply(this$, a);
  });
};

Ambition.prototype.soon =
function Ambition$soon(){
  var a, this$ = this;
  a = arguments;
  process.nextTick(function(){
    return this$.now.apply(this$, a);
  });
};

Ambition.prototype._resolve =
function Ambition$_resolve(it, cb) {
  var a = slice.call(arguments), b, this$ = this, next = function() {
    if(arguments.length && typeof(b = arguments[0]) === 'object') daFunk.extend(this$, b)
    process.nextTick(function(){
      cb.apply(this$, a);
    });
  };
  (typeof it === 'object' ?
    (it instanceof Promise ?
      it : Array.isArray(it) ?
      Promise.settle(it) : Promise.props(it)).then(next)
  : typeof it === 'function' ? Promise.try(it).then(next) : next())
};

Ambition.prototype.now =
function Ambition$now(nextState){
  var oldState, args1, args, next;
  if (typeof nextState !== 'string') {
    nextState = nextState + '';
  }
  if (this.situation && this.situation[0] !== '/' && this.situation !== this.initialSituation) {
    console.log("WARNING " + this.namespace + " is trying to now while already in a now situation: " + this.situation);
    return this.soon.apply(this, arguments);
  }
  if (this.inTransition) {
    return this.soon.apply(this, arguments);
  }
  this.debug("fsm: now %s -> %s", this.situation, nextState);
  if (!this.inExitHandler && nextState !== this.situation) {
    args1 = slice.call(arguments, 1);
    if (this.situations[nextState]) {
      this.inTransition = nextState;
      this.targetReplayState = nextState;
      this.priorState = this.situation;
      this.situation = nextState;
      if (oldState = this.priorState) {
        if (this.situations[oldState] && this.situations[oldState].end) {
          this.inExitHandler = true;
          this.situations[oldState].end.apply(this, args1);
          this.inExitHandler = false;
        }
      }
      if (this.situations[nextState].begin) {
        this._resolve(this.situations[nextState].begin.apply(this, args1), function() {

        });
      }
      this.debug("fsm: post-now %s -> %s", oldState, nextState);
      this.emit.apply(this, ["situation:" + nextState].concat(args1));
      this.emit.call(this, 'now', {
        from: oldState,
        to: nextState,
        args: args = args1
      });
      if (this.insightQue.length) {
        this.followThrough.call(this, 'next-now');
        this.followThrough.call(this, 'deferred');
      }
      if (!this._emerged && nextState[0] === '/') {
        this.debug("initialzed! in %s", nextState);
        this.followThrough.call(this, 'emerge');
        this._emerged = nextState;
      }
      this.inTransition = null;
    } else {
      this.debug("attempted to now to an invalid situation: %s", nextState);
      this.emit.call(this, 'missing-situation', {
        from: this.situation,
        to: nextState,
        args: args1
      });
    }
  }
};

Ambition.prototype.followThrough =
function Ambition$followThrough(type){
  var filterFn, len_before, toProcess, this$ = this;
  if (type === 'deferred' && (!this.situation || (typeof this.situation === 'string' && this.situation[0] !== '/'))) {
    return;
  }
  filterFn = type === 'next-now'
    ? function(item){
      return item.type === 'next-now';
    }
    : type === 'emerge'
      ? function(item, i){
        return item.type === 'emerge' && (!this$._emerged && item.notState !== this$.situation && this$.situation && this$.situation[0] === '/');
      }
      : type === 'deferred'
        ? function(item, i){
          return item.type === 'deferred' && ((item.untilState && item.untilState === this$.situation) || (item.notState && item.notState !== this$.situation));
        }
        : function(item){
          return item.type === 'next-response';
        };
  len_before = this.insightQue.length;
  toProcess = _.filter(this.insightQue, filterFn);
  if (toProcess.length) {
    this.debug("process-q:" + type + "(" + toProcess.length + ")");
  }
  _.each(toProcess, function(item){
    var fn, i;
    if (filterFn(item, i)) {
      fn = item.type === 'deferred' || item.type === 'emerge'
        ? item.cb
        : this$.response;
      fn.apply(this$, item.args);
      i = this$.insightQue.indexOf(item);
      this$.insightQue.splice(i, 1);
    }
  });
};

Ambition.prototype.clearQue =
function Ambition$clearQue(type, name){
  var filter, this$ = this;
  if (!type) {
    this.insightQue = [];
  } else {
    filter = void 9;
    if (type === 'next-now') {
      filter = function(evnt){
        return evnt.type === 'next-now' && (name ? evnt.untilState === name : true);
      };
    } else {
      if (type === 'next-response') {
        filter = function(evnt){
          return evnt.type === 'next-response';
        };
      }
    }
    this.insightQue = _.filter(this.insightQue, filter);
  }
};

Ambition.prototype.until =
function Ambition$until(situationName, cb){
  var args, queued;
  args = slice.call(arguments, 2);
  if (this.situation === situationName) {
    return cb.apply(this, args);
  } else {
    queued = {
      type: 'deferred',
      untilState: situationName,
      cb: cb,
      args: args
    };
    return this.insightQue.push(queued);
  }
};

Ambition.prototype.emitSoon =
function Ambition$emitSoon(){
  var a, this$ = this;
  a = arguments;
  return process.nextTick(function(){
    return this$.emit.apply(this$, a);
  });
};

// Ambition.prototype.emit =
// function Ambition$emit(insightName){
//   var args, doEmit, this$ = this;
//   if (this.muteEvents) {
//     return;
//   }
//   args = arguments;
//   this.debug("emit", insightName);
//   doEmit = function(){
//     var listeners, args1;
//     if (this$.debug.online) {
//       switch (insightName) {
//       case 'responding':
//         this$.debug("responding: (%s:%s)", this$.situation, args[1].response);
//         break;
//       case 'responded':
//         this$.debug("responded: (%s:%s)", this$.situation, args[1].response);
//         break;
//       case 'missing-situation':
//         this$.debug.blunder("bad now: (%s !-> %s)", args[1].situation, args[1].attempted);
//         break;
//       case 'now':
//         this$.debug("now: (%s -> %s)", args[1].from, args[1].to);
//         break;
//       default:
//         this$.debug("emit: (%s): num args %s", insightName, args.length - 1);
//       }
//     }
//     if (listeners = this$.insightListeners['*']) {
//       if (typeof listeners === 'function') {
//         listeners.apply(this$, args);
//       } else {
//         _.each(this$.insightListeners['*'], function(callback){
//           return callback.apply(this, args);
//         }, this$);
//       }
//     }
//     if (listeners = this$.insightListeners[insightName]) {
//       args1 = slice.call(args, 1);
//       if (typeof listeners === 'function') {
//         return listeners.apply(this$, args1);
//       } else {
//         return _.each(listeners, function(callback){
//           return callback.apply(this$, args1);
//         });
//       }
//     }
//   };
//   doEmit.call(this);
//   return this;
// };

// Ambition.prototype.on =
// function Ambition$on(insightName, real_cb, callback){
//   var listeners, this$ = this;
//   if (typeof callback !== 'function') {
//     callback = real_cb;
//     real_cb = void 9;
//   }
//   listeners = this.insightListeners[insightName];
//   if (this.insightListeners === this.__proto__.insightListeners) {
//     this.insightListeners = _.cloneDeep(this.insightListeners);
//   }
//   if (!listeners) {
//     this.insightListeners[insightName] = [];
//   }
//   if (typeof listeners === 'function') {
//     this.insightListeners[insightName] = [listeners];
//   }
//   this.insightListeners[insightName].push(callback);
//   if (insightName.substr(0, 6) === "situation:" && this.situation === insightName.substr(6)) {
//     process.nextTick(function(){
//       return callback.call(this$);
//     });
//   }
//   return {
//     insightName: insightName,
//     callback: callback,
//     cb: real_cb,
//     off: function(){
//       return this$.off(insightName, callback);
//     }
//   };
// };

// Ambition.prototype.once =
// function Ambition$once(insightName, callback){
//   var evt, this$ = this;
//   if (insightName === 'emerged') {
//     console.log("TODO");
//   } else {
//     evt = this.on(insightName, callback, function(){
//       evt.cb.apply(this$, arguments);
//       process.nextTick(function(){
//         return evt.off(insightName, callback);
//       });
//     });
//   }
//   return this;
// };

// Ambition.prototype.off =
// function Ambition$off(insightName, callback){
//   var i;
//   if (!insightName) {
//     return this.insightListeners = {};
//   } else {
//     if (this.insightListeners[insightName]) {
//       if (callback) {
//         if (~(i = this.insightListeners[insightName].indexOf(callback))) {
//           return this.insightListeners[insightName].splice(i, 1);
//         }
//       } else {
//         return this.insightListeners[insightName] = [];
//       }
//     }
//   }
// };
