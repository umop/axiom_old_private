if (typeof define !== 'function' && typeof __axiomRequire__ !== 'function') {
  var define, __axiomRequire__, __axiomExport__;

  (function() {
    var registry = {}, seen = {};

    define = function(name, deps, callback) {
      registry[name] = { deps: deps, callback: callback };
    };

    __axiomRequire__ = function(name, opt_fromList) {
      if (seen[name]) { return seen[name]; }
      var fromList = opt_fromList || [];

      var mod = registry[name];

      if (!mod) {
        throw new Error("Module: '" + name +
                        "' not found, referenced from: " +
                        fromList[fromList.length - 1]);
      }

      var deps = mod.deps,
      callback = mod.callback,
      reified = [],
      exports;

      fromList.push(name);

      for (var i = 0, l = deps.length; i<l; i++) {
        if (deps[i] === 'exports') {
          reified.push(exports = {});
        } else {
          if (fromList.indexOf(deps[i]) != -1)
            throw new Error('Circular dependency: ' + name + ' -> ' + deps[i]);
          reified.push(__axiomRequire__(deps[i], fromList));
        }
      }

      fromList.pop(name);

      var value = callback.apply(this, reified);

      return seen[name] = exports || value;
    };

    function makeGlobals(global) {
      var createdModules = {};
      var root = global;

      function ensureModule(moduleName) {
        var current = root;
        var names = moduleName.split('/');
        // Ensure parent modules are created
        for (var i = 0; i < names.length; i++) {
          var childName = names[i];
          var child = current[childName];
          if (!child) {
            child = current[childName] = {};
          }
          current = child;
        }
        return current;
      }

      for (var name in registry) {
        var moduleGlobal = ensureModule(name);
        var exports = __axiomRequire__(name);
        for (var key in exports) {
          if (moduleGlobal.hasOwnProperty(key)) {
            throw new Error('Property "' + key + '" of module "' + name +
                            '" conflicts with submodule of same name.');
          }
          moduleGlobal[key] = exports[key];
        }
      }

      return root;
    }

    __axiomExport__ = function(opt_global) {
      if (!opt_global)
        opt_global = window;
      return makeGlobals(opt_global);
    }

    define.registry = registry;
    define.seen = seen;
  })();
}

// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @constructor
 * @template T
 */
define("axiom/core/completer", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var Completer = function() {
    /** @type {function(T)} */
    this.resolve;

    /** @type {function(*)} */
    this.reject;

    /** @type {!Promise<T>} */
    this.promise = new Promise(
      function(/** function(T) */ resolve, /** function(*) */ reject) {
        this.resolve = resolve;
        this.reject = reject;
      }.bind(this));
  };

  __es6_export__("Completer", Completer);
  __es6_export__("default", Completer);
});

//# sourceMappingURL=completer.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/core/ephemeral",
  ["axiom/core/error", "axiom/core/event", "axiom/core/completer", "exports"],
  function(
    axiom$core$error$$,
    axiom$core$event$$,
    axiom$core$completer$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var AxiomEvent;
    AxiomEvent = axiom$core$event$$["default"];
    var Completer;
    Completer = axiom$core$completer$$["default"];
    var Ephemeral = function() {
      /** @private @type {!Completer<T>} */
      this.ephemeralCompleter_ = new Completer();

      /** @type {!Promise<T>} */
      this.ephemeralPromise = this.ephemeralCompleter_.promise;

      /** @type {Ephemeral.State} */
      this.readyState = Ephemeral.State.Wait;

      /** @type {boolean} */
      this.isValid = false;

      /** @type {*} */
      this.readyValue = null;

      /** @type {?string} */
      this.closeReason = null;

      /** @type {*} */
      this.closeValue = null;

      /** @const @type {!AxiomEvent} */
      this.onReady = new AxiomEvent();

      /** @const @type {!AxiomEvent} */
      this.onReset = new AxiomEvent();

      /** @const @type {!AxiomEvent} */
      this.onError = new AxiomEvent();

      /** @const @type {!AxiomEvent} */
      this.onClose = new AxiomEvent();

      this.reset();
    };

    __es6_export__("Ephemeral", Ephemeral);
    __es6_export__("default", Ephemeral);

    /** @enum {string} */
    Ephemeral.State = {
      Wait: 'Wait',
      Ready: 'Ready',
      Error: 'Error',
      Closed: 'Closed'
    };

    Ephemeral.prototype.reset = function() {
      this.assertEphemeral('Wait', 'Closed', 'Error');

      this.readyState = Ephemeral.State.Wait;
      this.ephemeralCompleter_ = new Completer();
      this.ephemeralPromise = this.ephemeralCompleter_.promise;
      var ephemeralPromise = this.ephemeralPromise;

      this.ephemeralPromise.then(
        function(resolveValue) {
          if (this.ephemeralPromise != ephemeralPromise)
            return;

          this.closeReason = 'ok';
          this.closeValue = resolveValue;
          this.isValid = false;
          this.readyState = Ephemeral.State.Closed;

          this.onClose.fire(this.closeReason, resolveValue);
        }.bind(this),
        function(rejectValue) {
          if (this.ephemeralPromise != ephemeralPromise)
            return;

          this.closeReason = 'error';
          this.closeValue = rejectValue;
          this.isValid = false;

          if (this.readyState == Ephemeral.State.Ready) {
            this.readyState = Ephemeral.State.Closed;
            this.onClose.fire(this.closeReason, rejectValue);
          } else {
            this.readyState = Ephemeral.State.Error;
            this.onError.fire(rejectValue);
          }
        }.bind(this));

      this.onReset.fire(this.ephemeralPromise);
    };

    /**
     * Return true if this Ephemeral is in one of the listed states.
     *
     * @param {...string} var_args
     * @return {boolean}
     */
    Ephemeral.prototype.isEphemeral = function(var_args) {
      for (var i = 0; i < arguments.length; i++) {
        var stateName = arguments[i];
        if (!Ephemeral.State.hasOwnProperty(stateName))
          throw new Error('Unknown state: ' + stateName);

        if (this.readyState == Ephemeral.State[stateName])
          return true;
      }

      return false;
    };

    /**
     * Throw an exception if this Ephemeral is not ready.
     */
    Ephemeral.prototype.assertReady = function() {
      if (this.readyState != Ephemeral.State.Ready)
        throw new AxiomError.Ephemeral('READY', this.readyState);
    };

    /**
     * Throw an exception if this Ephemeral is not in one of the listed states.
     *
     * @param {...string} var_args
     */
    Ephemeral.prototype.assertEphemeral = function(var_args) {
      if (!this.isEphemeral.apply(this, arguments)) {
        throw new AxiomError.Ephemeral(Array.prototype.slice.call(arguments),
                                       this.readyState);
      }
    };

    /**
     * @param {Ephemeral} otherReady
     */
    Ephemeral.prototype.dependsOn = function(otherEphemeral) {
      otherEphemeral.onClose.addListener(
        function() {
          if (this.isEphemeral('Closed', 'Error'))
            return;

          this.closeError(new AxiomError.ParentClosed(otherEphemeral.closeReason,
                                                      otherEphemeral.closeValue));
        }.bind(this));
    };

    /**
     * @param {*=} opt_value
     */
    Ephemeral.prototype.ready = function(opt_value) {
      this.assertEphemeral('Wait');
      this.readyValue = opt_value;
      this.readyState = Ephemeral.State.Ready;
      this.isValid = true;
      this.onReady.fire(opt_value);
    };

    /**
     * @param {*=} opt_value
     * @return {Promise<T>}
     */
    Ephemeral.prototype.closeOk = function(opt_value) {
      this.assertEphemeral('Ready');
      this.ephemeralCompleter_.resolve(opt_value);
      return this.ephemeralPromise;
    };

    /**
     * @param {*} value
     * @return {Promise<T>}
     */
    Ephemeral.prototype.closeError = function(value) {
      this.assertEphemeral('Ready', 'Wait');

      if (!(value instanceof AxiomError)) {
        if (value instanceof Error) {
          value = value.toString() + ' ' + value.stack;
        } else if (value instanceof Object && 'toString' in value) {
          value = value.toString();
        } else {
          value = JSON.stringify(value);
        }

        value = new AxiomError.Unknown(value);
      }

      this.ephemeralCompleter_.reject(value);
      return this.ephemeralPromise;
    };
  }
);

//# sourceMappingURL=ephemeral.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @constructor
 * An error value used when rejecting a promise.
 *
 * TODO(rginda): I haven't used Promises enough yet to know if rejecting a
 * promise is a friendly thing to do.  It may be that we'd really rather
 * resolve a promise to an error value for non-fatal failures.  If that's
 * the case we should change this to a Result class which can indicate
 * "ok" with a result value or "error" with an Err value.
 *
 * @param {string} name
 * @param {*} value
 */
define("axiom/core/error", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var AxiomError = function(name, value) {
   Error.call(this);

   // The Error ctor doesn't seem to apply the message argument correctly, so
   // we set it by hand instead.  The message property gives DevTools an
   // informative message to dump for uncaught exceptions.
   /** @const {string} */
   this.message = name + ': ' + JSON.stringify(value);

   // Similar with the stack property.
   /** @type {string} */
   this.stack = (new Error()).stack;

   /** @const {string} */
   this.errorName = name;

   /** @const {*} */
   this.errorValue = value;
 };

 __es6_export__("AxiomError", AxiomError);
 __es6_export__("default", AxiomError);

 /**
  * Stringified error subclass name.
  *
  * @const {string}
  */
 AxiomError.errorName = 'AxiomError';

 /**
  * List of argument names defined for the error subclass.
  *
  * @const {Array<string>}
  */
 AxiomError.argNames = [];

 /**
  * Subclass of a native Error.
  */
 AxiomError.prototype = Object.create(Error.prototype);

 /**
  * Checks if the given error object is an instance of AxiomError.
  *
  * This method is also copied onto all AxiomError subclasses, where it can
  * be used to check if the error object is an instance of the particular
  * subclass.
  *
  * @this {function(...)}
  * @param {Object} err
  */
 AxiomError.test = function(err) {
   return (err instanceof AxiomError && err.errorName === this.errorName);
 };

 AxiomError.prototype.toString = function() {
   return 'AxiomError: ' + this.message;
 };

 /**
  * @param {Arguments} args
  */
 AxiomError.prototype.init = function(args) {
   AxiomError.apply(this, args);

   this.errorName = this.ctor.errorName;
   var argNames = this.ctor.argNames;

   if (args.length != argNames.length) {
     throw new Error('Not enough arguments for error :' + this.errorName +
                     ', got: ' + args.length + ', expected: ' +
                     argNames.length);
   }

   this.errorValue = {};
   for (var i = 0; i < argNames.length; i++) {
     this.errorValue[argNames[i]] = args[i];
   }
 };

 /**
  * @param {Object<string, function(...)>} map
  */
 AxiomError.subclasses = function(map) {
   for (var name in map) {
     AxiomError.subclass(map[name], name);
   }
 };

 /**
  * @param {function(...)} ctor
  * @param {string=} opt_name
  */
 AxiomError.subclass = function(ctor, opt_name) {
   var match = ctor.toString().match(/^function [^\(]*\(([^\)]*)\)/);
   if (!match)
     throw new Error('Error parsing AxiomError constructor: ' + ctor.toString());

   var argNames = [];

   if (match[1]) {
     ctor.argNames = match[1].split(/\s*,\s*/);
   } else {
     ctor.argNames = [];
   }

   ctor.errorName = opt_name || ctor.name;
   ctor.test = AxiomError.test.bind(ctor);
   ctor.prototype = Object.create(AxiomError.prototype);
   ctor.prototype.ctor = ctor;
 };

 // NOTE: See the note at the end of this file.

 /**
  * @constructor @extends{AxiomError}
  */
 AxiomError.AbstractCall = function() { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  *
  * @param {string} type
  * @param {*} value
  */
 AxiomError.Duplicate = function(type, value) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  *
  * @param {string|Array} expected
  * @param {string} found
  */
 AxiomError.Ephemeral = function(expected, found) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} type
  * @param {*} value
  */
 AxiomError.Incompatible = function(type, value) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  */
 AxiomError.Interrupt = function() { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} type
  * @param {*} value
  */
 AxiomError.Invalid = function(type, value) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} type
  */
 AxiomError.Missing = function(type) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} type
  * @param {*} value
  */
 AxiomError.NotFound = function(type, value) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} message
  */
 AxiomError.NotImplemented = function(message) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} reason
  * @param {*} value
  */
 AxiomError.ParentClosed = function(reason, value) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} message
  */
 AxiomError.Runtime = function(message) { this.init(arguments) };

 /**
  * @constructor @extends{AxiomError}
  * @param {string} expectedType
  * @param {*} gotValue
  */
 AxiomError.TypeMismatch = function(expectedType, gotValue) {
   this.init(arguments);
 };

 /**
  * @constructor @extends{AxiomError}
  * @param {*} value
  */
 AxiomError.Unknown = function(value) { this.init(arguments) };

 // NOTE(rginda): I wanted to be able to statically declare the above errors
 // in a way that closure would understand, but also wanted to avoid lots of
 // boilerplate repition of the error names.  So the constructors are set up
 // first and then we search AxiomError properties for things starting in
 // uppercase in order to turn them into "proper" subclasses of AxiomError.
 for (var key in AxiomError) {
   if (/^[A-Z]/.test(key))
     AxiomError.subclass(AxiomError[key], key);
 }
});

//# sourceMappingURL=error.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @constructor
 * An event is a JavaScript object with addListener, removeListener, and
 * fire methods.
 *
 * @param {function(...)=} opt_firstCallback The optional function to call
 *     before the observers.
 * @param {function(...)=} opt_finalCallback The optional function to call
 *     after the observers.
 *
 * @return {function(...)} A function that, when called, invokes all callbacks
 *     with whatever arguments it was passed.
 */
define("axiom/core/event", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var AxiomEvent = function(opt_firstCallback, opt_finalCallback) {
    this.firstCallback_ = opt_firstCallback;
    this.finalCallback_ = opt_finalCallback;

    // Array of [callback, self] arrays.
    this.observers_ = [];

    /**
     * Number of active observers.
     */
    this.observerCount = 0;

    // Pre-bound fire() method is easier to chain to other handlers.
    this.fire = this.fire_.bind(this);
  };

  __es6_export__("AxiomEvent", AxiomEvent);
  __es6_export__("default", AxiomEvent);

  /**
   * Dispatch this event.
   *
   * When fire is called the firstCallback is invoked, followed by all of the
   * listeners in the order they were attached, followed by the finalCallback.
   * (Yes, this is all synchronous.)
   *
   * This method is overwritten in the constructor to be bound to the event
   * instance.  This makes is a bit easier to chain the fire() method to other
   * events.
   *
   * @param {...*} var_args
   * @return {*} Any value returned by firstCallback or finalCallback.  If they
   *   both return a value, finalCallback wins.
   */
  AxiomEvent.prototype.fire = function(var_args) {};

  /**
   * @param {...} var_args
   */
  AxiomEvent.prototype.fire_ = function(var_args) {
    var rv;

    if (this.firstCallback_)
      rv = this.firstCallback_.apply(this, arguments);

    for (var i = this.observers_.length - 1; i >= 0; i--) {
      var observer = this.observers_[i];
      observer[0].apply(observer[1], arguments);
    }

    if (this.finalCallback_)
      rv = this.finalCallback_.apply(this, arguments);

    return rv;
  };

  /**
   * Add a callback function that unregisters itself after the first callback.
   *
   * @param {function(...)} callback The function to call back.
   * @param {Object=} opt_obj The optional |this| object to apply the function
   *   to.  You can use this in place of bind() so you don't have to save
   *   the bound function for a future call to removeListener.
   */
  AxiomEvent.prototype.listenOnce = function(callback, opt_obj) {
    var listener = function() {
      callback.apply(opt_obj || null, arguments);
      this.removeListener(listener);
    }.bind(this);

    this.addListener(listener);
  };

  /**
   * Add a callback function.
   *
   * @param {function(...)} callback The function to call back.
   * @param {Object=} opt_obj The optional |this| object to apply the function
   *   to.  You can use this in place of bind() so you don't have to save
   *   the bound function for a future call to removeListener.
   */
  AxiomEvent.prototype.addListener = function(callback, opt_obj) {
    if (!callback)
      throw new Error('Missing param: callback');

    this.observers_.unshift([callback, opt_obj]);
    this.observerCount = this.observers_.length;
  };

  /**
   * Remove a callback function.
   *
   * @param {function(...)} callback The callback function to remove.
   * @param {Object=} opt_obj The optional |this| object passed when registering
   *   this observer.
  */
  AxiomEvent.prototype.removeListener = function(callback, opt_obj) {
    for (var i = 0; i < this.observers_.length; i++) {
      if (this.observers_[i][0] == callback && this.observers_[i][1] == opt_obj) {
        this.observers_.splice(i, 1);
        break;
      }
    }

    this.observerCount = this.observers_.length;
  };
});

//# sourceMappingURL=event.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/base/execute_context",
  ["axiom/core/error", "axiom/core/event", "axiom/core/ephemeral", "axiom/fs/path", "axiom/fs/tty_state", "exports"],
  function(
    axiom$core$error$$,
    axiom$core$event$$,
    axiom$core$ephemeral$$,
    axiom$fs$path$$,
    axiom$fs$tty_state$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var AxiomEvent;
    AxiomEvent = axiom$core$event$$["default"];
    var Ephemeral;
    Ephemeral = axiom$core$ephemeral$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var TTYState;
    TTYState = axiom$fs$tty_state$$["default"];

    /** @typedef FileSystem$$module$axiom$fs$base$file_system */
    var FileSystem;

    /** @typedef OpenContext$$module$axiom$fs$base$open_context */
    var OpenContext;

    /** @typedef OpenMode$$module$axiom$fs$open_mode */
    var OpenMode;

    var ExecuteContext = function(fileSystem, path, arg) {
      Ephemeral.call(this);

      /**
       * @type {!FileSystem} Parent file system.
       */
      this.fileSystem = fileSystem;

      /**
       * @type {Path} The path we're supposed to execute.
       */
      this.path = path;

      /**
       * @type {*} The argument to pass to the executable.
       */
      this.arg = arg;

      // If the parent file system is closed, we close too.
      this.dependsOn(this.fileSystem);

      /**
       * The ExecuteContext we're currently calling out to, if any.
       *
       * See setCallee().
       *
       * @type {ExecuteContext}
       */
      this.callee = null;

      /** @type {!AxiomEvent} */
      this.onSignal = new AxiomEvent();
      /** @type {!AxiomEvent} */
      this.onStdOut = new AxiomEvent();
      /** @type {!AxiomEvent} */
      this.onStdErr = new AxiomEvent();
      /** @type {!AxiomEvent} */
      this.onStdIn = new AxiomEvent();
      /** @type {!AxiomEvent} */
      this.onTTYChange = new AxiomEvent();
      /** @type {!AxiomEvent} */
      this.onTTYRequest = new AxiomEvent();

      /**
       * The environtment variables for this execute context.
       * @private @type {Object<string, *>}
       */
      this.env_ = {};

      /**
       * The tty state for this execute context.
       * @private @type {!TTYState}
       */
      this.tty_ = new TTYState();
    };

    __es6_export__("ExecuteContext", ExecuteContext);
    __es6_export__("default", ExecuteContext);

    ExecuteContext.prototype = Object.create(Ephemeral.prototype);

    /**
     * Initiate the execute.
     *
     * Returns a promise that completes when the execution is complete.
     *
     * @return {!Promise<*>}
     */
    ExecuteContext.prototype.execute = function() {
      this.assertEphemeral('Wait');
      return this.ephemeralPromise;
    };

    /**
     * Set the given ExecuteContext as the callee for this instance.
     *
     * When calling another executable, incoming calls and outbound events are
     * wired up to the caller as appropriate.  This instance will not receive
     * the stdio-like events while a call is in progress.  The onSignal event,
     * however, is delivered to this instance even when a call is in progress.
     *
     * If the callee is closed, events are rerouted back to this instance and the
     * callee instance property is set to null.
     *
     * @param {ExecuteContext} executeContext
     * @return {void}
     */
    ExecuteContext.prototype.setCallee = function(executeContext) {
      if (this.callee)
        throw new AxiomError.Runtime('Call in progress');

      this.callee = executeContext;
      var previousInterruptChar = this.tty_.interrupt;

      var onClose = function() {
        this.callee.onStdOut.removeListener(this.onStdOut.fire);
        this.callee.onStdOut.removeListener(this.onStdErr.fire);
        this.callee.onTTYRequest.removeListener(this.onTTYRequest.fire);
        this.callee = null;

        if (this.tty_.interrupt != previousInterruptChar)
          this.requestTTY({interrupt: previousInterruptChar});
      }.bind(this);

      this.callee.onClose.listenOnce(onClose);
      this.callee.onStdOut.addListener(this.onStdOut.fire);
      this.callee.onStdErr.addListener(this.onStdErr.fire);
      this.callee.onTTYRequest.addListener(this.onTTYRequest.fire);
      this.callee.setEnvs(this.env_);
      this.callee.setTTY(this.tty_);
    };

    /**
     * Utility method to construct a new ExecuteContext, set it as the callee, and
     * execute it with the given path and arg.
     *
     * @param {FileSystem} fileSystem
     * @param {Path} path
     * @param {Object} arg
     * @return {Promise<*>}
     */
    ExecuteContext.prototype.call = function(fileSystem, path, arg) {
      return fileSystem.createExecuteContext(path, arg).then(
        function(cx) {
          this.setCallee(cx);
          return cx.execute();
        }.bind(this));
    };

    /**
     * Return a copy of the internal tty state.
     * @return {TTYState}
     */
    ExecuteContext.prototype.getTTY = function() {
      return this.tty_.clone();
    };

    /**
     * Set the authoritative state of the tty.
     *
     * This should only be invoked in the direction of tty->executable.  Calls in
     * the reverse direction will only affect this instance and those derived (via
     * setCallee) from it, and will be overwritten the next time the authoritative
     * state changes.
     *
     * Executables should use requestTTY to request changes to the authoritative
     * state.
     *
     * @param {TTYState} tty
     * @return {void}
     */
    ExecuteContext.prototype.setTTY = function(tty) {
      this.assertEphemeral('Wait', 'Ready');

      this.tty_.copyFrom(tty);
      this.onTTYChange.fire(this.tty_);

      if (this.callee)
        this.callee.setTTY(tty);
    };

    /**
     * @private
     *
     * Return a by-value copy of the given value.
     *
     * @param {*} v
     * @return {*}
     */
    ExecuteContext.prototype.copyValue_ = function(v) {
      if (v instanceof Object)
        return JSON.parse(JSON.stringify(v));

      return v;
    };

    /**
     * Request a change to the controlling tty.
     *
     * At the moment only the 'interrupt' property can be changed.
     *
     * @param {Object} tty An object containing a changeable property of the
     *   tty.
     * @return {void}
     */
    ExecuteContext.prototype.requestTTY = function(tty) {
      this.assertEphemeral('Ready');

      if (typeof tty.interrupt == 'string')
        this.onTTYRequest.fire({interrupt: tty.interrupt});
    };

    /**
     * Get a copy of the current environment variables.
     *
     * @return {*}
     */
    ExecuteContext.prototype.getEnvs = function() {
      return this.copyValue_(this.env_);
    };

    /**
     * Get the value of the given environment variable, or the provided
     * defaultValue if it is not set.
     *
     * @param {string} name
     * @param {*=} opt_defaultValue
     * TODO(rpaquay): Callers expect string
     * return {*}
     */
    ExecuteContext.prototype.getEnv = function(name, opt_defaultValue) {
      if (this.env_.hasOwnProperty(name))
        return this.copyValue_(this.env_[name]);

      return opt_defaultValue;
    };

    /**
     * Overwrite the current environment.
     *
     * @param {Object} env
     * @return {void}
     */
    ExecuteContext.prototype.setEnvs = function(env) {
      this.assertEphemeral('Wait', 'Ready');
      for (var key in env) {
        this.setEnv(key, this.copyValue_(env[key]));
      }
    };

    /**
     * Set the given environment variable.
     *
     * @param {string} name
     * @param {*} value
     * @return {void}
     */
    ExecuteContext.prototype.setEnv = function(name, value) {
      this.assertEphemeral('Wait', 'Ready');
      this.env_[name] = this.copyValue_(value);
    };

    /**
     * Remove the given environment variable.
     *
     * @param {string} name
     * @return {void}
     */
    ExecuteContext.prototype.delEnv = function(name) {
      this.assertEphemeral('Wait', 'Ready');
      delete this.env_[name];
    };

    /**
     * Create a new execute context using the fs.FileSystem for this execute
     * context, bound to the lifetime of this context.
     *
     * @param {Path} path
     * @param {Object} arg
     * @return {Promise<ExecuteContext>}
     */
    ExecuteContext.prototype.createExecuteContext = function(path, arg) {
      return this.fileSystem.createExecuteContext(path, arg).then(
        function(cx) {
          cx.dependsOn(this);
          return cx;
        });
    };

    /**
     * Create a new open context using the fs.FileSystem for this execute
     * context, bound to the lifetime of this context.
     *
     * @param {Path} path
     * @param {OpenMode} mode
     * @return {Promise<OpenContext>}
     */
    ExecuteContext.prototype.createOpenContext = function(path, mode) {
      return this.fileSystem.createOpenContext(path, mode).then(
        function(cx) {
          cx.dependsOn(this);
          return cx;
        });
    };

    /**
     * Send a signal to the running executable.
     *
     * The only signal defined at this time has the name 'Interrupt' and a null
     * value.
     *
     * @param {string} name
     * @param {string} value
     * @return {void}
     */
    ExecuteContext.prototype.signal = function(name, value) {
      this.assertReady();
      if (this.callee) {
        this.callee.closeError(new AxiomError.Interrupt());
      } else {
        this.onSignal.fire(name, value);
      }
    };

    /**
     * Send stdout from this executable.
     *
     * This is not restricted to string values.  Recipients should filter out
     * non-string values in their onStdOut handler if necessary.
     *
     * TODO(rginda): Add numeric argument onAck to support partial consumption.
     *
     * @param {*} value The value to send.
     * @param {function()=} opt_onAck The optional function to invoke when the
     *   recipient acknowledges receipt.
     * @return {void}
     */
    ExecuteContext.prototype.stdout = function(value, opt_onAck) {
      if (!this.isEphemeral('Ready')) {
        console.warn('Dropping stdout to closed execute context:', value);
        return;
      }

      this.onStdOut.fire(value, opt_onAck);
    };

    /**
     * Send stderr from this executable.
     *
     * This is not restricted to string values.  Recipients should filter out
     * non-string values in their onStdErr handler if necessary.
     *
     * TODO(rginda): Add numeric argument onAck to support partial consumption.
     *
     * @param {*} value The value to send.
     * @param {function()=} opt_onAck The optional function to invoke when the
     *   recipient acknowledges receipt.
     * @return {void}
     */
    ExecuteContext.prototype.stderr = function(value, opt_onAck) {
      if (!this.isEphemeral('Ready')) {
        console.warn('Dropping stderr to closed execute context:', value);
        return;
      }

      this.onStdErr.fire(value, opt_onAck);
    };

    /**
     * Send stdout to this executable.
     *
     * This is not restricted to string values.  Recipients should filter out
     * non-string values in their onStdIn handler if necessary.
     *
     * TODO(rginda): Add opt_onAck.
     *
     * @param {*} value The value to send.
     * @return {void}
     */
    ExecuteContext.prototype.stdin = function(value) {
      this.assertReady();
      if (this.callee) {
        this.callee.stdin(value);
      } else {
        this.onStdIn.fire(value);
      }
    };
  }
);

//# sourceMappingURL=execute_context.js.map
// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/base/file_system",
  ["axiom/core/error", "axiom/core/ephemeral", "axiom/fs/base/open_context", "axiom/fs/path", "axiom/fs/seek_whence", "axiom/fs/data_type", "exports"],
  function(
    axiom$core$error$$,
    axiom$core$ephemeral$$,
    axiom$fs$base$open_context$$,
    axiom$fs$path$$,
    axiom$fs$seek_whence$$,
    axiom$fs$data_type$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Ephemeral;
    Ephemeral = axiom$core$ephemeral$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var SeekWhence;
    SeekWhence = axiom$fs$seek_whence$$["default"];
    var DataType;
    DataType = axiom$fs$data_type$$["default"];

    /** @typedef {ExecuteContext$$module$axiom$fs$base$execute_context} */
    var ExecuteContext;

    /** @typedef {OpenMode$$module$axiom$fs$open_mode} */
    var OpenMode;

    /** @typedef {ReadResult$$module$axiom$fs$read_result} */
    var ReadResult;

    /** @typedef {WriteResult$$module$axiom$fs$write_result} */
    var WriteResult;

    /** @typedef {StatResult$$module$axiom$fs$stat_result} */
    var StatResult;

    var abstract = function() { throw new AxiomError.AbstractCall() };

    var FileSystem = function() {
      Ephemeral.call(this);
    };

    __es6_export__("FileSystem", FileSystem);
    __es6_export__("default", FileSystem);

    FileSystem.prototype = Object.create(Ephemeral.prototype);

    /**
     * Create an alias from a path on this file system to a different path on this
     * file system.
     *
     * If the "from" path is on a different fs, we'll forward the call.  If "from"
     * is on this fs but "to" is not, the move will fail.
     *
     * The destination path must refer to a file that does not yet exist, inside a
     * directory that does.
     *
     * @param {Path} pathFrom
     * @param {Path} pathTo
     * @return {!Promise<undefined>}
     */
    FileSystem.prototype.alias = function(pathFrom, pathTo) {
      abstract();
    };

    /**
     * @param {Path} path
     * @param {*} arg
     * @return {!Promise<!ExecuteContext>}
     */
    FileSystem.prototype.createExecuteContext = function(path, arg) {
      abstract();
    };

    /**
     * @param {Path} path
     * @param {string|OpenMode} mode
     * @return {!Promise<!OpenContext>}
     */
    FileSystem.prototype.createOpenContext = function(path, mode) {
      abstract();
    };

    /**
     * @param {Path} path
     * @return {!Promise<!Object<string, StatResult>>}
     */
    FileSystem.prototype.list = function(path) {
      abstract();
    };

    /**
     * @param {Path} path
     * @return {!Promise<undefined>}
     */
    FileSystem.prototype.mkdir = function(path) {
      abstract();
    };

    /**
     * Move an entry from a path on a file system to a different path on the
     * same file system.
     *
     * The destination path must refer to a file that does not yet exist, inside a
     * directory that does.
     *
     * @param {Path} fromPath
     * @param {Path} toPath
     * @return {!Promise<undefined>}
     */
    FileSystem.prototype.move = function(fromPath, toPath) {
      abstract();
    };

    /**
     * @param {Path} path
     * @return {!Promise<!StatResult>}
     */
    FileSystem.prototype.stat = function(path) {
      abstract();
    };

    /**
     * Remove the given path.
     *
     * @param {Path} path
     * @return {Promise}
     */
    FileSystem.prototype.unlink = function(path) {
      abstract();
    };

    /**
     * Read the entire contents of a file.
     *
     * This is a utility method that creates an OpenContext, uses the read
     * method to read in the entire file (by default) and then discards the
     * open context.
     *
     * By default this will return the data in the dataType preferred by the
     * file. You can request a specific dataType by including it in readArg.
     *
     * @param {Path} path The path to read from.
     * @param {DataType=} opt_dataType
     * @param {(string|OpenMode)=} opt_openMode
     * @param {number=} opt_offset
     * @param {SeekWhence=} opt_whence
     * @return {!Promise<!ReadResult>}
     */
    FileSystem.prototype.readFile = function(
        path, opt_dataType, opt_openMode, opt_offset, opt_whence) {
      var openMode = opt_openMode || 'r';
      var dataType = opt_dataType || null;
      var offset = opt_offset || 0;
      var whence = opt_whence || SeekWhence.Begin;

      return this.createOpenContext(path, openMode).then(
          function(cx) {
            return cx.read(offset, whence, dataType).then(
                function(readResult) {
                  return cx.closeOk(readResult);
                });
          });
    };

    /**
     * Write the entire contents of a file.
     *
     * This is a utility method that creates an OpenContext, uses the write
     * method to write the entire file (by default) and then discards the
     * open context.
     *
     * @param {Path} path The path to write to.
     * @param {DataType=} opt_dataType
     * @param {*} data
     * @param {(string|OpenMode)=} opt_openMode
     * @param {number=} opt_offset
     * @param {SeekWhence=} opt_whence
     * @return {!Promise<!WriteResult>}
     */
    FileSystem.prototype.writeFile = function(
        path, dataType, data, opt_openMode, opt_offset, opt_whence) {
      var openMode = opt_openMode || 'wtc';
      var offset = opt_offset || 0;
      var whence = opt_whence || SeekWhence.Begin;

      return this.createOpenContext(path, openMode).then(
          function(cx) {
            return cx.write(offset, whence, dataType, data).then(
                function(writeResult) {
                  return cx.closeOk(writeResult);
                });
          });
    };
  }
);

//# sourceMappingURL=file_system.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/base/open_context",
  ["axiom/core/completer", "axiom/core/ephemeral", "axiom/core/error", "axiom/core/event", "axiom/fs/open_mode", "axiom/fs/path", "axiom/fs/read_result", "axiom/fs/write_result", "exports"],
  function(
    axiom$core$completer$$,
    axiom$core$ephemeral$$,
    axiom$core$error$$,
    axiom$core$event$$,
    axiom$fs$open_mode$$,
    axiom$fs$path$$,
    axiom$fs$read_result$$,
    axiom$fs$write_result$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var Completer;
    Completer = axiom$core$completer$$["default"];
    var Ephemeral;
    Ephemeral = axiom$core$ephemeral$$["default"];
    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var AxiomEvent;
    AxiomEvent = axiom$core$event$$["default"];
    var OpenMode;
    OpenMode = axiom$fs$open_mode$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var ReadResult;
    ReadResult = axiom$fs$read_result$$["default"];
    var WriteResult;
    WriteResult = axiom$fs$write_result$$["default"];

    /** @typedef {DataType$$module$axiom$fs$data_type} */
    var DataType;

    /** @typedef {FileSystem$$module$axiom$fs$base$file_system} */
    var FileSystem;

    /** @typedef {SeekWhence$$module$axiom$fs$seek_whence} */
    var SeekWhence;

    var OpenContext = function(fileSystem, path, mode) {
      Ephemeral.call(this);

      /** @type {FileSystem} */
      this.fileSystem = fileSystem;

      /** @type {Path} */
      this.path = path;

      if (typeof mode == 'string')
        mode = OpenMode.fromString(mode);

      /** @type {OpenMode} */
      this.mode = mode;

      // If the parent file system is closed, we close too.
      this.dependsOn(this.fileSystem);

      /**
       * @private @type {Completer}
       */
      this.openCompleter_ = null;
    };

    __es6_export__("OpenContext", OpenContext);
    __es6_export__("default", OpenContext);

    OpenContext.prototype = Object.create(Ephemeral.prototype);

    /**
     * Initiate the open.
     *
     * Returns a promise that completes when the open is no longer valid.
     *
     * @return {!Promise<undefined>}
     */
    OpenContext.prototype.open = function() {
      this.assertEphemeral('Wait');
      return this.ephemeralPromise;
    };

    /**
     * @param {number} offset
     * @param {SeekWhence} whence
     * @return {!Promise<undefined>}
     */
    OpenContext.prototype.seek = function(offset, whence) {
      return Promise.resolve();
    };

    /**
     * @param {number} offset
     * @param {SeekWhence} whence
     * @param {?DataType} dataType
     * @return {!Promise<!ReadResult>}
     */
    OpenContext.prototype.read = function(offset, whence, dataType) {
      if (!this.mode.read)
        return Promise.reject(new AxiomError.Invalid('mode.read', this.mode.read));

      return Promise.resolve(new ReadResult(offset, whence, dataType));
    };

    /**
     * @param {number} offset
     * @param {SeekWhence} whence
     * @param {?DataType} dataType
     * @param {*} data
     * @return {!Promise<!WriteResult>}
     */
    OpenContext.prototype.write = function(offset, whence, dataType, data) {
      if (!this.mode.write) {
        return Promise.reject(new AxiomError.Invalid('mode.write',
                                                     this.mode.write));
      }

      return Promise.resolve(new WriteResult(offset, whence, dataType));
    };
  }
);

//# sourceMappingURL=open_context.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @enum {string}
 *
 * List of acceptable values for the 'dataType' parameter used in stat and read
 * operations.
 */
define("axiom/fs/data_type", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var DataType = {
   /**
    * When a dataType of 'arraybuffer' is used on read and write requests, the
    * data is expected to be an ArrayBuffer instance.
    *
    * NOTE(rginda): ArrayBuffer objects don't work over chrome.runtime ports,
    * due to http://crbug.com/374454.
    */
   ArrayBuffer: 'arraybuffer',

   /**
    * When used in read and write requests, the data will be a base64 encoded
    * string.  Note that decoding this value to a UTF8 string may result in
    * invalid UTF8 sequences or data corruption.
    */
   Base64String: 'base64-string',

   /**
    * In stat results, a dataType of 'blob' means that the file contains a set
    * of random access bytes.
    *
    * When a dataType of 'blob' is used on a read request, the data is expected
    * to be an instance of an opened Blob object.
    *
    * NOTE(rginda): Blobs can't cross origin over chrome.runtime ports.
    * Need to test over HTML5 MessageChannels.
    */
   'Blob': 'blob',

   /**
    * Not used in stat results.
    *
    * When used in read and write requests, the data will be a UTF-8
    * string.  Note that if the underlying file contains sequences that cannot
    * be encoded in UTF-8, the result may contain invalid sequences or may
    * not match the actual contents of the file.
    */
   UTF8String: 'utf8-string',

   /**
    * In stat results, a dataType of 'value' means that the file contains a
    * single value which can be of any type.
    *
    * When an dataType of 'value' is used on a read request, the results of
    * the read will be the native type stored in the file.  If the file
    * natively stores a blob, the result will be a string.
    */
   Value: 'value'
 };

 __es6_export__("DataType", DataType);
 __es6_export__("default", DataType);
});

//# sourceMappingURL=data_type.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/dom/domfs_util",
  ["axiom/fs/path", "axiom/core/error", "exports"],
  function(axiom$fs$path$$, axiom$core$error$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var Path;
    Path = axiom$fs$path$$["default"];
    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var domfsUtil = {};
    __es6_export__("domfsUtil", domfsUtil);
    __es6_export__("default", domfsUtil);

    /**
     * Get an appropriate 'stat' value for the given HTML5 FileEntry or
     * DirEntry object.
     */
    domfsUtil.statEntry = function(entry) {
      return new Promise(function(resolve, reject) {
         var onMetadata = function(entry, metadata) {
           if (entry.isFile) {
             resolve({
               dataType: 'blob',
               mode: Path.Mode.R | Path.Mode.W | Path.Mode.K,
               mtime: new Date(metadata.modificationTime).getTime(),
               size: metadata.size
             });
           } else {
             resolve({
               mode: Path.Mode.R | Path.Mode.D,
               mtime: new Date(metadata.modificationTime).getTime(),
             });
           }
         };

         if ('getMetadata' in entry) {
           entry.getMetadata(onMetadata.bind(null, entry), reject);
         } else {
           reject(new AxiomError.Runtime('entry has no getMetadata'));
         }
       });
     };

    /**
     * List all FileEntrys in a given HTML5 directory.
     *
     * @param {DirectoryEntry} root The directory to consider as the root of the
     *     path.
     * @param {string} path The path of the target directory, relative to root.
     * @return {Promise<Object>}
     */
    domfsUtil.listDirectory = function(root, path) {
      return new Promise(function(resolve, reject) {
        var entries = {};
        var promises = [];
        var rv = {};

        var onFileError = domfsUtil.rejectFileError.bind(null, path, reject);
        var onDirectoryFound = function(dirEntry) {
          var reader = dirEntry.createReader();
          reader.readEntries(function(results) {
            for (var i = 0; i < results.length; i++) {
              var promise = domfsUtil.statEntry(results[i]);
              promises.push(promise.then(function(i, statResult) {
                rv[results[i].name] = statResult;
              }.bind(null, i)));
            }

            Promise.all(promises).then(function() {
              resolve(rv);
            });
          }, onFileError);
        };
        root.getDirectory(path, {create: false}, onDirectoryFound, onFileError);
      });
    };

    domfsUtil.getFileOrDirectory = function(root, pathSpec) {
      return new Promise(function(resolve, reject) {
        var onFileFound = function(r) {
          resolve(r);
        };

        var onError = function() {
           var onFileError = domfsUtil.rejectFileError.bind(null, pathSpec, reject);
           root.getDirectory(pathSpec, {create: false}, onFileFound, onFileError);
        };

        root.getFile(pathSpec, {create: false}, onFileFound, onError);
      });
    };

    /**
     * Removes all files and sub directories for a given path.
     */
    domfsUtil.remove = function(root, path) {
      return new Promise(function(resolve, reject) {
        return domfsUtil.getFileOrDirectory(root, path).then(function(r) {
          if (r.isDirectory === false) {
            r.remove(resolve, reject);
          } else {
            r.removeRecursively(resolve, reject);
          }
        }).catch(function(e) {
          reject(e);
        });
      });
    };

    /**
     * Create a directory with a given name under root.
     */
    domfsUtil.mkdir = function(root, name) {
      return new Promise(function(resolve, reject) {
        var onError = domfsUtil.rejectFileError.bind(null, name, reject);
        root.getDirectory(name, {create: true, exclusive: true}, resolve, onError);
      });
    };

    /**
     * Convenience method to convert a FileError to a promise rejection with an
     * Axiom error.
     *
     * Used in the context of a FileEntry.
     */
    domfsUtil.convertFileError = function(pathSpec, error) {
      if (error.name == 'TypeMismatchError')
        return new AxiomError.TypeMismatch('entry-type', pathSpec);

      if (error.name == 'NotFoundError')
        return new AxiomError.NotFound('path', pathSpec);

      if (error.name == 'PathExistsError')
        return new AxiomError.Duplicate('path', pathSpec);

      return new AxiomError.Runtime(pathSpec + ':' + error.toString());
    };

    domfsUtil.rejectFileError = function(pathSpec, reject, error) {
      reject(domfsUtil.convertFileError(pathSpec, error));
    };
  }
);

//# sourceMappingURL=domfs_util.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/dom/execute_context",
  ["axiom/core/error", "axiom/fs/base/execute_context", "axiom/fs/path", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$path$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    /** @typedef DomFileSystem$$module$axiom$fs$dom$file_system */
    var DomFileSystem;

    var DomExecuteContext = function(domfs, path, arg) {
      this.domfs = domfs;
      this.path = path;
      this.arg = arg;
    };

    __es6_export__("DomExecuteContext", DomExecuteContext);
    __es6_export__("default", DomExecuteContext);

    DomExecuteContext.prototype.execute_ = function() {
      return Promise.reject(new AxiomError(
          'NotImplemented', 'DOM filesystem is not executable.'));
    };
  }
);

//# sourceMappingURL=execute_context.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/dom/file_system",
  ["axiom/core/error", "axiom/fs/path", "axiom/fs/base/execute_context", "axiom/fs/base/file_system", "axiom/fs/js/directory", "axiom/fs/dom/execute_context", "axiom/fs/dom/open_context", "axiom/fs/js/resolve_result", "axiom/fs/dom/domfs_util", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$path$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$base$file_system$$,
    axiom$fs$js$directory$$,
    axiom$fs$dom$execute_context$$,
    axiom$fs$dom$open_context$$,
    axiom$fs$js$resolve_result$$,
    axiom$fs$dom$domfs_util$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var FileSystem;
    FileSystem = axiom$fs$base$file_system$$["default"];
    var JsDirectory;
    JsDirectory = axiom$fs$js$directory$$["default"];
    var DomExecuteContext;
    DomExecuteContext = axiom$fs$dom$execute_context$$["default"];
    var DomOpenContext;
    DomOpenContext = axiom$fs$dom$open_context$$["default"];
    var JsResolveResult;
    JsResolveResult = axiom$fs$js$resolve_result$$["default"];
    var domfsUtil;
    domfsUtil = axiom$fs$dom$domfs_util$$["default"];

    /** @typedef OpenContext$$module$axiom$fs$base$open_context */
    var OpenContext;

    /** @typedef OpenMode$$module$axiom$fs$open_mode */
    var OpenMode;

    /** @typedef StatResult$$module$axiom$fs$stat_result */
    var StatResult;

    var DomFileSystem = function(fileSystem) {
      this.fileSystem = fileSystem;

      FileSystem.call(this);
    };

    __es6_export__("DomFileSystem", DomFileSystem);
    __es6_export__("default", DomFileSystem);

    DomFileSystem.prototype = Object.create(FileSystem.prototype);

    DomFileSystem.available = function() {
      return !!(window.requestFileSystem || window.webkitRequestFileSystem);
    }

    /**
     * Mounts a given type if dom filesystem at /jsDir/mountName
     *
     * @param {string} type temporary or permanent dom filesystem.
     * @param {string} mountName
     * @param {JsDirectory} jsDir
     * @return {Promise<DomFileSystem>}
     */
    DomFileSystem.mount = function(type, mountName, jsDir) {
      return new Promise(function(resolve, reject) {
        if (!window.requestFileSystem && !window.webkitRequestFileSystem) {
          return resolve(null);
        }
        var requestFs = (window.requestFileSystem ||
                         window.webkitRequestFileSystem).bind(window);

        // This is currently ignored.
        var capacity = 1024 * 1024 * 1024;

        var onFileSystemFound = function(fs) {
          var domfs = new DomFileSystem(fs);
          jsDir.mount(mountName, domfs);
          resolve(domfs);
        };

        var onFileSystemError = function(e) {
          reject(new AxiomError.Runtime(e));
        };

        if (type == 'temporary') {
          var temporaryStorage = navigator['webkitTemporaryStorage'];
          temporaryStorage.requestQuota(capacity, function(bytes) {
              requestFs(window.TEMPORARY, bytes,
                        onFileSystemFound, onFileSystemError);
            }, onFileSystemError);
        } else {
          var persistentStorage = navigator['webkitPersistentStorage'];
          persistentStorage.requestQuota(capacity, function(bytes) {
            requestFs(window.PERSISTENT, bytes,
                        onFileSystemFound, onFileSystemError);
            }, onFileSystemError);
        }
      });
    };

    /**
     * This method is not directly reachable through the FileSystemBinding.
     *
     * @param {Path} path
     * @return {Promise<JsResolveResult>}
     */
    DomFileSystem.prototype.resolve = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      //TODO(grv): resolve directories and read mode bits.
      var domfs = this.fileSystem;
      return new Promise(function(resolve, reject) {
        domfs.root.getFile(path.spec, {create: true}, resolve, reject);
      });
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!StatResult>}
     */
    DomFileSystem.prototype.stat = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      return domfsUtil.getFileOrDirectory(this.fileSystem.root, path.spec).then(
          function(r) {
        return domfsUtil.statEntry(r);
      });
    };

    /**
     * This version of mkdir_ is attached to the FileSystemBinding to ensure that
     * the DomDirectory returned by `mkdir` doesn't leak through the binding.
     *
     * @param {Path} path
     * @return {Promise}
     */
    DomFileSystem.prototype.mkdir_ = function(path) {
      return this.mkdir(path).then(function() {
        return null;
      });
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<undefined>}
     */
    DomFileSystem.prototype.mkdir = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      return new Promise(function(resolve, reject) {
        var parentPath = path.getParentPath();
        var targetName = path.getBaseName();

        var onDirectoryFound = function(dir) {
          return domfsUtil.mkdir(dir, targetName).then(function(r) {
            resolve(r);
          }).catch (function(e) {
            reject(e);
          });
        };

        var onFileError = domfsUtil.rejectFileError.bind(null, path.spec, reject);

        var parentPathSpec = parentPath.spec;

        //TODO(grv): This should be taken care by Path class.
        if (parentPathSpec === '' || parentPathSpec == null) {
          parentPathSpec = '/';
        }

        this.fileSystem.root.getDirectory(parentPath.spec, {create: false},
            onDirectoryFound, onFileError);
      }.bind(this));
    };

    /**
     * Create an alias from a path on this file system to a different path on this
     * file system.
     *
     * If the "from" path is on a different fs, we'll forward the call.  If "from"
     * is on this fs but "to" is not, the move will fail.
     *
     * The destination path must refer to a file that does not yet exist, inside a
     * directory that does.
     *
     * @override
     * @param {Path} pathFrom
     * @param {Path} pathTo
     * @return {!Promise<undefined>}
     */
    DomFileSystem.prototype.alias = function(pathFrom, pathTo) {
      return Promise.reject(new AxiomError.NotImplemented('To be implemented.'));
    };

    /**
     * Move an entry from a path on this file system to a different path on this
     * file system.
     *
     * If the "from" path is on a different fs, we'll forward the call.  If "from"
     * is on this fs but "to" is not, the move will fail.
     *
     * The destination path must refer to a file that does not yet exist, inside a
     * directory that does.
     *
     * @override
     * @param {Path} fromPath
     * @param {Path} toPath
     * @return {!Promise<undefined>}
     */
    DomFileSystem.prototype.move = function(fromPath, toPath) {
      return Promise.reject(new AxiomError.NotImplemented('To be implemented.'));
    };

    /**
     * @override
     * @param {Path} path
     * @return {Promise}
     */
    DomFileSystem.prototype.unlink = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      return new Promise(function(resolve, reject) {
        var parentPath = path.getParentPath();
        var targetName = path.getBaseName();

        var onDirectoryFound = function(dir) {
          return domfsUtil.remove(dir, targetName).then(function(r) {
            resolve(r);
          }).catch (function(e) {
            reject(e);
          });
        };

        var onFileError = domfsUtil.rejectFileError.bind(null, path.spec, reject);

        var parentPathSpec = parentPath.spec;

        //TODO(grv): This should be taken care by Path class.
        if (parentPathSpec === '' || parentPathSpec == null) {
          parentPathSpec = '/';
        }

        this.fileSystem.root.getDirectory(parentPathSpec, {create: false},
            onDirectoryFound, onFileError);
      }.bind(this));
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!Object<string, StatResult>>}
     */
    DomFileSystem.prototype.list = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      return domfsUtil.listDirectory(this.fileSystem.root, path.spec).then(
        function(entries) {
          return Promise.resolve(entries);
        });
    };

    /**
     * @override
     * @param {Path} path
     * @param {*} arg
     * @return {!Promise<!ExecuteContext>}
     */
    DomFileSystem.prototype.createExecuteContext = function(path, arg) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      /** @type {!ExecuteContext} */
      var cx = new DomExecuteContext(this, path, arg);
      return Promise.resolve(cx);
    };

    /**
     * @override
     * @param {Path} path
     * @param {string|OpenMode} mode
     * @return {!Promise<!OpenContext>}
     */
    DomFileSystem.prototype.createOpenContext = function(path, mode) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      /** @type {!OpenContext} */
      var cx = new DomOpenContext(this, path, mode);
      return Promise.resolve(cx);
    };
  }
);

//# sourceMappingURL=file_system.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/dom/open_context",
  ["axiom/core/error", "axiom/fs/base/open_context", "axiom/fs/dom/domfs_util", "axiom/fs/path", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$base$open_context$$,
    axiom$fs$dom$domfs_util$$,
    axiom$fs$path$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var domfsUtil;
    domfsUtil = axiom$fs$dom$domfs_util$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    /** @typedef DomFileSystem$$module$axiom$fs$dom$file_system */
    var DomFileSystem;

    /** @typedef OpenMode$$module$axiom$fs$open_mode */
    var OpenMode;

    var DomOpenContext = function(domfs, path, arg) {
      this.domfs = domfs;
      this.path = path;
      this.arg = arg;

      this.onFileError_ = domfsUtil.rejectFileError.bind(null, path.spec);

      // The current read/write position.
      this.position_ = 0;

      // The DOM FileEntry we're operation on.
      this.entry_ = null;

      // THe DOM file we're operating on.
      this.file_ = null;

    };

    __es6_export__("DomOpenContext", DomOpenContext);
    __es6_export__("default", DomOpenContext);

    /**
     * If the arg object does not have a 'whence' property, this call succeeds
     * with no side effects.
     *
     * @param {Object} arg An object containing 'whence' and 'offset' arguments
     *  describing the seek operation.
     */
    DomOpenContext.prototype.seek_ = function(arg) {
      var fileSize = this.file_.size;
      var start = this.position_;

      if (!arg['whence'])
        return Promise.resolve(true);

      if (arg['whence'] == 'begin') {
        start = arg['offset'];

      } else if (arg['whence'] == 'current') {
        start += arg['offset'];

      } else if (arg['whence'] == 'end') {
        start = fileSize + arg['offset'];
      }

      if (start > fileSize) {
        //onError(wam.mkerr('wam.FileSystem.Error.EndOfFile', []));
        return Promise.reject(new AxiomError.Runtime('reached end of file.'));
      }

      if (start < 0) {
        return Promise.reject(new AxiomError.Runtime(
            'Invalid file offset: ' + this.path.spec));
      }

      this.position_ = start;
      return Promise.resolve({position: this.position_});
    };

    DomOpenContext.prototype.open_ = function() {
      var mode = this.arg;
      return new Promise(function(resolve, reject) {
        var onFileError = this.onFileError_.bind(null, reject);
        var onStat = function(stat) {
          this.entry_.file(function(f) {
              this.file_ = f;
              resolve();
          }.bind(this), onFileError);
        }.bind(this);

        var onFileFound = function(entry) {
          this.entry_ = entry;
          if (mode.write && mode.truncate) {
            this.entry_.createWriter(
                function(writer) {
                  writer.truncate(0);
                  domfsUtil.statEntry(entry).then(onStat).catch(onFileError);
                },
                reject);
            return;
          }

          domfsUtil.statEntry(entry).then(function(value) {
            onStat(value);
          }).catch(function(e) {
            reject(e);
          });
        }.bind(this);

        this.domfs.fileSystem.root.getFile(
            this.path.spec,
            {create: mode.create,
             exclusive: mode.exclusive
            },
            onFileFound, onFileError);
      }.bind(this));
    };

    /**
     * Handle a read event.
     */
    DomOpenContext.prototype.read_ = function(arg) {
      if (!arg) {
        arg = {
           dataType: 'utf8-string',
           count: 0
        };
      }
      return new Promise(function(resolve, reject) {
        this.seek_(arg).then(function(rv) {
          if (!rv) {
            return reject();
          }

          var fileSize = this.file_.size;
          var end;
          if (arg.count) {
            end = this.position_ + arg.count;
          } else {
            end = fileSize;
          }

          var dataType = arg.dataType || 'utf8-string';
          var reader = new FileReader();

          reader.onload = function(e) {
            this.position_ = end + 1;
            var data = reader.result;

            if (dataType == 'base64-string' && typeof data == 'string') {
              // TODO: By the time we read this into a string the data may already
              // have been munged.  We need an ArrayBuffer->Base64 string
              // implementation to make this work for real.
              data = window.btoa(data);
            }
            resolve({dataType: dataType, data: data});
          }.bind(this);

          reader.onerror = function(error) {
            return this.onFileError_(reject, error);
          };

          var slice = this.file_.slice(this.position_, end);
          if (dataType == 'blob') {
            resolve({dataType: dataType, data: slice});
          }  else if (dataType == 'arraybuffer') {
            reader.readAsArrayBuffer(slice);
          } else {
            reader.readAsText(slice);
          }
        }.bind(this));
      }.bind(this));
    };

    /**
     * Handle a write event.
     */
    DomOpenContext.prototype.write_ = function(arg) {
      if (!arg) {
        return Promise.reject(new AxiomError.Missing('arg'));
      }
      var dataType = arg.dataType || 'utf8-string';
      return new Promise(function(resolve, reject) {
        var onWriterReady = function(writer) {
          var blob;
          if (arg.data instanceof Blob) {
            blob = arg.data;
          } else if (arg.data instanceof ArrayBuffer) {
            blob = new Blob([arg.data], {type: 'application/octet-stream'});
          } else if (dataType == 'base64-string' && typeof arg.data == 'string') {
            // TODO: Once we turn this into a string the data may already have
            // been munged.  We need an ArrayBuffer->Base64 string implementation to
            // make this work for real.
            blob = new Blob([window.atob(arg.data)],
                            {type: 'application/octet-stream'});
          } else if (dataType == 'utf8-string') {
            blob = new Blob([arg.data],  {type: 'text/plain'});
          } else if (dataType == 'value') {
            blob = new Blob([JSON.stringify(arg.data)],  {type: 'text/json'});
          }

          writer.onerror = function(error) {
            return this.onFileError_(reject, error);
          }.bind(this);

          writer.onwrite = function() {
            this.position_ = this.position_ + blob.size;
            resolve(null);
          }.bind(this);

          writer.seek(this.position_);
          writer.write(blob);
        }.bind(this);

        this.seek_(arg).then(function(rv) {
          if (!rv) {
            return reject();
          }
          this.entry_.createWriter(
              onWriterReady,
              this.onFileError_.bind(null, reject));
        }.bind(this));
      }.bind(this));
    };
  }
);

//# sourceMappingURL=open_context.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/js/directory",
  ["axiom/core/error", "axiom/fs/path", "axiom/fs/base/file_system", "axiom/fs/js/entry", "axiom/fs/js/executable", "axiom/fs/js/resolve_result", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$path$$,
    axiom$fs$base$file_system$$,
    axiom$fs$js$entry$$,
    axiom$fs$js$executable$$,
    axiom$fs$js$resolve_result$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var FileSystem;
    FileSystem = axiom$fs$base$file_system$$["default"];
    var JsEntry;
    JsEntry = axiom$fs$js$entry$$["default"];
    var JsExecutable;
    JsExecutable = axiom$fs$js$executable$$["default"];
    var JsResolveResult;
    JsResolveResult = axiom$fs$js$resolve_result$$["default"];

    /** @typedef StatResult$$module$axiom$fs$stat_result */
    var StatResult;

    /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
    var JsExecuteContext;

    /** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
    var JsFileSystem;

    var JsDirectory = function(jsfs) {
      JsEntry.call(this, jsfs, 'D');

      /** @type {Object<string, (JsEntry|FileSystem)>} */
      this.entries_ = {};
    };

    __es6_export__("JsDirectory", JsDirectory);
    __es6_export__("default", JsDirectory);

    JsDirectory.prototype = Object.create(JsEntry.prototype);

    /**
     * Resolve a Path object as far as possible.
     *
     * This may return a partial result which represents the depth to which
     * the path can be resolved.
     *
     * @param {Path} path An object representing the path to resolve.
     * @param {number=} opt_index The optional index into the path elements where
     *   we should start resolving.  Defaults to 0, the first path element.
     * @return {!JsResolveResult}
     */
    JsDirectory.prototype.resolve = function(path, opt_index) {
      var index = opt_index || 0;

      if (!this.entryExists(path.elements[index])) {
        return new JsResolveResult(
            path.elements.slice(0, index - 1),
            path.elements.slice(index - 1),
            this);
      }

      var entry = this.entries_[path.elements[index]] || null;

      if (index == path.elements.length - 1)
        return new JsResolveResult(path.elements, null, entry);

      if (entry instanceof JsDirectory)
        return entry.resolve(path, index + 1);

      return new JsResolveResult(path.elements.slice(0, index + 1),
                                 path.elements.slice(index + 1),
                                 entry);
    };

    /**
     * Return true if the named entry exists in this directory.
     *
     * @param {string} name
     * @return {!boolean}
     */
    JsDirectory.prototype.entryExists = function(name) {
      return this.entries_.hasOwnProperty(name);
    };

    /**
     * Link the given entry into this directory.
     *
     * This method is not directly reachable through the FileSystem.
     *
     * @param {string} name  A name to give the entry.
     * @param {JsEntry} entry
     * @return {void}
     */
    JsDirectory.prototype.link = function(name, entry) {
      if (!(entry instanceof JsEntry))
        throw new AxiomError.TypeMismatch('instanceof JsEntry', entry);

      if (this.entries_.hasOwnProperty(name))
        throw new AxiomError.Duplicate('directory-name', name);

      this.entries_[name] = entry;
    };

    /**
     * Link the given FileSystem into this directory.
     *
     * This method is not directly reachable through the FileSystem.
     *
     * @param {string} name  A name to give the file system.
     * @param {FileSystem} fileSystem
     * @return {void}
     */
    JsDirectory.prototype.mount = function(name, fileSystem) {
      if (!(fileSystem instanceof FileSystem)) {
        throw new AxiomError.TypeMismatch('instanceof FileSystem',
                                          fileSystem);
      }

      if (this.entries_.hasOwnProperty(name))
        throw new AxiomError.Duplicate('directory-name', name);

      this.entries_[name] = fileSystem;
    };

    /**
     * @param {Object<string, function(JsExecuteContext)>} executables
     * @return {void}
     */
    JsDirectory.prototype.install = function(executables) {
      for (var name in executables) {
        var callback = executables[name];
        var sigil;
        var ary = /([^\(]*)\(([^\)]?)\)$/.exec(name);
        if (ary) {
          name = ary[1];
          sigil = ary[2];
          if (sigil && '$@%*'.indexOf(sigil) == -1)
            throw new AxiomError.Invalid('sigil', sigil);
        } else {
          sigil = callback['argSigil'] || '*';
        }

        this.link(name, new JsExecutable(this.jsfs, callback, sigil));
      }
    };

    /**
     * Make a new, empty directory with the given name.
     *
     * @param {string} name
     * @return {!Promise<!JsDirectory>}
     */
    JsDirectory.prototype.mkdir = function(name) {
      if (this.entryExists(name))
        return Promise.reject(new AxiomError.Duplicate('directory-name', name));

      var dir = new JsDirectory(this.jsfs);
      this.entries_[name] = dir;
      return Promise.resolve(dir);
    };

    /**
     * Remove the entry with the given name.
     *
     * @param {string} name
     * @return {!Promise}
     */
    JsDirectory.prototype.unlink = function(name) {
      if (!this.entryExists(name))
        return Promise.reject(new AxiomError.NotFound('name', name));

      delete this.entries_[name];
      return Promise.resolve();
    };

    /**
     * Return the stat() result for each item in this directory.
     *
     * @return {!Promise<!Object<string, StatResult>>}
     */
    JsDirectory.prototype.list = function() {
      var rv = {};
      var promises = [];

      for (var name in this.entries_) {
        var entry = this.entries_[name];
        var promise;

        if (entry instanceof FileSystem) {
          promise = entry.stat(new Path('/'));
        } else {
          promise = entry.stat();
        }

        promises.push(promise.then(function(name, statResult) {
          rv[name] = statResult;
        }.bind(null, name)));
      }

      return Promise.all(promises).then(function() {
        return rv;
      });
    };
  }
);

//# sourceMappingURL=directory.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
 "axiom/fs/js/entry",
 ["axiom/fs/path", "axiom/fs/stat_result", "exports"],
 function(axiom$fs$path$$, axiom$fs$stat_result$$, __exports__) {
  "use strict";

  function __es6_export__(name, value) {
   __exports__[name] = value;
  }

  var Path;
  Path = axiom$fs$path$$["default"];
  var StatResult;
  StatResult = axiom$fs$stat_result$$["default"];

  /** @typedef {JsFileSystem$$module$axiom$fs$js$file_system} */
  var JsFileSystem;

  /**
   * @constructor
   *
   * The base class for all of the things that can appear in a JsFileSystem.
   *
   * @param {JsFileSystem} jsfs  The parent file system.
   * @param {string} modeStr
   */
  var JsEntry = function(jsfs, modeStr) {
    this.jsfs = jsfs;
    this.mode = Path.modeStringToInt(modeStr);
  };

  __es6_export__("JsEntry", JsEntry);
  __es6_export__("default", JsEntry);

  /**
   * Return true if file has all of the modes in the given modeString.
   *
   * @param {string} modeStr
   */
  JsEntry.prototype.hasMode = function(modeStr) {
    return (this.mode & Path.modeStringToInt(modeStr));
  };

  /**
   * Default stat implementation.
   *
   * Overridden stat() implementations should call this first and decorate the
   * result with additional properties.
   *
   * @return {!Promise<!StatResult>}
   */
  JsEntry.prototype.stat = function() {
    return Promise.resolve(new StatResult(this.mode));
  };
 }
);

//# sourceMappingURL=entry.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/js/executable",
  ["axiom/core/error", "axiom/fs/js/entry", "exports"],
  function(axiom$core$error$$, axiom$fs$js$entry$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var JsEntry;
    JsEntry = axiom$fs$js$entry$$["default"];

    /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
    var JsExecuteContext;

    /** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
    var JsFileSystem;

    var JsExecutable = function(jsfs, callback, argSigil) {
      JsEntry.call(this, jsfs, 'X');

      if (typeof callback != 'function')
        throw new AxiomError.TypeMismatch('function', callback);

      this.callback_ = callback;
      this.argSigil_ = argSigil;
    };

    __es6_export__("JsExecutable", JsExecutable);
    __es6_export__("default", JsExecutable);

    JsExecutable.prototype = Object.create(JsEntry.prototype);

    /**
     * @override
     */
    JsExecutable.prototype.stat = function() {
      return JsEntry.prototype.stat.call(this).then(
          function(rv) {
            rv['argSigil'] = this.argSigil_;
            return Promise.resolve(rv);
          }.bind(this));
    };

    /**
     * @param {JsExecuteContext} cx
     * @return {Promise<*>}
     */
    JsExecutable.prototype.execute = function(cx) {
      var arg = cx.arg;

      if ((this.argSigil_ == '$' && arg instanceof Object) ||
          (this.argSigil_ == '@' && !(arg instanceof Array)) ||
          (this.argSigil_ == '%' && (!(arg instanceof Object) ||
                                     (arg instanceof Array)))) {
        return cx.closeError(new AxiomError.TypeMismatch(this.argSigil_, arg));
      }

      /** @type {Promise<*>} */
      var p;

      try {
        p = this.callback_(cx);
      } catch (ex) {
        console.log(ex);
        p = Promise.reject(ex);
      }

      if (!(p instanceof Promise)) {
        console.log(this.callback_);
        return cx.closeError(
            new AxiomError.Runtime('Executable did not return a Promise.'));
      }

      return p.then(
        function(value) {
          if (cx.isEphemeral('Ready'))
            cx.closeOk(value);

          return cx.ephemeralPromise;
        }
      ).catch(
        function(value) {
          if (cx.isEphemeral('Ready'))
            cx.closeError(value);

          return cx.ephemeralPromise;
        }
      );
    };
  }
);

//# sourceMappingURL=executable.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/js/execute_context",
  ["axiom/fs/base/execute_context", "axiom/fs/path", "axiom/fs/js/executable", "exports"],
  function(
    axiom$fs$base$execute_context$$,
    axiom$fs$path$$,
    axiom$fs$js$executable$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var JsExecutable;
    JsExecutable = axiom$fs$js$executable$$["default"];

    /** @typedef FileSystem$$module$axiom$fs$base$file_system */
    var FileSystem;

    /** @typedef JsEntry$$module$axiom$fs$js$entry */
    var JsEntry;

    /** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
    var JsFileSystem;

    var JsExecuteContext = function(jsfs, path, executable, arg) {
      ExecuteContext.call(this, /** FileSystem */ (jsfs), path, arg);

      this.jsfs = jsfs;
      this.path = path;
      this.targetExecutable = executable;
    };

    __es6_export__("JsExecuteContext", JsExecuteContext);
    __es6_export__("default", JsExecuteContext);

    JsExecuteContext.prototype = Object.create(ExecuteContext.prototype);

    /**
     * @override
     * @return {!Promise<*>}
     */
    JsExecuteContext.prototype.execute = function() {
      ExecuteContext.prototype.execute.call(this);
      return this.targetExecutable.execute(this).then(
          function(value) {
            if (this.isEphemeral('Ready'))
              return this.closeOk(value);
            return this.ephemeralPromise;
          }.bind(this),
          function(value) {
            if (this.isEphemeral('Ready'))
              return this.closeError(value);
            return this.ephemeralPromise;
          }.bind(this));
    };
  }
);

//# sourceMappingURL=execute_context.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/js/file_system",
  ["axiom/core/error", "axiom/fs/path", "axiom/fs/stat_result", "axiom/fs/base/file_system", "axiom/fs/base/execute_context", "axiom/fs/js/directory", "axiom/fs/js/executable", "axiom/fs/js/execute_context", "axiom/fs/js/open_context", "axiom/fs/js/resolve_result", "axiom/fs/js/value", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$path$$,
    axiom$fs$stat_result$$,
    axiom$fs$base$file_system$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$js$directory$$,
    axiom$fs$js$executable$$,
    axiom$fs$js$execute_context$$,
    axiom$fs$js$open_context$$,
    axiom$fs$js$resolve_result$$,
    axiom$fs$js$value$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var StatResult;
    StatResult = axiom$fs$stat_result$$["default"];
    var FileSystem;
    FileSystem = axiom$fs$base$file_system$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var JsDirectory;
    JsDirectory = axiom$fs$js$directory$$["default"];
    var JsExecutable;
    JsExecutable = axiom$fs$js$executable$$["default"];
    var JsExecuteContext;
    JsExecuteContext = axiom$fs$js$execute_context$$["default"];
    var JsOpenContext;
    JsOpenContext = axiom$fs$js$open_context$$["default"];
    var JsResolveResult;
    JsResolveResult = axiom$fs$js$resolve_result$$["default"];
    var JsValue;
    JsValue = axiom$fs$js$value$$["default"];

    /** @typedef {OpenMode$$module$axiom$fs$open_mode} */
    var OpenMode;

    /** @typedef {OpenContext$$module$axiom$fs$base$open_context} */
    var OpenContext;

    var JsFileSystem = function(opt_rootDirectory) {
      FileSystem.call(this);

      this.rootDirectory = opt_rootDirectory || new JsDirectory(this);
    };

    __es6_export__("JsFileSystem", JsFileSystem);
    __es6_export__("default", JsFileSystem);

    JsFileSystem.prototype = Object.create(FileSystem.prototype);

    /**
     * Resolve a path to a specific kind of JsEntry or reference to BaseFileSystem,
     * if possible.  See JsResolveResult for more information.
     *
     * @param {Path} path
     * @return {JsResolveResult}
     */
    JsFileSystem.prototype.resolve = function(path) {
      if (!path.elements.length)
        return new JsResolveResult(null, null, this.rootDirectory);

      return this.rootDirectory.resolve(path, 0);
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!StatResult>}
     */
    JsFileSystem.prototype.stat = function(path) {
      if (!path)
        return this.rootDirectory.stat();

      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (rv.entry instanceof FileSystem)
        return rv.entry.stat(new Path('/' + Path.join(rv.suffixList)));

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      return rv.entry.stat();
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<undefined>}
     */
    JsFileSystem.prototype.mkdir = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var parentPath = path.getParentPath();
      var targetName = path.getBaseName();

      var rv = this.resolve(parentPath);

      if (rv.entry instanceof FileSystem)
        return rv.entry.mkdir(new Path('/' + Path.join(rv.suffixList, targetName)));

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (!rv.entry.hasMode('D'))
        return Promise.reject(new AxiomError.TypeMismatch('dir', parentPath.spec));

      return rv.entry.mkdir(targetName).then(function(jsdir) { return null; });
    };

    /**
     * @override
     * @param {Path} pathFrom
     * @param {Path} pathTo
     * @return {!Promise<undefined>}
     */
    JsFileSystem.prototype.alias = function(pathFrom, pathTo) {
      if (!pathFrom.isValid) {
        return Promise.reject(
          new AxiomError.Invalid('pathFrom', pathFrom.originalSpec));
      }
      var resolveFrom = this.resolve(pathFrom);

      if (!pathTo.isValid) {
        return Promise.reject(
          new AxiomError.Invalid('pathTo', pathTo.originalSpec));
      }
      var resolveTo = this.resolve(pathTo);

      if (!resolveFrom.isFinal) {
        if (resolveFrom.entry instanceof FileSystem) {
          // If the source resolution stopped on a file system, then the target
          // must stop on the same file system.  If not, this is an attempt to move
          // across file systems.
          if (resolveTo.entry == resolveFrom.entry) {
            return resolveFrom.entry.move(
                new Path(Path.join(resolveFrom.suffixList)),
                new Path(Path.join(resolveTo.suffixList)));
          }

          return Promise.reject(
            new AxiomError.Invalid('filesystem', pathFrom.originalSpec));
        }

        // Otherwise, if the source resolve was not final then the source path
        // doesn't exist.
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(resolveTo.prefixList.join('/'),
                              resolveTo.suffixList[0])));
      }

      var targetName;

      // If the target path resolution stops (finally, or otherwise) on a
      // filesystem, that's trouble.
      if (resolveTo.entry instanceof FileSystem) {
        return Promise.reject(
          new AxiomError.Invalid('filesystem', pathTo.originalSpec));
      }

      if (resolveTo.isFinal) {
        // If target path resolution makes it to the end and finds something other
        // than a directory, that's trouble.
        if (!(resolveTo.entry instanceof JsDirectory)) {
          return Promise.reject(
            new AxiomError.Duplicate('pathTo', pathTo.originalSpec));
        }

        // But if path resolution stops on a directory, that just means we should
        // take the target name from the source.
        targetName = pathFrom.getBaseName();

      } else if (resolveTo.suffixList.length == 1) {
        // If the resolution was not final then there should be a single name in
        // the suffix list, which we'll use as the target name.
        targetName = pathFrom.getBaseName();

      } else {
        // If there's more than one item in the suffix list then the path refers
        // to non-existent directories.
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(resolveFrom.prefixList.join('/'),
                              resolveFrom.suffixList[0])));
      }

      // Link first, then unlink.  Failure mode is two copies of the file rather
      // than zero.
      return resolveTo.entry.link(targetName, resolveFrom.entry);
    };

    /**
     * @override
     * @param {Path} fromPath
     * @param {Path} toPath
     * @return {!Promise<undefined>}
     */
    JsFileSystem.prototype.move = function(fromPath, toPath) {
      return this.alias(fromPath, toPath).then(
        function() {
          return this.unlink(fromPath);
        });
    };

    /**
     * @override
     * @param {Path} path
     * @return {Promise}
     */
    JsFileSystem.prototype.unlink = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var parentPath = path.getParentPath();
      var targetName = path.getBaseName();

      var rv = this.resolve(parentPath);
      if (rv.entry instanceof FileSystem) {
        return rv.entry.unlink(
           new Path('/' + Path.join(rv.suffixList, targetName)));
      }

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (rv.entry instanceof JsDirectory)
        return rv.entry.unlink(targetName);

      return Promise.reject(new AxiomError.TypeMismatch('dir', parentPath.spec));
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!Object<string, StatResult>>}
     */
    JsFileSystem.prototype.list = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (rv.entry instanceof FileSystem)
        return rv.entry.list(new Path('/' + Path.join(rv.suffixList)));

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (!(rv.entry instanceof JsDirectory)) {
        return Promise.reject(
          new AxiomError.TypeMismatch('dir', path.originalSpec));
      }

      return rv.entry.list();
    };

    /**
     * @override
     * @param {Path} path
     * @param {*} arg
     * @return {!Promise<!ExecuteContext>}
     */
    JsFileSystem.prototype.createExecuteContext = function(path, arg) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (!rv.isFinal) {
        if (rv.entry instanceof FileSystem) {
          return rv.entry.createExecuteContext(
            new Path('/' + Path.join(rv.suffixList)), arg);
        }

        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (rv.entry instanceof JsExecutable) {
        /** @type {!ExecuteContext} */
        var cx = new JsExecuteContext(this, path, rv.entry, arg);
        return Promise.resolve(cx);
      }

      return Promise.reject(
        new AxiomError.TypeMismatch('executable', path.originalSpec));
    };

    /**
     * @override
     * @param {Path} path
     * @param {string|OpenMode} mode
     * @return {!Promise<!OpenContext>}
     */
    JsFileSystem.prototype.createOpenContext = function(path, mode) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (!rv.isFinal) {
        if (rv.entry instanceof FileSystem) {
          return rv.entry.createOpenContext(
            new Path('/' + Path.join(rv.suffixList)), mode);
        }

        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (rv.entry instanceof JsValue) {
        /** @type {!OpenContext} */
        var cx = new JsOpenContext(this, path, rv.entry, mode);
        return Promise.resolve(cx);
      }

      return Promise.reject(
        new AxiomError.TypeMismatch('openable', path.originalSpec));
    };
  }
);

//# sourceMappingURL=file_system.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/js/open_context",
  ["axiom/core/error", "axiom/fs/base/open_context", "axiom/fs/js/entry", "axiom/fs/path", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$base$open_context$$,
    axiom$fs$js$entry$$,
    axiom$fs$path$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var JsEntry;
    JsEntry = axiom$fs$js$entry$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    /** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
    var JsFileSystem;

    /** @typedef JsValue$$module$axiom$fs$js$value */
    var JsValue;

    /** @typedef {OpenMode$$module$axiom$fs$open_mode} */
    var OpenMode;

    var JsOpenContext = function(jsfs, path, entry, mode) {
      OpenContext.call(this, jsfs, path, mode);

      /** @type {JsFileSystem} */
      this.jsfs = jsfs;
      /** @type {Path} */
      this.path = path;
      /** @type {JsValue} */
      this.targetEntry = entry;
    };

    __es6_export__("JsOpenContext", JsOpenContext);
    __es6_export__("default", JsOpenContext);

    JsOpenContext.prototype = Object.create(JsOpenContext.prototype);

    /**
     * @override
     */
    JsOpenContext.prototype.open = function() {
      if (!(this.targetEntry instanceof JsValue)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('openable', this.path.spec));
      }

      return OpenContext.prototype.open.call(this);
    };

    /**
     * @override
     */
    JsOpenContext.prototype.seek = function(offset, whence) {
      if (!(this.targetEntry.mode & Path.Mode.K)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('seekable', this.path.spec));
      }

      return OpenContext.prototype.seek.apply(this, arguments);
    };

    /**
     * @override
     */
    JsOpenContext.prototype.read = function(offset, whence, dataType) {
      if (!(this.targetEntry.mode & Path.Mode.R)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('readable', this.path.spec));
      }

      return OpenContext.prototype.read.apply(this, arguments).then(
          function(readResult) {
            return this.targetEntry.read(readResult);
          }.bind(this));
    };

    /**
     * @override
     */
    JsOpenContext.prototype.write = function(offset, whence, dataType, data) {
      if (!(this.targetEntry.mode & Path.Mode.W)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('writable', this.path.spec));
      }

      return OpenContext.prototype.write.apply(this, arguments).then(
        function(writeResult) {
          return this.targetEntry.write(writeResult, data);
        }.bind(this));
    };
  }
);

//# sourceMappingURL=open_context.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @typedef FileSystem$$module$axiom$fs$base$file_system */
define("axiom/fs/js/resolve_result", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var BaseFileSystem;

 /** @typedef JsEntry$$module$axiom$fs$js$entry */
 var JsEntry;

 var JsResolveResult = function(prefixList, suffixList, entry) {
   this.prefixList = prefixList || [];
   this.suffixList = suffixList || [];
   this.entry = entry;

   this.isFinal = (entry && this.suffixList.length === 0);
 };

 __es6_export__("JsResolveResult", JsResolveResult);
 __es6_export__("default", JsResolveResult);
});

//# sourceMappingURL=resolve_result.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/js/value",
  ["axiom/core/error", "axiom/fs/data_type", "axiom/fs/base/open_context", "axiom/fs/js/entry", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$data_type$$,
    axiom$fs$base$open_context$$,
    axiom$fs$js$entry$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var DataType;
    DataType = axiom$fs$data_type$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var JsEntry;
    JsEntry = axiom$fs$js$entry$$["default"];

    /** @typedef {JsFileSystem$$module$axiom$fs$js$file_system} */
    var JsFileSystem;

    /** @typedef {ReadResult$$module$axiom$fs$read_result} */
    var ReadResult;

    /** @typedef {WriteResult$$module$axiom$fs$write_result} */
    var WriteResult;

    var JsValue = function(jsfs, modeStr) {
      JsEntry.call(this, jsfs, modeStr);

      /** @type {*} */
      this.value = null;
    };

    __es6_export__("JsValue", JsValue);
    __es6_export__("default", JsValue);

    JsValue.prototype = Object.create(JsEntry.prototype);

    /**
     * @param {ReadResult} readResult
     * @return !Promise<!ReadResult>
     */
    JsValue.prototype.read = function(readResult) {
      readResult.dataType = DataType.Value;
      readResult.data = this.value;
      return Promise.resolve(readResult);
    };

    /**
     * @param {WriteResult} writeResult
     * @param {*} data
     * @return !Promise<!WriteResult>
     */
    JsValue.prototype.write = function(writeResult, data) {
      if (writeResult.dataType == DataType.Value ||
          writeResult.dataType == DataType.UTF8String) {
        this.value = data;
      } else if (typeof data == 'string' &&
          writeResult.dataType == DataType.Base64String) {
        this.value = window.btoa(data);
      } else {
        return Promise.reject(new AxiomError.Invalid('dataType',
                                                     writeResult.dataType));
      }

      writeResult.dataType = DataType.Value;
      return Promise.resolve(writeResult);
    };
  }
);

//# sourceMappingURL=value.js.map
// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/node/execute_context",
  ["axiom/core/error", "axiom/fs/base/execute_context", "axiom/fs/path", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$path$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    /** @typedef NodeFileSystem$$module$axiom$fs$node$file_system */
    var NodeFileSystem;

    var NodeExecuteContext = function(nodefs, path, arg) {
      this.nodefs = nodefs;
      this.path = path;
      this.arg = arg;
    };

    __es6_export__("NodeExecuteContext", NodeExecuteContext);
    __es6_export__("default", NodeExecuteContext);

    NodeExecuteContext.prototype.execute_ = function() {
      return Promise.reject(new AxiomError(
          'NotImplemented', 'Node filesystem is not yet executable.'));
    };
  }
);

//# sourceMappingURL=execute_context.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/node/file_system",
  ["axiom/core/error", "axiom/fs/path", "axiom/fs/base/execute_context", "axiom/fs/base/file_system", "axiom/fs/js/directory", "axiom/fs/node/execute_context", "axiom/fs/node/open_context", "axiom/fs/js/resolve_result", "axiom/fs/node/nodefs_util", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$path$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$base$file_system$$,
    axiom$fs$js$directory$$,
    axiom$fs$node$execute_context$$,
    axiom$fs$node$open_context$$,
    axiom$fs$js$resolve_result$$,
    axiom$fs$node$nodefs_util$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var FileSystem;
    FileSystem = axiom$fs$base$file_system$$["default"];
    var JsDirectory;
    JsDirectory = axiom$fs$js$directory$$["default"];
    var NodeExecuteContext;
    NodeExecuteContext = axiom$fs$node$execute_context$$["default"];
    var NodeOpenContext;
    NodeOpenContext = axiom$fs$node$open_context$$["default"];
    var JsResolveResult;
    JsResolveResult = axiom$fs$js$resolve_result$$["default"];
    var nodefsUtil;
    nodefsUtil = axiom$fs$node$nodefs_util$$["default"];

    /** @typedef OpenContext$$module$axiom$fs$base$open_context */
    var OpenContext;

    /** @typedef OpenMode$$module$axiom$fs$open_mode */
    var OpenMode;

    /** @typedef StatResult$$module$axiom$fs$stat_result */
    var StatResult;

    var NodeFileSystem = function(fileSystem) {
      this.fileSystem = fileSystem;

      FileSystem.call(this);
    };

    __es6_export__("NodeFileSystem", NodeFileSystem);
    __es6_export__("default", NodeFileSystem);

    NodeFileSystem.prototype = Object.create(FileSystem.prototype);

    NodeFileSystem.available = function() {
      return true;
    }

    /**
     * Mounts a given type if node filesystem at /jsDir/mountName
     *
     * @param {FileSystem} nodefs a node filesystem object.
     * @param {string} mountName
     * @param {JsDirectory} jsDir
     */
    NodeFileSystem.mount = function(fs, mountName, jsDir) {
        var nodefs = new NodeFileSystem(fs);
        jsDir.mount(mountName, nodefs);
        return nodefs;
    };

    /**
     * This method is not directly reachable through the FileSystemBinding.
     *
     * @param {Path} path
     * @return {Promise<JsResolveResult>}
     */
    NodeFileSystem.prototype.resolve = function(path) {
      //TODO(grv): resolve directories and read mode bits.
      var nodefs = this.fileSystem;
      return new Promise(function(resolve, reject) {
        nodefs.root.getFile(path.spec, {create: true}, resolve, reject);
      });
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!StatResult>}
     */
    NodeFileSystem.prototype.stat = function(path) {
      return new Promise(function(resolve, reject) {
        var statCb = function(err, stat) {
          resolve(nodefsUtil.filterStat(stat));
        };
        this.fileSystem.stat(path.spec, statCb);
      }.bind(this));
    };

    /**
     * This version of mkdir_ is attached to the FileSystemBinding to ensure that
     * the NodeDirectory returned by `mkdir` doesn't leak through the binding.
     *:/m
     * @param {Path} path
     * @return {Promise}
     */
    NodeFileSystem.prototype.mkdir_ = function(path) {
      return this.mkdir(path).then(function() {
        return null;
      });
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<undefined>}
     */
    NodeFileSystem.prototype.mkdir = function(path) {

      return new Promise(function(resolve, reject) {
        var cb = function(err, dir) {
          console.log(dir);
          resolve(null);
        };

        this.fileSystem.mkdir([path.spec], cb);

      }.bind(this));
    };

    /**
     * Create an alias from a path on this file system to a different path on this
     * file system.
     *
     * If the "from" path is on a different fs, we'll forward the call.  If "from"
     * is on this fs but "to" is not, the move will fail.
     *
     * The destination path must refer to a file that does not yet exist, inside a
     * directory that does.
     *
     * @override
     * @param {Path} pathFrom
     * @param {Path} pathTo
     * @return {!Promise<undefined>}
     */
    NodeFileSystem.prototype.alias = function(pathFrom, pathTo) {
        return Promise.reject(new AxiomError.NotImplemented('To be implemented.'));
    };

    /**
     * Move an entry from a path on this file system to a different path on this
     * file system.
     *
     * If the "from" path is on a different fs, we'll forward the call.  If "from"
     * is on this fs but "to" is not, the move will fail.
     *
     * The destination path must refer to a file that does not yet exist, inside a
     * directory that does.
     *
     * @override
     * @param {Path} fromSpec
     * @param {Path} toSpec
     * @return {!Promise<undefined>}
     */
    NodeFileSystem.prototype.move = function(fromSpec, toSpec) {
      return Promise.reject(new AxiomError.NotImplemented('To be implemented.'));
    };

    /**
     * @override
     * @param {Path} path
     * @return {Promise}
     */
    NodeFileSystem.prototype.unlink = function(path) {

      return new Promise(function(resolve, reject) {
        this.fileSystem.unlink(path.spec, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        });

      }.bind(this));
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!Object<string, StatResult>>}
     */
    NodeFileSystem.prototype.list = function(path) {
      return nodefsUtil.listDirectory(this.fileSystem, path.spec).then(
        function(entries) {
          return Promise.resolve(entries);
        });
    };

    /**
     * @override
     * @param {Path} path
     * @param {*} arg
     * @return {!Promise<!ExecuteContext>}
     */
    NodeFileSystem.prototype.createExecuteContext = function(path, arg) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      /** @type {!ExecuteContext} */
      var cx = new NodeExecuteContext(this, path, arg);
      return Promise.resolve(cx);
    };

    /**
     * @override
     * @param {Path} path
     * @param {string|OpenMode} mode
     * @return {!Promise<!OpenContext>}
     */
    NodeFileSystem.prototype.createOpenContext = function(path, mode) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      /** @type {!OpenContext} */
      var cx = new NodeOpenContext(this, path, mode);
      return Promise.resolve(cx);
    };
  }
);

//# sourceMappingURL=file_system.js.map
// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/node/nodefs_util",
  ["axiom/fs/path", "axiom/core/error", "exports"],
  function(axiom$fs$path$$, axiom$core$error$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var Path;
    Path = axiom$fs$path$$["default"];
    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var nodefsUtil = {};
    __es6_export__("nodefsUtil", nodefsUtil);
    __es6_export__("default", nodefsUtil);

    /**
     * List all FileEntrys in a given nodefs directory.
     *
     * @param {fs} node filesystem.
     * @param {string} path The absolute path of the target directory.
     * @return {Promise<Object>}
     */
    nodefsUtil.listDirectory = function(fs, path) {
      return new Promise(function(resolve, reject) {
        var rv = {};

        var cb = function(err, files) {
          for (var i = 0; i < files.length; i++) {
            var stat = fs.statSync(path + '/' + files[i]);
           rv[files[i]] = nodefsUtil.filterStat(stat);
          }
          resolve(rv);
        };
        fs.readdir(path, cb);
      });
    };

    nodefsUtil.filterStat = function(stat) {
      var stat_new = {};
      stat_new['mtime'] = stat['mtime'];
      stat_new['size'] = stat['mtime'];
      stat_new['mode'] = stat['mode'];
      return stat_new;
    };

    /**
     * Convenience method to convert a FileError to a promise rejection with an
     * Axiom error.
     *
     * Used in the context of a FileEntry.
     */
    nodefsUtil.convertFileError = function(pathSpec, error) {
      if (error.name == 'TypeMismatchError')
        return new AxiomError.TypeMismatch('entry-type', pathSpec);

      if (error.name == 'NotFoundError')
        return new AxiomError.NotFound('path', pathSpec);

      if (error.name == 'PathExistsError')
        return new AxiomError.Duplicate('path', pathSpec);

      return new AxiomError.Runtime(pathSpec + ':' + error.toString());
    };

    nodefsUtil.rejectFileError = function(pathSpec, reject, error) {
      reject(nodefsUtil.convertFileError(pathSpec, error));
    };
  }
);

//# sourceMappingURL=nodefs_util.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(
  "axiom/fs/node/open_context",
  ["axiom/core/error", "axiom/fs/base/open_context", "axiom/fs/node/nodefs_util", "axiom/fs/path", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$base$open_context$$,
    axiom$fs$node$nodefs_util$$,
    axiom$fs$path$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var nodefsUtil;
    nodefsUtil = axiom$fs$node$nodefs_util$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    /** @typedef NodeFileSystem$$module$axiom$fs$node$file_system */
    var NodeFileSystem;

    /** @typedef OpenMode$$module$axiom$fs$open_mode */
    var OpenMode;

    var NodeOpenContext = function(nodefs, path, arg) {
      this.nodefs = nodefs;
      this.path = path;
      this.arg = arg;

      this.onFileError_ = nodefsUtil.rejectFileError.bind(null, path.spec);

      // The current read/write position.
      this.position_ = 0;

      // The Node FileEntry we're operation on.
      this.entry_ = null;

      // THe Node file we're operating on.
      this.file_ = null;

    };

    __es6_export__("NodeOpenContext", NodeOpenContext);
    __es6_export__("default", NodeOpenContext);

    /**
     * If the arg object does not have a 'whence' property, this call succeeds
     * with no side effects.
     *
     * @param {Object} arg An object containing 'whence' and 'offset' arguments
     *  describing the seek operation.
     */
    NodeOpenContext.prototype.seek_ = function(arg) {
      var fileSize = this.file_.size;
      var start = this.position_;

      if (!arg['whence'])
        return Promise.resolve(true);

      if (arg['whence'] == 'begin') {
        start = arg['offset'];

      } else if (arg['whence'] == 'current') {
        start += arg['offset'];

      } else if (arg['whence'] == 'end') {
        start = fileSize + arg['offset'];
      }

      if (start > fileSize) {
        //onError(wam.mkerr('wam.FileSystem.Error.EndOfFile', []));
        return Promise.reject(new AxiomError.Runtime('reached end of file.'));
      }

      if (start < 0) {
        return Promise.reject(new AxiomError.Runtime(
            'Invalid file offset: ' + this.path.spec));
      }

      this.position_ = start;
      return Promise.resolve({position: this.position_});
    };

    NodeOpenContext.prototype.open_ = function() {
      var mode = this.arg;
      return new Promise(function(resolve, reject) {
        var onFileError = this.onFileError_.bind(null, reject);
        var onStat = function(stat) {
          this.entry_.file(function(f) {
              this.file_ = f;
              resolve();
          }.bind(this), onFileError);
        }.bind(this);

        var onFileFound = function(entry) {
          this.entry_ = entry;
          if (mode.write && mode.truncate) {
            this.entry_.createWriter(
                function(writer) {
                  writer.truncate(0);
                  //nodefsUtil.statEntry(entry).then(onStat).catch(onFileError);
                },
                reject);
            return;
          }

          /*nodefsUtil.statEntry(entry).then(function(value) {
            onStat(value);
          }).catch(function(e) {
            reject(e);
          });*/
        }.bind(this);

        this.nodefs.fileSystem.root.getFile(
            this.path.spec,
            {create: mode.create,
             exclusive: mode.exclusive
            },
            onFileFound, onFileError);
      }.bind(this));
    };

    /**
     * Handle a read event.
     */
    NodeOpenContext.prototype.read_ = function(arg) {
      if (!arg) {
        arg = {
           dataType: 'utf8-string',
           count: 0
        };
      }
      return new Promise(function(resolve, reject) {
        this.seek_(arg).then(function(rv) {
          if (!rv) {
            return reject();
          }

          var fileSize = this.file_.size;
          var end;
          if (arg.count) {
            end = this.position_ + arg.count;
          } else {
            end = fileSize;
          }

          var dataType = arg.dataType || 'utf8-string';
          var reader = new FileReader();

          reader.onload = function(e) {
            this.position_ = end + 1;
            var data = reader.result;

            if (dataType == 'base64-string' && typeof data == 'string') {
              // TODO: By the time we read this into a string the data may already
              // have been munged.  We need an ArrayBuffer->Base64 string
              // implementation to make this work for real.
              data = window.btoa(data);
            }
            resolve({dataType: dataType, data: data});
          }.bind(this);

          reader.onerror = function(error) {
            return this.onFileError_(reject, error);
          };

          var slice = this.file_.slice(this.position_, end);
          if (dataType == 'blob') {
            resolve({dataType: dataType, data: slice});
          }  else if (dataType == 'arraybuffer') {
            reader.readAsArrayBuffer(slice);
          } else {
            reader.readAsText(slice);
          }
        }.bind(this));
      }.bind(this));
    };

    /**
     * Handle a write event.
     */
    NodeOpenContext.prototype.write_ = function(arg) {
      if (!arg) {
        return Promise.reject(new AxiomError.Missing('arg'));
      }
      var dataType = arg.dataType || 'utf8-string';
      return new Promise(function(resolve, reject) {
        var onWriterReady = function(writer) {
          var blob;
          if (arg.data instanceof Blob) {
            blob = arg.data;
          } else if (arg.data instanceof ArrayBuffer) {
            blob = new Blob([arg.data], {type: 'application/octet-stream'});
          } else if (dataType == 'base64-string' && typeof arg.data == 'string') {
            // TODO: Once we turn this into a string the data may already have
            // been munged.  We need an ArrayBuffer->Base64 string implementation to
            // make this work for real.
            blob = new Blob([window.atob(arg.data)],
                            {type: 'application/octet-stream'});
          } else if (dataType == 'utf8-string') {
            blob = new Blob([arg.data],  {type: 'text/plain'});
          } else if (dataType == 'value') {
            blob = new Blob([JSON.stringify(arg.data)],  {type: 'text/json'});
          }

          writer.onerror = function(error) {
            return this.onFileError_(reject, error);
          }.bind(this);

          writer.onwrite = function() {
            this.position_ = this.position_ + blob.size;
            resolve(null);
          }.bind(this);

          writer.seek(this.position_);
          writer.write(blob);
        }.bind(this);

        this.seek_(arg).then(function(rv) {
          if (!rv) {
            return reject();
          }
          this.entry_.createWriter(
              onWriterReady,
              this.onFileError_.bind(null, reject));
        }.bind(this));
      }.bind(this));
    };
  }
);

//# sourceMappingURL=open_context.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/** @constructor */
define("axiom/fs/open_mode", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var OpenMode = function() {
    this.create = false;
    this.exclusive = false;
    this.truncate = false;
    this.read = false;
    this.write = false;
  };

  __es6_export__("OpenMode", OpenMode);
  __es6_export__("default", OpenMode);

  /**
   * @param {string} str
   * @return {OpenMode}
   */
  OpenMode.fromString = function(str) {
    var m = new OpenMode();

    for (var i = 0; i < str.length; i++) {
      switch(str.substr(i, 1)) {
        case 'c':
        m.create = true;
        break;

        case 'e':
        m.exclusive = true;
        break;

        case 't':
        m.truncate = true;
        break;

        case 'r':
        m.read = true;
        break;

        case 'w':
        m.write = true;
        break;
      }
    }

    return m;
  };
});

//# sourceMappingURL=open_mode.js.map
// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @constructor
 * @param {string} spec
 */
define("axiom/fs/path", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var Path = function(spec) {
    this.originalSpec = spec; // the path you gave.

    /** @type {boolean} */
    this.isValid = true;  // True if the path was parsed, false if not.

    var elements = [];

    var specNames = Path.split(spec);
    if (!specNames) {
      this.isValid = false;
    } else {
      for (var i = 0; i < specNames.length; i++) {
        var name = specNames[i];
        if (!name || name == '.')
          continue;

        if (name == '..') {
          elements.pop();
        } else if (Path.reValidName.test(name)) {
          elements.push(name);
        } else {
          this.isValid = false;
          break;
        }
      }
    }

    /** @type {Array<string>} */
    this.elements = this.isValid ? elements : [];

    /** @type {string} */
    this.spec = this.elements.join('/');
  };

  __es6_export__("Path", Path);
  __es6_export__("default", Path);

  /**
   * @enum {number}
   * Enumeration of the supported file modes and their bit masks.
   */
  Path.Mode = {
    X: 0x01,  // executable
    W: 0x02,  // writable
    R: 0x04,  // readable
    D: 0x08,  // directory
    K: 0x10   // seekable
  };

  /**
   * Convert a mode string to a bit mask.
   *
   * @param {string} modeStr
   * @return {number}
   */
  Path.modeStringToInt = function(modeStr) {
    return modeStr.split('').reduce(
        function(p, v) {
          if (!(v in Path.Mode))
            throw new Error('Unknown mode char: ' + v);

          return p | Path.Mode[v];
        }, 0);
  };

  /**
   * Convert a mode bit mask to a string.
   *
   * @param {number} modeInt
   * @return {string}
   */
  Path.modeIntToString = function(modeInt) {
    var rv = '';
    Object.keys(Path.Mode).forEach(function(key) {
        if (modeInt & Path.Mode[key])
          rv += key;
      });
    return rv;
  };

  /**
   * RegExp matches valid path names.
   * @type {RegExp}
   */
  Path.reValidName = /[\w\d\-\.\,\+~\ ]/i;

  /**
   * @type {string}
   */
  Path.separator = '/';

  /**
   * Accepts varargs of strings or arrays of strings, and returns a string of
   * all path elements joined with Path.separator.
   *
   * @param {...(string|Array<string>)} var_args
   * @return {string}
   */
  Path.join = function(var_args) {
    var args = [];

    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] instanceof Array) {
        args[i] = arguments[i].join(Path.separator);
      } else {
        args[i] = arguments[i];
      }
    }

    return args.join(Path.separator).replace(/\/+/g, '/');
  };

  /**
   * @param {string} pwd
   * @param {string} path
   * @return {string}
   */
  Path.abs = function(pwd, path) {
    if (path.substr(0, 1) == '/')
      return path;

    if (path.substr(0, 2) == './')
      path = path.substr(2);

    return (pwd || '/') + path;
  };

  /**
   * @param {string} spec
   * @return {Array<string>}
   */
  Path.split = function(spec) {
    return spec.split(/\//g);
  };

  /**
   * @return {string}
   */
  Path.prototype.getParentSpec = function() {
    return this.elements.slice(0, this.elements.length - 1).join(Path.separator);
  };

  /**
   * @return {Path}
   */
  Path.prototype.getParentPath = function() {
    if (this.elements.length === 0)
      return null;

    return new Path(this.getParentSpec());
  };

  /**
   * @return {string}
   */
  Path.prototype.getBaseName = function() {
    return this.elements[this.elements.length - 1];
  };
});

//# sourceMappingURL=path.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @typedef {SeekWhence$$module$axiom$fs$seek_whence} */
define("axiom/fs/read_result", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var SeekWhence;

  /** @typedef {DataType$$module$axiom$fs$data_type} */
  var DataType;

  var ReadResult = function(offset, whence, dataType) {
    /** @type {number} */
    this.offset = offset;

    /** @type {SeekWhence} */
    this.whence = whence;

    /** @type {DataType} */
    this.dataType = dataType;

    /** @type {*} */
    this.data = null;
  };

  __es6_export__("ReadResult", ReadResult);
  __es6_export__("default", ReadResult);
});

//# sourceMappingURL=read_result.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @enum {string} */
define("axiom/fs/seek_whence", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var SeekWhence = {
    Begin: 'begin',
    Current: 'current',
    End: 'end'
  };

  __es6_export__("SeekWhence", SeekWhence);
  __es6_export__("default", SeekWhence);
});

//# sourceMappingURL=seek_whence.js.map
// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @constructor
 *
 * @param {number=} opt_mode
 */
define("axiom/fs/stat_result", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var StatResult = function(opt_mode) {
   /** @type {number} */
   this.mode = opt_mode || 0;
   /** @type {number} */
   this.mtime = 0;
   /** @type {number} */
   this.size = 0;
   /** @type {string} */
   this.argSigil = '';
 };

 __es6_export__("StatResult", StatResult);
 __es6_export__("default", StatResult);
});

//# sourceMappingURL=stat_result.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @constructor
 *
 * Null values indicate that the given property is not known.  Unknown
 * properties are not propagated in the copyFrom/copyTo methods.
 */
define("axiom/fs/tty_state", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var TTYState = function() {
    /** @type {?boolean} */
    this.isatty = null;

    /** @type {?number} */
    this.rows = null;

    /** @type {?number} */
    this.columns = null;

    /** @type {?string} */
    this.interrupt = null;
  };

  __es6_export__("TTYState", TTYState);
  __es6_export__("default", TTYState);

  /**
   * ^C
   */
  TTYState.defaultInterruptChar = String.fromCharCode('C'.charCodeAt(0) - 64);

  /**
   * Copy values from another TTYState instance or an arbitrary object.
   *
   * @param {Object} obj
   */
  TTYState.prototype.copyFrom = function(obj) {
    if ('isatty' in obj && obj.isatty != null)
      this.isatty = !!obj.isatty;

    if ('rows' in obj && obj.rows != null)
      this.rows = obj.rows;

    if ('columns' in obj && obj.columns != null)
      this.columns = obj.columns;

    if (!this.rows || !this.columns) {
      this.rows = 0;
      this.columns = 0;
      this.isatty = false;
    } else {
      this.isatty = true;
    }

    if (this.rows < 0 || this.columns < 0)
      throw new Error('Invalid tty size.');

    if ('interrupt' in obj && obj.interrupt != null)
      this.interrupt = obj.interrupt;
  };

  /**
   * @param {Object} obj
   */
  TTYState.prototype.copyTo = function(obj) {
    if (this.isatty != null)
      obj.isatty = this.isatty;
    if (this.rows != null)
      obj.rows = this.rows;
    if (this.columns != null)
      obj.columns = this.columns;
    if (this.interrupt != null)
      obj.interrupt = this.interrupt;
  };

  /**
   * @return {TTYState}
   */
  TTYState.prototype.clone = function() {
    var rv = new TTYState();
    rv.copyFrom(this);
    return rv;
  };
});

//# sourceMappingURL=tty_state.js.map
// Copyright (c) 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @typedef {SeekWhence$$module$axiom$fs$seek_whence} */
define("axiom/fs/write_result", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var SeekWhence;

  /** @typedef {DataType$$module$axiom$fs$data_type} */
  var DataType;

  var WriteResult = function(offset, whence, dataType) {
    /** @type {number} */
    this.offset = offset;

    /** @type {SeekWhence} */
    this.whence = whence;

    /** @type {DataType} */
    this.dataType = dataType;

    /** @type {*} */
    this.data = null;
  };

  __es6_export__("WriteResult", WriteResult);
  __es6_export__("default", WriteResult);
});

//# sourceMappingURL=write_result.js.map