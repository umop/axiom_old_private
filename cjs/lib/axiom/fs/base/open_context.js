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
var axiom$core$completer$$ = require("axiom/core/completer"), axiom$core$ephemeral$$ = require("axiom/core/ephemeral"), axiom$core$error$$ = require("axiom/core/error"), axiom$core$event$$ = require("axiom/core/event"), axiom$fs$open_mode$$ = require("axiom/fs/open_mode"), axiom$fs$path$$ = require("axiom/fs/path"), axiom$fs$read_result$$ = require("axiom/fs/read_result"), axiom$fs$write_result$$ = require("axiom/fs/write_result");

/** @typedef {DataType$$module$axiom$fs$data_type} */
var DataType;

/** @typedef {FileSystem$$module$axiom$fs$base$file_system} */
var FileSystem;

/** @typedef {SeekWhence$$module$axiom$fs$seek_whence} */
var SeekWhence;

var OpenContext = function(fileSystem, path, mode) {
  axiom$core$ephemeral$$.default.call(this);

  /** @type {FileSystem} */
  this.fileSystem = fileSystem;

  /** @type {Path} */
  this.path = path;

  if (typeof mode == 'string')
    mode = axiom$fs$open_mode$$.default.fromString(mode);

  /** @type {OpenMode} */
  this.mode = mode;

  // If the parent file system is closed, we close too.
  this.dependsOn(this.fileSystem);

  /**
   * @private @type {Completer}
   */
  this.openCompleter_ = null;
};

exports["default"] = OpenContext;

OpenContext.prototype = Object.create(axiom$core$ephemeral$$.default.prototype);

/**
 * Initiate the open.
 *
 * Returns a promise that completes when the open is no longer valid.
 *
 * @return {!Promise<undefined>}
 */
OpenContext.prototype.open = function() {
  this.assertEphemeral('Wait');
  return this.ephemeralPromise;
};

/**
 * @param {number} offset
 * @param {SeekWhence} whence
 * @return {!Promise<undefined>}
 */
OpenContext.prototype.seek = function(offset, whence) {
  return Promise.resolve();
};

/**
 * @param {number} offset
 * @param {SeekWhence} whence
 * @param {?DataType} dataType
 * @return {!Promise<!ReadResult>}
 */
OpenContext.prototype.read = function(offset, whence, dataType) {
  if (!this.mode.read)
    return Promise.reject(new axiom$core$error$$.default.Invalid('mode.read', this.mode.read));

  return Promise.resolve(new axiom$fs$read_result$$.default(offset, whence, dataType));
};

/**
 * @param {number} offset
 * @param {SeekWhence} whence
 * @param {?DataType} dataType
 * @param {*} data
 * @return {!Promise<!WriteResult>}
 */
OpenContext.prototype.write = function(offset, whence, dataType, data) {
  if (!this.mode.write) {
    return Promise.reject(new axiom$core$error$$.default.Invalid('mode.write',
                                                 this.mode.write));
  }

  return Promise.resolve(new axiom$fs$write_result$$.default(offset, whence, dataType));
};
exports.OpenContext = OpenContext;

//# sourceMappingURL=open_context.js.map