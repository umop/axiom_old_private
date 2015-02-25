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
var axiom$core$error$$ = require("axiom/core/error"), axiom$fs$base$execute_context$$ = require("axiom/fs/base/execute_context"), axiom$fs$path$$ = require("axiom/fs/path");

/** @typedef DomFileSystem$$module$axiom$fs$dom$file_system */
var DomFileSystem;

var DomExecuteContext = function(domfs, path, arg) {
  this.domfs = domfs;
  this.path = path;
  this.arg = arg;
};

exports["default"] = DomExecuteContext;

DomExecuteContext.prototype.execute_ = function() {
  return Promise.reject(new axiom$core$error$$.default(
      'NotImplemented', 'DOM filesystem is not executable.'));
};
exports.DomExecuteContext = DomExecuteContext;

//# sourceMappingURL=execute_context.js.map