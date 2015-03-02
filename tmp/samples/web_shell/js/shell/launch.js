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
  "shell/launch",
  ["axiom/fs/js/file_system", "axiom/fs/dom/file_system", "axiom/fs/base/execute_context", "axiom/fs/path", "shell/terminal", "wash/exe_modules", "exports"],
  function(
    axiom$fs$js$file_system$$,
    axiom$fs$dom$file_system$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$path$$,
    shell$terminal$$,
    wash$exe_modules$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var JsFileSystem;
    JsFileSystem = axiom$fs$js$file_system$$["default"];
    var DomFileSystem;
    DomFileSystem = axiom$fs$dom$file_system$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var TerminalView;
    TerminalView = shell$terminal$$["default"];
    var washExecutables;
    washExecutables = wash$exe_modules$$["default"];

    console.log('Lauching app!');

    var fs = new JsFileSystem();

    // Add executables to new filesystem
    fs.rootDirectory.mkdir('exe')
      .then(function( /** JsDirectory */ jsdir) {
        jsdir.install(washExecutables);
      })
      .then(function() {
        return fs.rootDirectory.mkdir('mnt')
          .then(function(jsDir) {
            return DomFileSystem.mount('permanent', 'html5', jsDir);
          })
          .then(function() {
            return DomFileSystem.mount('temporary', 'tmp', fs.rootDirectory);
          })
          .catch(function(e) {
            console.log("Error mounting DomFileSystem", e);
          });
      })
      .then(function() {
        return launchHterm();
      }).catch(function(e) {
        console.log('Error lauching app:', e);
      });

    var launchHterm = function() {
      return fs.createExecuteContext(
        new Path('exe/wash'), {})
        .then(function (/** ExecutionContext */cx) {
          var tv = new TerminalView();
          var env = cx.arg['env'] || {
            '@PATH': ['/exe'],
            '$TERM': 'xterm-256color'
          };
          cx.setEnvs(env);
          tv.execute(cx);
          return Promise.resolve(null);
      });
    }
  }
);

//# sourceMappingURL=launch.js.map