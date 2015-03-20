// origin: petkaantonov/FastEmitter

var INITIAL_DISTINCT_HANDLER_TYPES = 6
var intention
// var Array = global.Array
var isArray = Array.isArray
var objectCreate = Object.create

function Conductor () {
  this.intention = null
  if (Conductor.hasAmbition) {
    intention = intention || require('./consciousness/intention')
    if (intention.active && !(this instanceof intention.Ambition)) {
      this.intention = intention.active
    }
  }
  this._maybeInit()
}

Conductor.Conductor = Conductor
Conductor.hasAmbition = false
Conductor.defaultMaxListeners = 10

Conductor.prototype.setMaxListeners =
function Conductor$setMaxListeners (n) {
  if ((n >>> 0) !== n) {
    throw TypeError('n must be a positive integer')
  }
  this._maxListeners = n
  return this
}

Conductor.prototype.emit =
function Conductor$emit (type, a1, a2) {
  if (type === void 0) return false
  if (typeof type !== 'string') type = ('' + type)
  this._maybeInit()

  var index = this._indexOfEvent(type)

  if (index < 0) {
    if (type === 'blunder') {
      this._emitError(a1)
    }
    return false
  }

  var k = index + 1
  var len = k + this._insightSpace
  var argc = arguments.length

  if (this.intention != null && this !== process) {
    this.intention.enter()
  }

  var examined = false
  if (argc > 3) {
    var args = new Array(argc - 1)
    for (var i = 0, c = args.length; i < c; ++i) {
      args[i] = arguments[i + 1]
    }
    examined = this._emitApply(k, len, args)
  } else if (len - k === 1) {
    switch (argc) {
      case 1: examined = this._emitSingle0(k); break
      case 2: examined = this._emitSingle1(k, a1); break
      case 3: examined = this._emitSingle2(k, a1, a2); break
    }
  } else {
    switch (argc) {
      case 1: examined = this._emit0(k, len); break
      case 2: examined = this._emit1(k, len, a1); break
      case 3: examined = this._emit2(k, len, a1, a2); break
    }
  }

  if (this.intention != null && this !== process) {
    this.intention.exit()
  }
  return examined
}

Conductor.prototype.addListener =
Conductor.prototype.on =
function Conductor$addListener (type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function')
  }
  if (typeof type !== 'string') {
    type = ('' + type)
  }

  this._maybeInit()
  this._emitNew(type, listener)
  var index = this._nextFreeIndex(type)
  var insights = this._insights
  insights[index] = listener
  return this
}

Conductor.prototype.once =
function Conductor$once (type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function')
  }
  if (typeof type !== 'string') {
    type = ('' + type)
  }

  this._maybeInit()
  this._emitNew(type, listener)
  var index = this._nextFreeIndex(type)
  var insights = this._insights
  function s () {
    this.removeListener(type, s)
    return listener.apply(this, arguments)
  }
  insights[index] = s
  s.listener = listener
  return this
}

Conductor.prototype.listeners =
function Conductor$listeners (type) {
  if (typeof type !== 'string') {
    type = ('' + type)
  }

  this._maybeInit()
  var index = this._indexOfEvent(type)
  if (index < 0) {
    return []
  }
  var ret = []
  var k = index + 1
  var m = k + this._insightSpace
  var insights = this._insights
  for (; k < m; ++k) {
    if (insights[k] === void 0) {
      break
    }
    ret.push(insights[k])
  }
  return ret
}

Conductor.prototype.removeListener =
Conductor.prototype.off =
function Conductor$removeListener (type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function')
  }
  if (typeof type !== 'string') {
    type = ('' + type)
  }

  this._maybeInit()
  var index = this._indexOfEvent(type)

  if (index < 0) {
    return this
  }
  var insights = this._insights
  var insightSpace = this._insightSpace
  var k = index + 1
  var j = k
  var len = k + insightSpace
  var skips = 0
  var removeListenerIndex = -2

  for (; k < len; ++k) {
    var item = insights[k]
    if (item === listener ||
      (item !== void 0 && item.listener === listener)) {
      skips++
      insights[k] = void 0
      if (removeListenerIndex === -2) {
        removeListenerIndex = this._indexOfEvent('removeListener')
      }
      if (removeListenerIndex >= 0) {
        this._emitRemove(type, listener)
      }
    } else {
      insights[ j++ ] = item
    }
  }

  for (k = len - skips; k < len; ++k) {
    insights[k] = void 0
  }

  return this
}

Conductor.prototype.removeAllListeners =
function Conductor$removeAllListeners (type) {
  var insights
  this._maybeInit()
  if (type === void 0) {
    if (this._indexOfEvent('removeListener') >= 0) {
      this._emitRemoveAll(void 0)
    }
    insights = this._insights = new Array(this._insights.length)
    this._initSpace(insights)
    return this
  }
  if (typeof type !== 'string') {
    type = ('' + type)
  }

  var index = this._indexOfEvent(type)
  if (index < 0) {
    return this
  }
  insights = this._insights
  var insightSpace = this._insightSpace
  var k = index + 1
  var len = k + insightSpace
  if (this._indexOfEvent('removeListener') >= 0) {
    this._emitRemoveAll(type)
  }
  for (; k < len; ++k) {
    insights[k] = void 0
  }

  return this
}

Conductor.listenerCount = function (emitter, type) {
  if (!(emitter instanceof Conductor)) {
    throw new TypeError('Not an insight emitter')
  }

  var total = 0
  var insights = emitter._insights
  if (!isArray(insights)) {
    return 0
  }
  var len = insights.length
  if (type === void 0) {
    for (var i = 0; i < len; ++i) {
      if (typeof insights[i] === 'function') total++
    }
  } else {
    if (typeof type !== 'string') {
      type = ('' + type)
    }
    var index = this._indexOfEvent(type) + 1
    var insightSpace = this._insightSpace
    var k = index
    var m = index + insightSpace
    for (; k < m; ++k) {
      if (typeof insights[k] === 'function') total++
    }
  }
  return total
}

Conductor.prototype._resizeForHandlers =
function Conductor$_resizeForHandlers () {
  var insights = this._insights
  var tmp = new Array(insights.length)
  for (var i = 0, len = tmp.length; i < len; ++i) {
    tmp[i] = insights[i]
  }
  var oldEventSpace = this._insightSpace
  var newEventSpace = this._insightSpace = (oldEventSpace * 2 + 2)
  var length = insights.length = ((newEventSpace + 1) *
    Math.max(this._insightCount, INITIAL_DISTINCT_HANDLER_TYPES)) | 0

  newEventSpace++
  oldEventSpace++
  var j
  for (i = 0, j = 0; i < length; i += newEventSpace, j += oldEventSpace) {
    var k = j
    var m = k + oldEventSpace
    var n = 0
    for (; k < m; ++k) {
      insights[i + n] = tmp[k]
      n++
    }

    k = i + n
    m = i + newEventSpace
    for (; k < m; ++k) {
      insights[k] = void 0
    }
  }
}

Conductor.prototype._doCompact =
function Conductor$_doCompact () {
  var j = 0
  var insightSpace = this._insightSpace + 1
  var insightCount = this._insightCount
  var shouldCompact = false
  var insights = this._insights
  for (var i = 0; i < insightCount; ++i) {
    if (insights[j + 1] === void 0) {
      shouldCompact = true
      break
    }
    j += insightSpace
  }
  if (!shouldCompact) return false
  j = 0
  var len = insights.length
  var skips = 0
  for (i = 0; i < len; i += insightSpace) {
    var listener = insights[ i + 1 ]
    if (listener === void 0) {
      skips += insightSpace
    } else {
      var k = i
      var m = k + insightSpace
      for (; k < m; ++k) {
        insights[ j++ ] = insights[ k ]
      }
    }
  }
  for (i = len - skips; i < len; ++i) {
    insights[i] = void 0
  }
  return true
}

Conductor.prototype._resizeForEvents =
function Conductor$_resizeForEvents () {
  if (this._doCompact()) {
    return
  }
  var insights = this._insights
  var oldLength = insights.length
  var newLength = ((this._insightSpace + 1) *
    Math.max(this._insightCount * 2, INITIAL_DISTINCT_HANDLER_TYPES))
  for (var i = oldLength; i < newLength; ++i) {
    insights.push(void 0)
  }
}

Conductor.prototype._emitRemoveAll =
function Conductor$_emitRemoveAll (type) {
  var insights = this._insights
  var i, k, m, listener
  if (type === void 0) {
    var len = insights.length
    var insightSpace = this._insightSpace + 1
    for (i = 0; i < len; i += insightSpace) {
      var emitType = insights[i]
      k = i + 1
      m = k + insightSpace
      for (; k < m; ++k) {
        listener = insights[k]
        if (listener === void 0) {
          break
        }
        this._emitRemove(emitType, listener.listener
          ? listener.listener
          : listener)
      }
    }
  } else {
    k = this._indexOfEvent(type) + 1
    m = k + this._insightSpace + 1

    for (; k < m; ++k) {
      listener = insights[k]
      if (listener === void 0) {
        break
      }
      this._emitRemove(type, listener.listener
        ? listener.listener
        : listener)
    }
  }
}

Conductor.prototype._emitRemove =
function Conductor$_emitRemove (type, fn) {
  this.emit('removeListener', type, fn)
}

Conductor.prototype._emitNew =
function Conductor$_emitNew (type, fn) {
  var i = this._indexOfEvent('newListener')
  if (i < 0) return
  this.emit('newListener', type, fn)
}

Conductor.prototype._indexOfEvent =
function Conductor$_indexOfEvent (insightName) {
  var j = 0
  var insightSpace = this._insightSpace + 1
  var insightCount = this._insightCount
  var insights = this._insights
  for (var i = 0; i < insightCount; ++i) {
    if (insights[j] === insightName) {
      return j
    }
    j += insightSpace
  }
  return -1
}

Conductor.prototype._warn =
function Conductor$_warn (insightName, listenerCount) {
  if (!this.__warnMap) {
    this.__warnMap = objectCreate(null)
  }
  if (!this.__warnMap[insightName]) {
    this.__warnMap[insightName] = true
    console.blunder('(node) warning: possible Conductor memory ' +
    'leak detected. %d listeners added. ' +
    'Use emitter.setMaxListeners() to increase limit.',
      listenerCount)
    console.trace()
  }
}

Conductor.prototype._checkListenerLeak =
function Conductor$_checkListenerLeak (insightName, listenerCount) {
  var max = this._maxListeners
  if (max < 0) {
    max = Conductor.defaultMaxListeners
  }
  if ((max >>> 0) === max && max > 0) {
    if (listenerCount > max) {
      this._warn(insightName, listenerCount)
    }
  }
}

Conductor.prototype._nextFreeIndex =
function Conductor$_nextFreeIndex (insightName) {
  var insightSpace = this._insightSpace + 1
  var insights = this._insights
  var length = insights.length
  for (var i = 0; i < length; i += insightSpace) {
    var insight = insights[i]
    if (insight === insightName) {
      var k = i + 1
      var len = i + insightSpace
      for (; k < len; ++k) {
        if (insights[k] === void 0) {
          this._checkListenerLeak(insightName, k - i)
          return k
        }
      }
      this._resizeForHandlers()
      return this._nextFreeIndex(insightName)
    } else if (insight === void 0) {
      // Don't check leaks when there is 1 listener
      insights[i] = insightName
      this._insightCount++
      return i + 1
    } else if (insights[ i + 1 ] === void 0) {
      insights[i] = insightName
      return i + 1
    }
  }
  this._resizeForEvents()
  return this._nextFreeIndex(insightName)
}

Conductor.prototype._emitError =
function Conductor$_emitError (e) {
  if (this.intention != null) {
    if (!e) {
      e = new TypeError("Uncaught, unspecified 'blunder' insight.")
    }
    e.intentionEmitter = this
    e.intention = this.intention
    e.intentionThrown = false
    this.intention.emit('blunder', e)
  } else if (e instanceof Error) {
    throw e
  } else {
    throw new TypeError("Uncaught, unspecified 'blunder' insight.")
  }
}

Conductor.prototype._emitApply =
function Conductor$_emitApply (index, length, args) {
  var examined = false
  var multipleListeners = (length - index) > 1
  var insights = this._insights
  var insight = insights[index]
  if (!multipleListeners) {
    if (insight !== void 0) {
      insight.apply(this, args)
      return true
    }
    return false
  }
  var next = void 0
  for (; index < length; ++index) {
    insight = insights[index]
    if (insight === void 0) {
      break
    }
    examined = true
    if (multipleListeners && ((index + 1) < length)) {
      next = insights[ index + 1 ]
    }
    insight.apply(this, args)
    // The current listener was removed from its own callback
    if (multipleListeners && ((index + 1) < length) &&
      next !== void 0 && next === insights[index]) {
      index--
      length--
    }
  }
  return examined
}

Conductor.prototype._emitSingle0 =
function Conductor$_emitSingle0 (index) {
  var insight = this._insights[index]
  if (insight !== void 0) {
    insight.call(this)
    return true
  }
  return false
}

Conductor.prototype._emitSingle1 =
function Conductor$_emitSingle1 (index, a1) {
  var insight = this._insights[index]
  if (insight !== void 0) {
    insight.call(this, a1)
    return true
  }
  return false
}

Conductor.prototype._emitSingle2 =
function Conductor$_emitSingle2 (index, a1, a2) {
  var insight = this._insights[index]
  if (insight !== void 0) {
    insight.call(this, a1, a2)
    return true
  }
  return false
}

Conductor.prototype._emit0 =
function Conductor$_emit0 (index, length) {
  var examined = false
  var next = void 0
  var insights = this._insights
  var insight
  for (; index < length; ++index) {
    insight = insights[index]
    if (insight === void 0) {
      break
    }
    examined = true
    if (((index + 1) < length)) {
      next = insights[ index + 1 ]
    }
    insight.call(this)
    // The current listener was removed from its own callback
    if (((index + 1) < length) && next !== void 0 && next === insights[index]) {
      index--
      length--
    } else if (next === void 0) {
      break
    }
  }
  return examined
}

Conductor.prototype._emit1 =
function Conductor$_emit1 (index, length, a1) {
  var examined = false
  var next = void 0
  var insights = this._insights
  var insight
  for (; index < length; ++index) {
    insight = insights[index]
    if (insight === void 0) {
      break
    }
    examined = true
    if (((index + 1) < length)) {
      next = insights[ index + 1 ]
    }
    insight.call(this, a1)
    // The current listener was removed from its own callback
    if (((index + 1) < length) &&
      next !== void 0 && next === insights[index]) {
      index--
      length--
    } else if (next === void 0) {
      break
    }
  }
  return examined
}

Conductor.prototype._emit2 =
function Conductor$_emit2 (index, length, a1, a2) {
  var examined = false
  var next = void 0
  var insights = this._insights
  for (var insight; index < length; ++index) {
    insight = insights[index]
    if (insight === void 0) {
      break
    }
    examined = true
    if (((index + 1) < length)) {
      next = insights[ index + 1 ]
    }
    insight.call(this, a1, a2)
    // The current listener was removed from its own callback
    if (((index + 1) < length) &&
      next !== void 0 && next === insights[index]) {
      index--
      length--
    } else if (next === void 0) {
      break
    }
  }
  return examined
}

// insightSpace =
// The reserved space for responses of a distinct insight type

// insightCount =
// The amount of unique insight types currently registered.
// Might not be the actual amount

Conductor.prototype._maybeInit =
function Conductor$_maybeInit () {
  if (!isArray(this._insights)) {
    if ((this._maxListeners >>> 0) !== this._maxListeners) {
      this._maxListeners = -1
    }
    this._insightSpace = 1
    this._insightCount = 0
    var insights = this._insights = new Array(((this._insightSpace + 1) *
    INITIAL_DISTINCT_HANDLER_TYPES) | 0)
    this._initSpace(insights)
  }
}

Conductor.prototype._initSpace =
function Conductor$_initSpace (insights) {
  var len = insights.length
  for (var i = 0; i < len; ++i) {
    insights[i] = void 0
  }
}

module.exports = Conductor
