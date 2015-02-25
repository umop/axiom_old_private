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
var axiom$core$error$$ = require("axiom/core/error"), axiom$fs$path$$ = require("axiom/fs/path"), axiom$fs$base$execute_context$$ = require("axiom/fs/base/execute_context"), axiom$fs$base$file_system$$ = require("axiom/fs/base/file_system"), axiom$fs$js$directory$$ = require("axiom/fs/js/directory"), axiom$fs$dom$execute_context$$ = require("axiom/fs/dom/execute_context"), axiom$fs$dom$open_context$$ = require("axiom/fs/dom/open_context"), axiom$fs$js$resolve_result$$ = require("axiom/fs/js/resolve_result"), axiom$fs$dom$domfs_util$$ = require("axiom/fs/dom/domfs_util");

/** @typedef OpenContext$$module$axiom$fs$base$open_context */
var OpenContext;

/** @typedef OpenMode$$module$axiom$fs$open_mode */
var OpenMode;

/** @typedef StatResult$$module$axiom$fs$stat_result */
var StatResult;

var DomFileSystem = function(fileSystem) {
  this.fileSystem = fileSystem;

  axiom$fs$base$file_system$$.default.call(this);
};

exports["default"] = DomFileSystem;

DomFileSystem.prototype = Object.create(axiom$fs$base$file_system$$.default.prototype);

DomFileSystem.available = function() {
  return !!(window.requestFileSystem || window.webkitRequestFileSystem);
}

/**
 * Mounts a given type if dom filesystem at /jsDir/mountName
 *
 * @param {string} type temporary or permanent dom filesystem.
 * @param {string} mountName
 * @param {JsDirectory} jsDir
 * @return {Promise<DomFileSystem>}
 */
DomFileSystem.mount = function(type, mountName, jsDir) {
  return new Promise(function(resolve, reject) {
    if (!window.requestFileSystem && !window.webkitRequestFileSystem) {
      return resolve(null);
    }
    var requestFs = (window.requestFileSystem ||
                     window.webkitRequestFileSystem).bind(window);

    // This is currently ignored.
    var capacity = 1024 * 1024 * 1024;

    var onFileSystemFound = function(fs) {
      var domfs = new DomFileSystem(fs);
      jsDir.mount(mountName, domfs);
      resolve(domfs);
    };

    var onFileSystemError = function(e) {
      reject(new axiom$core$error$$.default.Runtime(e));
    };

    if (type == 'temporary') {
      var temporaryStorage = navigator['webkitTemporaryStorage'];
      temporaryStorage.requestQuota(capacity, function(bytes) {
          requestFs(window.TEMPORARY, bytes,
                    onFileSystemFound, onFileSystemError);
        }, onFileSystemError);
    } else {
      var persistentStorage = navigator['webkitPersistentStorage'];
      persistentStorage.requestQuota(capacity, function(bytes) {
        requestFs(window.PERSISTENT, bytes,
                    onFileSystemFound, onFileSystemError);
        }, onFileSystemError);
    }
  });
};

/**
 * This method is not directly reachable through the FileSystemBinding.
 *
 * @param {Path} path
 * @return {Promise<JsResolveResult>}
 */
DomFileSystem.prototype.resolve = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  //TODO(grv): resolve directories and read mode bits.
  var domfs = this.fileSystem;
  return new Promise(function(resolve, reject) {
    domfs.root.getFile(path.spec, {create: true}, resolve, reject);
  });
};

/**
 * @override
 * @param {Path} path
 * @return {!Promise<!StatResult>}
 */
DomFileSystem.prototype.stat = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  return axiom$fs$dom$domfs_util$$.default.getFileOrDirectory(this.fileSystem.root, path.spec).then(
      function(r) {
    return axiom$fs$dom$domfs_util$$.default.statEntry(r);
  });
};

/**
 * This version of mkdir_ is attached to the FileSystemBinding to ensure that
 * the DomDirectory returned by `mkdir` doesn't leak through the binding.
 *
 * @param {Path} path
 * @return {Promise}
 */
DomFileSystem.prototype.mkdir_ = function(path) {
  return this.mkdir(path).then(function() {
    return null;
  });
};

/**
 * @override
 * @param {Path} path
 * @return {!Promise<undefined>}
 */
DomFileSystem.prototype.mkdir = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  return new Promise(function(resolve, reject) {
    var parentPath = path.getParentPath();
    var targetName = path.getBaseName();

    var onDirectoryFound = function(dir) {
      return axiom$fs$dom$domfs_util$$.default.mkdir(dir, targetName).then(function(r) {
        resolve(r);
      }).catch (function(e) {
        reject(e);
      });
    };

    var onFileError = axiom$fs$dom$domfs_util$$.default.rejectFileError.bind(null, path.spec, reject);

    var parentPathSpec = parentPath.spec;

    //TODO(grv): This should be taken care by Path class.
    if (parentPathSpec === '' || parentPathSpec == null) {
      parentPathSpec = '/';
    }

    this.fileSystem.root.getDirectory(parentPath.spec, {create: false},
        onDirectoryFound, onFileError);
  }.bind(this));
};

/**
 * Create an alias from a path on this file system to a different path on this
 * file system.
 *
 * If the "from" path is on a different fs, we'll forward the call.  If "from"
 * is on this fs but "to" is not, the move will fail.
 *
 * The destination path must refer to a file that does not yet exist, inside a
 * directory that does.
 *
 * @override
 * @param {Path} pathFrom
 * @param {Path} pathTo
 * @return {!Promise<undefined>}
 */
DomFileSystem.prototype.alias = function(pathFrom, pathTo) {
  return Promise.reject(new axiom$core$error$$.default.NotImplemented('To be implemented.'));
};

/**
 * Move an entry from a path on this file system to a different path on this
 * file system.
 *
 * If the "from" path is on a different fs, we'll forward the call.  If "from"
 * is on this fs but "to" is not, the move will fail.
 *
 * The destination path must refer to a file that does not yet exist, inside a
 * directory that does.
 *
 * @override
 * @param {Path} fromPath
 * @param {Path} toPath
 * @return {!Promise<undefined>}
 */
DomFileSystem.prototype.move = function(fromPath, toPath) {
  return Promise.reject(new axiom$core$error$$.default.NotImplemented('To be implemented.'));
};

/**
 * @override
 * @param {Path} path
 * @return {Promise}
 */
DomFileSystem.prototype.unlink = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  return new Promise(function(resolve, reject) {
    var parentPath = path.getParentPath();
    var targetName = path.getBaseName();

    var onDirectoryFound = function(dir) {
      return axiom$fs$dom$domfs_util$$.default.remove(dir, targetName).then(function(r) {
        resolve(r);
      }).catch (function(e) {
        reject(e);
      });
    };

    var onFileError = axiom$fs$dom$domfs_util$$.default.rejectFileError.bind(null, path.spec, reject);

    var parentPathSpec = parentPath.spec;

    //TODO(grv): This should be taken care by Path class.
    if (parentPathSpec === '' || parentPathSpec == null) {
      parentPathSpec = '/';
    }

    this.fileSystem.root.getDirectory(parentPathSpec, {create: false},
        onDirectoryFound, onFileError);
  }.bind(this));
};

/**
 * @override
 * @param {Path} path
 * @return {!Promise<!Object<string, StatResult>>}
 */
DomFileSystem.prototype.list = function(path) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  return axiom$fs$dom$domfs_util$$.default.listDirectory(this.fileSystem.root, path.spec).then(
    function(entries) {
      return Promise.resolve(entries);
    });
};

/**
 * @override
 * @param {Path} path
 * @param {*} arg
 * @return {!Promise<!ExecuteContext>}
 */
DomFileSystem.prototype.createExecuteContext = function(path, arg) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  /** @type {!ExecuteContext} */
  var cx = new axiom$fs$dom$execute_context$$.default(this, path, arg);
  return Promise.resolve(cx);
};

/**
 * @override
 * @param {Path} path
 * @param {string|OpenMode} mode
 * @return {!Promise<!OpenContext>}
 */
DomFileSystem.prototype.createOpenContext = function(path, mode) {
  if (!path.isValid)
    return Promise.reject(new axiom$core$error$$.default.Invalid('path', path.originalSpec));

  /** @type {!OpenContext} */
  var cx = new axiom$fs$dom$open_context$$.default(this, path, mode);
  return Promise.resolve(cx);
};
exports.DomFileSystem = DomFileSystem;

//# sourceMappingURL=file_system.js.map