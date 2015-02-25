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
  "wash/exe/cat",
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

    var CAT_CMD_USAGE_STRING = 'usage: cat [file...]';

    var main = function(executeContext) {
      executeContext.ready();

      var arg = executeContext.arg;
      if (!arg['_'] || (arg['_'].length === 0) || arg['h'] || arg['help']) {
        executeContext.stdout(CAT_CMD_USAGE_STRING + '\n');
        return Promise.resolve(null);
      }

      var fileSystem = executeContext.fileSystem;

      var catNext = function() {
        if (!arg['_'].length)
          return Promise.resolve(null);

        /** @type {string} */
        var pathSpec = arg['_'].shift();
        pathSpec = Path.abs(executeContext.getEnv('$PWD', '/'), pathSpec);

        return fileSystem.readFile(new Path(pathSpec), {read: true}).then(
          function(data) {
            executeContext.stdout(data.data);
            return catNext();
          }
        ).catch(function(e) {
            var errorString;

            if (e instanceof AxiomError) {
              errorString = e.errorName;
            } else {
              errorString = e.toString();
            }

            executeContext.stdout('cat: ' + pathSpec + ': ' + errorString + '\n');
            return catNext();
          }
        );
      };

      return catNext();
    };

    __es6_export__("main", main);
    __es6_export__("default", main);

    main.argSigil = '%';
  }
);

//# sourceMappingURL=cat.js.map