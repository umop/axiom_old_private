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

"use strict";
var axiom$fs$base$execute_context$$ = require("axiom/fs/base/execute_context"), axiom$fs$path$$ = require("axiom/fs/path"), axiom$fs$js$executable$$ = require("axiom/fs/js/executable");

/** @typedef FileSystem$$module$axiom$fs$base$file_system */
var FileSystem;

/** @typedef JsEntry$$module$axiom$fs$js$entry */
var JsEntry;

/** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
var JsFileSystem;

var JsExecuteContext = function(jsfs, path, executable, arg) {
  axiom$fs$base$execute_context$$.default.call(this, /** FileSystem */ (jsfs), path, arg);

  this.jsfs = jsfs;
  this.path = path;
  this.targetExecutable = executable;
};

exports["default"] = JsExecuteContext;

JsExecuteContext.prototype = Object.create(axiom$fs$base$execute_context$$.default.prototype);

/**
 * @override
 * @return {!Promise<*>}
 */
JsExecuteContext.prototype.execute = function() {
  axiom$fs$base$execute_context$$.default.prototype.execute.call(this);
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
exports.JsExecuteContext = JsExecuteContext;

//# sourceMappingURL=execute_context.js.map