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
var axiom$core$error$$ = require("axiom/core/error"), axiom$fs$path$$ = require("axiom/fs/path"), axiom$fs$base$file_system$$ = require("axiom/fs/base/file_system"), axiom$fs$js$entry$$ = require("axiom/fs/js/entry"), axiom$fs$js$executable$$ = require("axiom/fs/js/executable"), axiom$fs$js$resolve_result$$ = require("axiom/fs/js/resolve_result");

/** @typedef StatResult$$module$axiom$fs$stat_result */
var StatResult;

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
var JsExecuteContext;

/** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
var JsFileSystem;

var JsDirectory = function(jsfs) {
  axiom$fs$js$entry$$.default.call(this, jsfs, 'D');

  /** @type {Object<string, (JsEntry|FileSystem)>} */
  this.entries_ = {};
};

exports["default"] = JsDirectory;

JsDirectory.prototype = Object.create(axiom$fs$js$entry$$.default.prototype);

/**
 * Resolve a Path object as far as possible.
 *
 * This may return a partial result which represents the depth to which
 * the path can be resolved.
 *
 * @param {Path} path An object representing the path to resolve.
 * @param {number=} opt_index The optional index into the path elements where
 *   we should start resolving.  Defaults to 0, the first path element.
 * @return {!JsResolveResult}
 */
JsDirectory.prototype.resolve = function(path, opt_index) {
  var index = opt_index || 0;

  if (!this.entryExists(path.elements[index])) {
    return new axiom$fs$js$resolve_result$$.default(
        path.elements.slice(0, index - 1),
        path.elements.slice(index - 1),
        this);
  }

  var entry = this.entries_[path.elements[index]] || null;

  if (index == path.elements.length - 1)
    return new axiom$fs$js$resolve_result$$.default(path.elements, null, entry);

  if (entry instanceof JsDirectory)
    return entry.resolve(path, index + 1);

  return new axiom$fs$js$resolve_result$$.default(path.elements.slice(0, index + 1),
                             path.elements.slice(index + 1),
                             entry);
};

/**
 * Return true if the named entry exists in this directory.
 *
 * @param {string} name
 * @return {!boolean}
 */
JsDirectory.prototype.entryExists = function(name) {
  return this.entries_.hasOwnProperty(name);
};

/**
 * Link the given entry into this directory.
 *
 * This method is not directly reachable through the FileSystem.
 *
 * @param {string} name  A name to give the entry.
 * @param {JsEntry} entry
 * @return {void}
 */
JsDirectory.prototype.link = function(name, entry) {
  if (!(entry instanceof axiom$fs$js$entry$$.default))
    throw new axiom$core$error$$.default.TypeMismatch('instanceof JsEntry', entry);

  if (this.entries_.hasOwnProperty(name))
    throw new axiom$core$error$$.default.Duplicate('directory-name', name);

  this.entries_[name] = entry;
};

/**
 * Link the given FileSystem into this directory.
 *
 * This method is not directly reachable through the FileSystem.
 *
 * @param {string} name  A name to give the file system.
 * @param {FileSystem} fileSystem
 * @return {void}
 */
JsDirectory.prototype.mount = function(name, fileSystem) {
  if (!(fileSystem instanceof axiom$fs$base$file_system$$.default)) {
    throw new axiom$core$error$$.default.TypeMismatch('instanceof FileSystem',
                                      fileSystem);
  }

  if (this.entries_.hasOwnProperty(name))
    throw new axiom$core$error$$.default.Duplicate('directory-name', name);

  this.entries_[name] = fileSystem;
};

/**
 * @param {Object<string, function(JsExecuteContext)>} executables
 * @return {void}
 */
JsDirectory.prototype.install = function(executables) {
  for (var name in executables) {
    var callback = executables[name];
    var sigil;
    var ary = /([^\(]*)\(([^\)]?)\)$/.exec(name);
    if (ary) {
      name = ary[1];
      sigil = ary[2];
      if (sigil && '$@%*'.indexOf(sigil) == -1)
        throw new axiom$core$error$$.default.Invalid('sigil', sigil);
    } else {
      sigil = callback['argSigil'] || '*';
    }

    this.link(name, new axiom$fs$js$executable$$.default(this.jsfs, callback, sigil));
  }
};

/**
 * Make a new, empty directory with the given name.
 *
 * @param {string} name
 * @return {!Promise<!JsDirectory>}
 */
JsDirectory.prototype.mkdir = function(name) {
  if (this.entryExists(name))
    return Promise.reject(new axiom$core$error$$.default.Duplicate('directory-name', name));

  var dir = new JsDirectory(this.jsfs);
  this.entries_[name] = dir;
  return Promise.resolve(dir);
};

/**
 * Remove the entry with the given name.
 *
 * @param {string} name
 * @return {!Promise}
 */
JsDirectory.prototype.unlink = function(name) {
  if (!this.entryExists(name))
    return Promise.reject(new axiom$core$error$$.default.NotFound('name', name));

  delete this.entries_[name];
  return Promise.resolve();
};

/**
 * Return the stat() result for each item in this directory.
 *
 * @return {!Promise<!Object<string, StatResult>>}
 */
JsDirectory.prototype.list = function() {
  var rv = {};
  var promises = [];

  for (var name in this.entries_) {
    var entry = this.entries_[name];
    var promise;

    if (entry instanceof axiom$fs$base$file_system$$.default) {
      promise = entry.stat(new axiom$fs$path$$.default('/'));
    } else {
      promise = entry.stat();
    }

    promises.push(promise.then(function(name, statResult) {
      rv[name] = statResult;
    }.bind(null, name)));
  }

  return Promise.all(promises).then(function() {
    return rv;
  });
};
exports.JsDirectory = JsDirectory;

//# sourceMappingURL=directory.js.map