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