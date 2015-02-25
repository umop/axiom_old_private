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
var axiom$core$error$$ = require("axiom/core/error"), axiom$fs$path$$ = require("axiom/fs/path"), axiom$fs$stat_result$$ = require("axiom/fs/stat_result"), axiom$fs$base$file_system$$ = require("axiom/fs/base/file_system"), axiom$fs$base$execute_context$$ = require("axiom/fs/base/execute_context"), axiom$fs$js$directory$$ = require("axiom/fs/js/directory"), axiom$fs$js$executable$$ = require("axiom/fs/js/executable"), axiom$fs$js$execute_context$$ = require("axiom/fs/js/execute_context"), axiom$fs$js$open_context$$ = require("axiom/fs/js/open_context"), axiom$fs$js$resolve_result$$ = require("axiom/fs/js/resolve_result"), axiom$fs$js$value$$ = require("axiom/fs/js/value");

/** @typedef {OpenMode$$module$axiom$fs$open_mode} */
var OpenMode;

/** @typedef {OpenContext$$module$axiom$fs$base$open_context} */
var OpenContext;

var JsFileSystem = function(opt_rootDirectory) {
  axiom$fs$base$file_system$$.default.call(this);

  this.rootDirectory = opt_rootDirectory || new axiom$fs$js$directory$$.default(this);
};

exports["default"] = JsFileSystem;

JsFileSystem.prototype = Object.create(axiom$fs$base$file_system$$.default.prototype);

/**
 * Resolve a path to a specific kind of JsEntry or reference to BaseFileSystem,
 * if possible.  See JsResolveResult for more information.
 *
 * @param {Path} path
 * @return {JsResolveResult}
 */
JsFileSystem.prototype.resolve = function(path) {
  if (!path.elements.length)
    return new axiom$fs$js$resolve_result$$.default(null, null, this.rootDirectory);

  return this.rootDirectory.resolve(path, 0);
};

/**
 * @override
 * @param {Path} path
 * @return {!Promise<!StatResult>}
 */
JsFileSystem.prototype.stat = function(path) {
  if (!path)
    return this.rootDirectory.stat();

  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  var rv = this.resolve(path);
  if (rv.entry instanceof axiom$fs$base$file_system$$.default)
    return rv.entry.stat(new axiom$fs$path$$.default('/' + axiom$fs$path$$.default.join(rv.suffixList)));

  if (!rv.isFinal) {
    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(rv.prefixList.join('/'), rv.suffixList[0])));
  }

  return rv.entry.stat();
};

/**
 * @override
 * @param {Path} path
 * @return {!Promise<undefined>}
 */
JsFileSystem.prototype.mkdir = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  var parentPath = path.getParentPath();
  var targetName = path.getBaseName();

  var rv = this.resolve(parentPath);

  if (rv.entry instanceof axiom$fs$base$file_system$$.default)
    return rv.entry.mkdir(new axiom$fs$path$$.default('/' + axiom$fs$path$$.default.join(rv.suffixList, targetName)));

  if (!rv.isFinal) {
    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(rv.prefixList.join('/'), rv.suffixList[0])));
  }

  if (!rv.entry.hasMode('D'))
    return Promise.reject(new axiom$core$error$$.default.TypeMismatch('dir', parentPath.spec));

  return rv.entry.mkdir(targetName).then(function(jsdir) { return null; });
};

/**
 * @override
 * @param {Path} pathFrom
 * @param {Path} pathTo
 * @return {!Promise<undefined>}
 */
JsFileSystem.prototype.alias = function(pathFrom, pathTo) {
  if (!pathFrom.isValid) {
    return Promise.reject(
      new axiom$core$error$$.default.Invalid('pathFrom', pathFrom.originalSpec));
  }
  var resolveFrom = this.resolve(pathFrom);

  if (!pathTo.isValid) {
    return Promise.reject(
      new axiom$core$error$$.default.Invalid('pathTo', pathTo.originalSpec));
  }
  var resolveTo = this.resolve(pathTo);

  if (!resolveFrom.isFinal) {
    if (resolveFrom.entry instanceof axiom$fs$base$file_system$$.default) {
      // If the source resolution stopped on a file system, then the target
      // must stop on the same file system.  If not, this is an attempt to move
      // across file systems.
      if (resolveTo.entry == resolveFrom.entry) {
        return resolveFrom.entry.move(
            new axiom$fs$path$$.default(axiom$fs$path$$.default.join(resolveFrom.suffixList)),
            new axiom$fs$path$$.default(axiom$fs$path$$.default.join(resolveTo.suffixList)));
      }

      return Promise.reject(
        new axiom$core$error$$.default.Invalid('filesystem', pathFrom.originalSpec));
    }

    // Otherwise, if the source resolve was not final then the source path
    // doesn't exist.
    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(resolveTo.prefixList.join('/'),
                          resolveTo.suffixList[0])));
  }

  var targetName;

  // If the target path resolution stops (finally, or otherwise) on a
  // filesystem, that's trouble.
  if (resolveTo.entry instanceof axiom$fs$base$file_system$$.default) {
    return Promise.reject(
      new axiom$core$error$$.default.Invalid('filesystem', pathTo.originalSpec));
  }

  if (resolveTo.isFinal) {
    // If target path resolution makes it to the end and finds something other
    // than a directory, that's trouble.
    if (!(resolveTo.entry instanceof axiom$fs$js$directory$$.default)) {
      return Promise.reject(
        new axiom$core$error$$.default.Duplicate('pathTo', pathTo.originalSpec));
    }

    // But if path resolution stops on a directory, that just means we should
    // take the target name from the source.
    targetName = pathFrom.getBaseName();

  } else if (resolveTo.suffixList.length == 1) {
    // If the resolution was not final then there should be a single name in
    // the suffix list, which we'll use as the target name.
    targetName = pathFrom.getBaseName();

  } else {
    // If there's more than one item in the suffix list then the path refers
    // to non-existent directories.
    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(resolveFrom.prefixList.join('/'),
                          resolveFrom.suffixList[0])));
  }

  // Link first, then unlink.  Failure mode is two copies of the file rather
  // than zero.
  return resolveTo.entry.link(targetName, resolveFrom.entry);
};

/**
 * @override
 * @param {Path} fromPath
 * @param {Path} toPath
 * @return {!Promise<undefined>}
 */
JsFileSystem.prototype.move = function(fromPath, toPath) {
  return this.alias(fromPath, toPath).then(
    function() {
      return this.unlink(fromPath);
    });
};

/**
 * @override
 * @param {Path} path
 * @return {Promise}
 */
JsFileSystem.prototype.unlink = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  var parentPath = path.getParentPath();
  var targetName = path.getBaseName();

  var rv = this.resolve(parentPath);
  if (rv.entry instanceof axiom$fs$base$file_system$$.default) {
    return rv.entry.unlink(
       new axiom$fs$path$$.default('/' + axiom$fs$path$$.default.join(rv.suffixList, targetName)));
  }

  if (!rv.isFinal) {
    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(rv.prefixList.join('/'), rv.suffixList[0])));
  }

  if (rv.entry instanceof axiom$fs$js$directory$$.default)
    return rv.entry.unlink(targetName);

  return Promise.reject(new axiom$core$error$$.default.TypeMismatch('dir', parentPath.spec));
};

/**
 * @override
 * @param {Path} path
 * @return {!Promise<!Object<string, StatResult>>}
 */
JsFileSystem.prototype.list = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  var rv = this.resolve(path);
  if (rv.entry instanceof axiom$fs$base$file_system$$.default)
    return rv.entry.list(new axiom$fs$path$$.default('/' + axiom$fs$path$$.default.join(rv.suffixList)));

  if (!rv.isFinal) {
    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(rv.prefixList.join('/'), rv.suffixList[0])));
  }

  if (!(rv.entry instanceof axiom$fs$js$directory$$.default)) {
    return Promise.reject(
      new axiom$core$error$$.default.TypeMismatch('dir', path.originalSpec));
  }

  return rv.entry.list();
};

/**
 * @override
 * @param {Path} path
 * @param {*} arg
 * @return {!Promise<!ExecuteContext>}
 */
JsFileSystem.prototype.createExecuteContext = function(path, arg) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  var rv = this.resolve(path);
  if (!rv.isFinal) {
    if (rv.entry instanceof axiom$fs$base$file_system$$.default) {
      return rv.entry.createExecuteContext(
        new axiom$fs$path$$.default('/' + axiom$fs$path$$.default.join(rv.suffixList)), arg);
    }

    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(rv.prefixList.join('/'), rv.suffixList[0])));
  }

  if (rv.entry instanceof axiom$fs$js$executable$$.default) {
    /** @type {!ExecuteContext} */
    var cx = new axiom$fs$js$execute_context$$.default(this, path, rv.entry, arg);
    return Promise.resolve(cx);
  }

  return Promise.reject(
    new axiom$core$error$$.default.TypeMismatch('executable', path.originalSpec));
};

/**
 * @override
 * @param {Path} path
 * @param {string|OpenMode} mode
 * @return {!Promise<!OpenContext>}
 */
JsFileSystem.prototype.createOpenContext = function(path, mode) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  var rv = this.resolve(path);
  if (!rv.isFinal) {
    if (rv.entry instanceof axiom$fs$base$file_system$$.default) {
      return rv.entry.createOpenContext(
        new axiom$fs$path$$.default('/' + axiom$fs$path$$.default.join(rv.suffixList)), mode);
    }

    return Promise.reject(new axiom$core$error$$.default.NotFound(
        'path', axiom$fs$path$$.default.join(rv.prefixList.join('/'), rv.suffixList[0])));
  }

  if (rv.entry instanceof axiom$fs$js$value$$.default) {
    /** @type {!OpenContext} */
    var cx = new axiom$fs$js$open_context$$.default(this, path, rv.entry, mode);
    return Promise.resolve(cx);
  }

  return Promise.reject(
    new axiom$core$error$$.default.TypeMismatch('openable', path.originalSpec));
};
exports.JsFileSystem = JsFileSystem;

//# sourceMappingURL=file_system.js.map