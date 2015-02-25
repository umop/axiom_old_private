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

"use strict";
var axiom$fs$dom$file_system$$ = require("axiom/fs/dom/file_system"), axiom$fs$js$file_system$$ = require("axiom/fs/js/file_system"), axiom$fs$path$$ = require("axiom/fs/path"), axiom$core$error$$ = require("axiom/core/error");

var failTest = function(error) {
  expect(error).toBeUndefined();
};

describe('DomFileSystem', function () {
  if (!axiom$fs$dom$file_system$$.default.available()) {
    console.log('dom filesystem is not available. Skipping domfs tests.');
    return;
  }

  it('should be available as a module', function () {
    expect(axiom$fs$dom$file_system$$.default).toBeDefined();
  });

  describe('Test dom file system', function() {

    var jsfs;
    var domfs;
    beforeEach(function (done) {
    jsfs = new axiom$fs$js$file_system$$.default();

    axiom$fs$dom$file_system$$.default.mount('temporary', 'tmp', jsfs.rootDirectory)
        .then(function(fs) {
          domfs = fs;
          domfs.mkdir(new axiom$fs$path$$.default('foo'))
          .then(function (dir) {
            return domfs.mkdir(new axiom$fs$path$$.default('foo/bar'));
          })
          .catch(failTest)
          .then(done);
      });
    });

   afterEach(function(done) {
      domfs.list(new axiom$fs$path$$.default('/'))
        .then(function(entries) {
          var unlinks = [];
          for (var name in entries) {
            unlinks.push(domfs.unlink(new axiom$fs$path$$.default(name)));
          };
          return Promise.all(unlinks);
        })
        .catch(failTest)
        .then(done);
    });

    it('should have a readable folder named "foo"', function (done) {
      domfs.stat(new axiom$fs$path$$.default('foo')).then(function(rv) {
          expect(rv).toBeDefined();
          expect(rv.mode).toBe(12);
        })
        .catch(failTest)
        .then(done);
    });

    it('should have a root folder named "foo/bar" with no entries',
        function (done) {
      domfs.stat(new axiom$fs$path$$.default('foo/bar')).then(function(rv) {
          expect(rv).toBeDefined();
          expect(rv.mode).toBe(12);
        })
        .catch(failTest)
        .then(done);
    });

    it('should allow unlink of folder "foo/bar"', function (done) {
      domfs.unlink(new axiom$fs$path$$.default('foo/bar')).then(function() {
        })
        .catch(failTest)
        .then(done);
    });

    it('should allow unlink of folder "foo"', function (done) {
      domfs.unlink(new axiom$fs$path$$.default('foo')).then(function() {
        })
        .catch(failTest)
        .then(done);
    });
  });
});

//# sourceMappingURL=file_system.test.js.map