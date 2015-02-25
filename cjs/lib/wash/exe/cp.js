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
var axiom$core$error$$ = require("axiom/core/error"), axiom$fs$path$$ = require("axiom/fs/path");

var CP_CMD_USAGE_STRING = 'usage: cp sourceFile targetFile';

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
var JsExecuteContext;

var main = function(executeContext) {
  executeContext.ready();

  var arg = executeContext.arg;
  if (!arg._ || (arg._.length != 2) || arg['h'] || arg['help']) {
    executeContext.stdout(CP_CMD_USAGE_STRING + '\n');
    return Promise.resolve(null);
  }

  /** @type {string} */
  var fromPathSpec = arg._[0];
  /** @type {string} */
  var toPathSpec = arg._[1];
  /** @type {string} */
  var pwd = executeContext.getEnv('$PWD', '/');
  var fromPath = new axiom$fs$path$$.default(axiom$fs$path$$.default.abs(pwd, fromPathSpec));
  var toPath = new axiom$fs$path$$.default(axiom$fs$path$$.default.abs(pwd, toPathSpec));

  var fileSystem = executeContext.fileSystem;

  return fileSystem.readFile(fromPath).then(
    function(readResult) {
      return fileSystem.writeFile(toPath,
                                  readResult.dataType,
                                  readResult.data);
    });
};

exports["default"] = main;

main.argSigil = '%';
exports.main = main;

//# sourceMappingURL=cp.js.map