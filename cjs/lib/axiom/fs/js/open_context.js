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
var axiom$core$error$$ = require("axiom/core/error"), axiom$fs$base$open_context$$ = require("axiom/fs/base/open_context"), axiom$fs$js$entry$$ = require("axiom/fs/js/entry"), axiom$fs$path$$ = require("axiom/fs/path");

/** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
var JsFileSystem;

/** @typedef JsValue$$module$axiom$fs$js$value */
var JsValue;

/** @typedef {OpenMode$$module$axiom$fs$open_mode} */
var OpenMode;

var JsOpenContext = function(jsfs, path, entry, mode) {
  axiom$fs$base$open_context$$.default.call(this, jsfs, path, mode);

  /** @type {JsFileSystem} */
  this.jsfs = jsfs;
  /** @type {Path} */
  this.path = path;
  /** @type {JsValue} */
  this.targetEntry = entry;
};

exports["default"] = JsOpenContext;

JsOpenContext.prototype = Object.create(JsOpenContext.prototype);

/**
 * @override
 */
JsOpenContext.prototype.open = function() {
  if (!(this.targetEntry instanceof JsValue)) {
    return Promise.reject(
        new axiom$core$error$$.default.TypeMismatch('openable', this.path.spec));
  }

  return axiom$fs$base$open_context$$.default.prototype.open.call(this);
};

/**
 * @override
 */
JsOpenContext.prototype.seek = function(offset, whence) {
  if (!(this.targetEntry.mode & axiom$fs$path$$.default.Mode.K)) {
    return Promise.reject(
        new axiom$core$error$$.default.TypeMismatch('seekable', this.path.spec));
  }

  return axiom$fs$base$open_context$$.default.prototype.seek.apply(this, arguments);
};

/**
 * @override
 */
JsOpenContext.prototype.read = function(offset, whence, dataType) {
  if (!(this.targetEntry.mode & axiom$fs$path$$.default.Mode.R)) {
    return Promise.reject(
        new axiom$core$error$$.default.TypeMismatch('readable', this.path.spec));
  }

  return axiom$fs$base$open_context$$.default.prototype.read.apply(this, arguments).then(
      function(readResult) {
        return this.targetEntry.read(readResult);
      }.bind(this));
};

/**
 * @override
 */
JsOpenContext.prototype.write = function(offset, whence, dataType, data) {
  if (!(this.targetEntry.mode & axiom$fs$path$$.default.Mode.W)) {
    return Promise.reject(
        new axiom$core$error$$.default.TypeMismatch('writable', this.path.spec));
  }

  return axiom$fs$base$open_context$$.default.prototype.write.apply(this, arguments).then(
    function(writeResult) {
      return this.targetEntry.write(writeResult, data);
    }.bind(this));
};
exports.JsOpenContext = JsOpenContext;

//# sourceMappingURL=open_context.js.map