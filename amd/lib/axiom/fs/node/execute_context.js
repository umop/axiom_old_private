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