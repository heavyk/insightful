'use strict'
var inherits = require('util').inherits
var Conductor = require('../conductor')
var archaicDialoger = require('archaic-dialoger')
var daFunk = require('da-funk')
// var Stream = require('stream').PassThrough
var Promise = require('bluebird')
// var process = require('process')
var slice = [].slice

module.exports = Ambition

function Ambition (topic, options) {
  var self = this
  var type, args1
  Conductor.call(this)

  if (typeof options === 'object') { daFunk.extend(this, options) }
  if (self.insightQue === void 9) { self.insightQue = [] }
  // if (self.namespace === void 9) { self.namespace = name }
  if (self.situations === void 9) { self.situations = {} }
  if (self.startingSituation === void 9) { self.startingSituation = 'unsituated' }
  if (typeof self.eventListeners === 'object') {
    for (var i in self.eventListeners) {
      self.on(i, self.eventListeners[i])
    }
  }

  var init = function () {
    self.dialog = archaicDialoger.get(topic)
    self.debug = function () {
      return self.dialog.debug.bind(self.dialog)
    }

    if (!self.situation && self.startingSituation !== false) {
      self.debug('fsm now initial-situation: ' + self.startingSituation)
      self.now(self.startingSituation, topic, options)
    } else {
      self.debug('waiting to now ' + self.startingSituation)
    }
  }

  if ((type = typeof this.pregage) !== 'undefined') {
    args1 = slice.call(arguments, 1)
    if (type === 'function') {
      self._resolve(self.pregage.apply(self, args1), init)
    } else self._resolve(type, init)
  } else init.apply(this, arguments)
}
inherits(Ambition, Conductor)

Ambition.prototype.emerge =
function Ambition$emerge (cb) {
  this.debug('emerge... %s', this._emerged)
  if (typeof cb === 'function') {
    if (this._emerged) {
      cb.call(this)
    } else {
      this.insightQue.push({
        type: 'emerge',
        notSituation: this.startingSituation,
        cb: cb
      })
    }
  }
  return this._emerged
}

Ambition.prototype.reset =
function Ambition$reset () {
  this.situation = void 9
  if (typeof this.pregage === 'function') {
    this.pregage.call(this)
  }
  if (this.startingSituation) {
    return this.soon(this.startingSituation)
  }
}

Ambition.prototype.blunder =
function Ambition$blunder (err) {
  var situations, recovery
  situations = this.situations
  if (typeof (recovery = situations[this.situation].recovery) === 'function') {
    return recovery.call(this, err)
  }
  return this.emit('blunder', err)
}

Ambition.prototype.respond =
function Ambition$respond (cmd) {
  var args, responded, situation, situations, response, do_response, fn, p, obj
  var self = this
  args = slice.call(arguments, 0)
  responded = 0
  this.debug('response: ' + cmd + ' in ' + this.situation)
  if (!this.inExitHandler && (situation = this.situation)) {
    situations = this.situations
    response = cmd
    do_response = function (fn, response, path) {
      var args1, emitObj, ret
      args1 = args.slice(1)
      emitObj = {
        cmd: cmd,
        response: response,
        path: path,
        args: args1
      }
      self.emit.call(self, 'responding', emitObj)
      ret = fn.apply(self, response === '*' ? args : args1)
      self.debug('response(%s) called:ret (%s)', response, typeof ret === 'object'
        ? 'object'
        : typeof ret === 'string' && ret.length > 100 ? ret.substr(0, 97) + ' ...' : ret)
      emitObj.ret = ret
      self.emit.call(self, 'responded', emitObj)
      self.emit.call(self, 'responded:' + response, emitObj)
      if (self.insightQue.length) {
        self.followThrough('next-response')
      }
      responded++
    }
    if (typeof (fn = situations[situation][response]) === 'string') {
      response = fn
    }
    if (typeof (fn = situations[situation]['*']) === 'function') {
      do_response(fn, '*', '/situations/' + situation + '/' + response)
    }
    this.debug('response ' + response)
    if ((p = this.cmds) && typeof (fn = p[response]) === 'function') {
      do_response(fn, response, '/cmds/' + response)
    }
    if (typeof (fn = situations[situation][response]) === 'function') {
      do_response(fn, response, '/situations/' + situation + '/' + response)
    }
  }
  if (responded === 0) {
    this.debug("response: '" + cmd + "' next now (in situation:" + this.situation)
    obj = {
      type: 'next-now',
      cmd: cmd,
      args: args
    }
    return this.insightQue.push(obj)
  }
}

Ambition.prototype.respondSoon =
function Ambition$respondSoon () {
  var a
  var self = this
  a = arguments
  process.nextTick(function () {
    return self.response.apply(self, a)
  })
}

Ambition.prototype.soon =
function Ambition$soon () {
  var a
  var self = this
  a = arguments
  process.nextTick(function () {
    return self.now.apply(self, a)
  })
}

Ambition.prototype._resolve =
function Ambition$_resolve (it, cb) {
  var self = this
  var a = slice.call(arguments)
  var b
  var next = function () {
    if (arguments.length && typeof (b = arguments[0]) === 'object') daFunk.extend(self, b)
    process.nextTick(function () {
      cb.apply(self, a)
    })
  }
  ;(typeof it === 'object' ?
    (it instanceof Promise ?
      it : Array.isArray(it) ?
        Promise.settle(it) : Promise.props(it)).then(next)
    : typeof it === 'function' ? Promise.try(it).then(next) : next())
}

Ambition.prototype.now =
function Ambition$now (nextSituation) {
  var self = this
  var lastSituation, args1
  if (typeof nextSituation !== 'string') {
    nextSituation = nextSituation + ''
  }
  if (self.situation && self.situation[0] !== '/' && self.situation !== self.startingSituation) {
    console.log('WARNING ' + self.namespace + ' is trying to now while already in a now situation: ' + self.situation)
    return self.soon.apply(self, arguments)
  }
  if (self.inTransition) {
    return self.soon.apply(self, arguments)
  }
  self.debug('fsm: now %s -> %s', self.situation, nextSituation)
  if (!self.inExitHandler && nextSituation !== self.situation) {
    args1 = slice.call(arguments, 1)
    if (self.situations[nextSituation]) {
      self.inTransition = nextSituation
      self.priorSituation = self.situation
      self.situation = nextSituation
      if ((lastSituation = self.priorSituation)) {
        if (self.situations[lastSituation] && self.situations[lastSituation].end) {
          self.inExitHandler = true
          self.situations[lastSituation].end.apply(self, args1)
          self.inExitHandler = false
        }
      }
      if (self.situations[nextSituation].beginImmediately) {
        self._resolve(self.situations[nextSituation].beginImmediately.apply(self, args1), function () {
          // TODO: do something with any resolved things...
        })
      }
      if (self.situations[nextSituation].begin) {
        process.nextTick(function () {
          self._resolve(self.situations[nextSituation].begin.apply(self, args1), function () {})
        })
      }

      self.debug('fsm: post-now %s -> %s', lastSituation, nextSituation)
      self.emit.apply(self, ['situation:' + nextSituation].concat(args1))
      self.emit.call(self, 'now', {
        from: lastSituation,
        to: nextSituation,
        args: args1
      })
      if (self.insightQue.length) {
        self.followThrough.call(self, 'next-now')
        self.followThrough.call(self, 'deferred')
      }
      if (!self._emerged && nextSituation[0] === '/') {
        self.debug('initialzed! in %s', nextSituation)
        self.followThrough.call(self, 'emerge')
        self._emerged = nextSituation
      }
      self.inTransition = null
    } else {
      self.debug('attempted to now to an invalid situation: %s', nextSituation)
      self.emit.call(self, 'missing-situation', {
        from: self.situation,
        to: nextSituation,
        args: args1
      })
    }
  }
}

Ambition.prototype.followThrough =
function Ambition$followThrough (type) {
  var self = this
  if (type === 'deferred' && (!this.situation || (typeof this.situation === 'string' && this.situation[0] !== '/'))) {
    return
  }
  var filterFn = type === 'next-now'
    ? function (item) {
      return item.type === 'next-now'
    }
    : type === 'emerge'
      ? function (item, i) {
        return item.type === 'emerge' && (!self._emerged && item.notSituation !== self.situation && self.situation && self.situation[0] === '/')
      }
      : type === 'deferred'
        ? function (item, i) {
          return item.type === 'deferred' && ((item.untilSituation && item.untilSituation === self.situation) || (item.notSituation && item.notSituation !== self.situation))
        }
        : function (item) {
          return item.type === 'next-response'
        }
  // var len_before = this.insightQue.length
  var toProcess = this.insightQue.filter(filterFn)
  if (toProcess.length) {
    this.debug('process-q:' + type + '(' + toProcess.length + ')')
  }

  toProcess.forEach(function (item) {
    var fn, i
    if (filterFn(item, i)) {
      fn = item.type === 'deferred' || item.type === 'emerge'
        ? item.cb
        : self.response
      fn.apply(self, item.args)
      i = self.insightQue.indexOf(item)
      self.insightQue.splice(i, 1)
    }
  })
}

Ambition.prototype.clearQue =
function Ambition$clearQue (type, name) {
  if (!type) {
    this.insightQue = []
  } else {
    var filter
    if (type === 'next-now') {
      filter = function (evnt) {
        return evnt.type === 'next-now' && (name ? evnt.untilSituation === name : true)
      }
    } else if (type === 'next-response') {
      filter = function (evnt) {
        return evnt.type === 'next-response'
      }
    }
    this.insightQue = this.insightQue.filter(filter)
  }
}

Ambition.prototype.until =
function Ambition$until (situationName, cb) {
  var args, queued
  args = slice.call(arguments, 2)
  if (this.situation === situationName) {
    return cb.apply(this, args)
  } else {
    queued = {
      type: 'deferred',
      untilSituation: situationName,
      cb: cb,
      args: args
    }
    return this.insightQue.push(queued)
  }
}

Ambition.prototype.emitSoon =
function Ambition$emitSoon () {
  var a
  var self = this
  a = arguments
  return process.nextTick(function () {
    return self.emit.apply(self, a)
  })
}

// Ambition.prototype.emit =
// function Ambition$emit(insightName){
//   var args, doEmit
//   var self = this
//   if (this.muteEvents) {
//     return
//   }
//   args = arguments
//   this.debug("emit", insightName)
//   doEmit = function(){
//     var listeners, args1
//     if (self.debug.online) {
//       switch (insightName) {
//       case 'responding':
//         self.debug("responding: (%s:%s)", self.situation, args[1].response)
//         break
//       case 'responded':
//         self.debug("responded: (%s:%s)", self.situation, args[1].response)
//         break
//       case 'missing-situation':
//         self.debug.blunder("bad now: (%s !-> %s)", args[1].situation, args[1].attempted)
//         break
//       case 'now':
//         self.debug("now: (%s -> %s)", args[1].from, args[1].to)
//         break
//       default:
//         self.debug("emit: (%s): num args %s", insightName, args.length - 1)
//       }
//     }
//     if (listeners = self.insightListeners['*']) {
//       if (typeof listeners === 'function') {
//         listeners.apply(self, args)
//       } else {
//         _.each(self.insightListeners['*'], function(callback){
//           return callback.apply(this, args)
//         }, self)
//       }
//     }
//     if (listeners = self.insightListeners[insightName]) {
//       args1 = slice.call(args, 1)
//       if (typeof listeners === 'function') {
//         return listeners.apply(self, args1)
//       } else {
//         return _.each(listeners, function(callback){
//           return callback.apply(self, args1)
//         })
//       }
//     }
//   }
//   doEmit.call(this)
//   return this
// }

// Ambition.prototype.on =
// function Ambition$on(insightName, real_cb, callback){
//   var listeners
//   var self = this
//   if (typeof callback !== 'function') {
//     callback = real_cb
//     real_cb = void 9
//   }
//   listeners = this.insightListeners[insightName]
//   if (this.insightListeners === this.__proto__.insightListeners) {
//     this.insightListeners = _.cloneDeep(this.insightListeners)
//   }
//   if (!listeners) {
//     this.insightListeners[insightName] = []
//   }
//   if (typeof listeners === 'function') {
//     this.insightListeners[insightName] = [listeners]
//   }
//   this.insightListeners[insightName].push(callback)
//   if (insightName.substr(0, 6) === "situation:" && this.situation === insightName.substr(6)) {
//     process.nextTick(function(){
//       return callback.call(self)
//     })
//   }
//   return {
//     insightName: insightName,
//     callback: callback,
//     cb: real_cb,
//     off: function(){
//       return self.off(insightName, callback)
//     }
//   }
// }

// Ambition.prototype.once =
// function Ambition$once(insightName, callback){
//   var evt
//   var self = this
//   if (insightName === 'emerged') {
//     console.log("TODO")
//   } else {
//     evt = this.on(insightName, callback, function(){
//       evt.cb.apply(self, arguments)
//       process.nextTick(function(){
//         return evt.off(insightName, callback)
//       })
//     })
//   }
//   return this
// }

// Ambition.prototype.off =
// function Ambition$off(insightName, callback){
//   var i
//   if (!insightName) {
//     return this.insightListeners = {}
//   } else {
//     if (this.insightListeners[insightName]) {
//       if (callback) {
//         if (~(i = this.insightListeners[insightName].indexOf(callback))) {
//           return this.insightListeners[insightName].splice(i, 1)
//         }
//       } else {
//         return this.insightListeners[insightName] = []
//       }
//     }
//   }
// }
