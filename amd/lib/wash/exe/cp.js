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
  "wash/exe/cp",
  ["axiom/core/error", "axiom/fs/path", "exports"],
  function(axiom$core$error$$, axiom$fs$path$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

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
      var fromPath = new Path(Path.abs(pwd, fromPathSpec));
      var toPath = new Path(Path.abs(pwd, toPathSpec));

      var fileSystem = executeContext.fileSystem;

      return fileSystem.readFile(fromPath).then(
        function(readResult) {
          return fileSystem.writeFile(toPath,
                                      readResult.dataType,
                                      readResult.data);
        });
    };

    __es6_export__("main", main);
    __es6_export__("default", main);

    main.argSigil = '%';
  }
);

//# sourceMappingURL=cp.js.map