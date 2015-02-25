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