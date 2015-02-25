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
var axiom$fs$path$$ = require("axiom/fs/path");

var failTest = function(error) {
  expect(error).toBeUndefined();
};

describe('Path', function () {
  it('should be available as a module', function () {
    expect(axiom$fs$path$$.default).toBeDefined();
  });

  it('should not allow undefined path', function () {
    expect(function() {
      /** @type {string} */
      var x;
      var p = new axiom$fs$path$$.default(x);
    }).toThrow();
  });

  it('should allow empty path', function () {
    var p = new axiom$fs$path$$.default('');
    expect(p).toBeDefined();
    expect(p.isValid).toBe(true);
  });

  it('should allow root path', function () {
    var p = new axiom$fs$path$$.default('/');
    expect(p).toBeDefined();
    expect(p.isValid).toBe(true);
    expect(p.elements).toEqual([]);
  });

  it('should return null for parent of root path', function () {
    var p = new axiom$fs$path$$.default('/').getParentPath();
    expect(p).toBe(null);
  });

  it('should split path with multiple elements', function () {
    var p = new axiom$fs$path$$.default('foo/bar');
    expect(p).toBeDefined();
    expect(p.isValid).toBe(true);
    expect(p.elements).toEqual(['foo', 'bar']);
  });

  it('should split path with multiple elements', function () {
    var p = new axiom$fs$path$$.default('/foo/bar');
    expect(p).toBeDefined();
    expect(p.isValid).toBe(true);
    expect(p.elements).toEqual(['foo', 'bar']);
  });

  it('should return the base name as a string', function () {
    var p = new axiom$fs$path$$.default('/foo/bar/blah').getBaseName();
    expect(p).toBeDefined();
    expect(p).toEqual('blah');
  });
});

//# sourceMappingURL=path.test.js.map