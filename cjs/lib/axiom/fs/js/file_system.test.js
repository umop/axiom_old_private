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
var axiom$fs$js$file_system$$ = require("axiom/fs/js/file_system"), axiom$fs$path$$ = require("axiom/fs/path");

var failTest = function(error) {
  expect(error).toBeUndefined();
};

describe('JsFileSystem', function () {

  it('should be available as a module', function () {
    expect(axiom$fs$js$file_system$$.default).toBeDefined();
  });

  describe('when empty', function () {
    it('should have a root folder', function(done) {
      var jsfs = new axiom$fs$js$file_system$$.default();
      jsfs.stat(new axiom$fs$path$$.default('')).then(function (rv) {
          expect(rv).toBeDefined();
          expect(rv.mode).toBe(8);
        })
        .catch(failTest)
        .then(done);
    });

    it('should have a root folder named "/"', function(done) {
      var jsfs = new axiom$fs$js$file_system$$.default();
      jsfs.stat(new axiom$fs$path$$.default('/')).then(function(rv) {
          expect(rv).toBeDefined();
          expect(rv.mode).toBe(8);
        })
        .catch(failTest)
        .then(done);
    });

    it('should have no entries when created', function(done) {
      var jsfs = new axiom$fs$js$file_system$$.default();
      jsfs.list(new axiom$fs$path$$.default('/')).then(function (entries) {
          expect(entries).toEqual({});
        })
        .catch(failTest)
        .then(done);
    });

    it('should allow creation of a directory', function (done) {
      var jsfs = new axiom$fs$js$file_system$$.default();
      jsfs.rootDirectory.mkdir('foo').then(function (dir) {
        expect(dir).toBeDefined();
        expect(dir.mode).toBe(8);
      })
      .catch(failTest)
      .then(done);
    });
  });

  describe('when populated', function() {
    var jsfs = new axiom$fs$js$file_system$$.default();
    beforeEach(function (done) {
        jsfs.rootDirectory.mkdir('foo')
        .then(function (dir) {
          return dir.mkdir('bar');
        })
        .catch(failTest)
        .then(done);
    });

    afterEach(function (done) {
      jsfs.list(new axiom$fs$path$$.default('/'))
        .then(function(entries) {
          var unlinks = [];
          for (var e in entries) {
            unlinks.push(jsfs.unlink(new axiom$fs$path$$.default(e)));
          }
          return Promise.all(unlinks);
        })
        .catch(failTest)
        .then(done);
    });

    it('should have a readable folder named "foo"', function (done) {
      jsfs.stat(new axiom$fs$path$$.default('foo')).then(function(rv) {
          expect(rv).toBeDefined();
          expect(rv.mode).toBe(8);
        })
        .catch(failTest)
        .then(done);
    });

    it('should have a root folder named "foo/bar" with no entries',
       function (done) {
         jsfs.stat(new axiom$fs$path$$.default('foo/bar')).then(function(rv) {
           expect(rv).toBeDefined();
           expect(rv.mode).toBe(8);
         })
         .catch(failTest)
         .then(done);
       });

    it('should allow unlink of folder "foo/bar"', function (done) {
      jsfs.unlink(new axiom$fs$path$$.default('foo/bar')).then(function() {
        })
        .catch(failTest)
        .then(done);
    });

    it('should allow unlink of folder "foo"', function (done) {
      jsfs.unlink(new axiom$fs$path$$.default('foo')).then(function() {
        })
        .catch(failTest)
        .then(done);
    });
  });
});

//# sourceMappingURL=file_system.test.js.map