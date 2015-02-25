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
  "axiom/fs/dom/file_system.test",
  ["axiom/fs/dom/file_system", "axiom/fs/js/file_system", "axiom/fs/path", "axiom/core/error", "exports"],
  function(
    axiom$fs$dom$file_system$$,
    axiom$fs$js$file_system$$,
    axiom$fs$path$$,
    axiom$core$error$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var DomFileSystem;
    DomFileSystem = axiom$fs$dom$file_system$$["default"];
    var JsFileSystem;
    JsFileSystem = axiom$fs$js$file_system$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var AxiomError;
    AxiomError = axiom$core$error$$["default"];

    var failTest = function(error) {
      expect(error).toBeUndefined();
    };

    describe('DomFileSystem', function () {
      if (!DomFileSystem.available()) {
        console.log('dom filesystem is not available. Skipping domfs tests.');
        return;
      }

      it('should be available as a module', function () {
        expect(DomFileSystem).toBeDefined();
      });

      describe('Test dom file system', function() {

        var jsfs;
        var domfs;
        beforeEach(function (done) {
        jsfs = new JsFileSystem();

        DomFileSystem.mount('temporary', 'tmp', jsfs.rootDirectory)
            .then(function(fs) {
              domfs = fs;
              domfs.mkdir(new Path('foo'))
              .then(function (dir) {
                return domfs.mkdir(new Path('foo/bar'));
              })
              .catch(failTest)
              .then(done);
          });
        });

       afterEach(function(done) {
          domfs.list(new Path('/'))
            .then(function(entries) {
              var unlinks = [];
              for (var name in entries) {
                unlinks.push(domfs.unlink(new Path(name)));
              };
              return Promise.all(unlinks);
            })
            .catch(failTest)
            .then(done);
        });

        it('should have a readable folder named "foo"', function (done) {
          domfs.stat(new Path('foo')).then(function(rv) {
              expect(rv).toBeDefined();
              expect(rv.mode).toBe(12);
            })
            .catch(failTest)
            .then(done);
        });

        it('should have a root folder named "foo/bar" with no entries',
            function (done) {
          domfs.stat(new Path('foo/bar')).then(function(rv) {
              expect(rv).toBeDefined();
              expect(rv.mode).toBe(12);
            })
            .catch(failTest)
            .then(done);
        });

        it('should allow unlink of folder "foo/bar"', function (done) {
          domfs.unlink(new Path('foo/bar')).then(function() {
            })
            .catch(failTest)
            .then(done);
        });

        it('should allow unlink of folder "foo"', function (done) {
          domfs.unlink(new Path('foo')).then(function() {
            })
            .catch(failTest)
            .then(done);
        });
      });
    });
  }
);

//# sourceMappingURL=file_system.test.js.map