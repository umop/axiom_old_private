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

var MKDIR_CMD_USAGE_STRING = 'usage: mkdir directory ...';

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
var JsExecuteContext;

var main = function(executeContext) {
  executeContext.ready();

  var arg = executeContext.arg;
  if (!arg['_'] || (arg['_'].length === 0) || arg['h'] || arg['help']) {
    executeContext.stdout(MKDIR_CMD_USAGE_STRING + '\n');
    return Promise.resolve(null);
  }

  var fileSystem = executeContext.fileSystem;

  var mkdirNext = function() {
    if (!arg['_'].length)
      return Promise.resolve(null);

    /** @type {string} */
    var pathSpec = arg['_'].shift();
    var path = new axiom$fs$path$$.default(axiom$fs$path$$.default.abs(executeContext.getEnv('$PWD', '/'), pathSpec));

    return fileSystem.mkdir(path).then(
      function() {
        return mkdirNext();
      }
    ).catch(function(e) {
      var errorString;

      if (e instanceof axiom$core$error$$.default) {
        errorString = e.errorName;
      } else {
        errorString = e.toString();
      }

      executeContext.stdout('mkdir: ' + path.originalSpec + ': ' + errorString + '\n');
      return mkdirNext();
    });
  };

  return mkdirNext();
};

exports["default"] = main;

main.argSigil = '%';
exports.main = main;

//# sourceMappingURL=mkdir.js.map