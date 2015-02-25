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

define(
  "axiom/fs/node/file_system",
  ["axiom/core/error", "axiom/fs/path", "axiom/fs/base/execute_context", "axiom/fs/base/file_system", "axiom/fs/js/directory", "axiom/fs/node/execute_context", "axiom/fs/node/open_context", "axiom/fs/js/resolve_result", "axiom/fs/node/nodefs_util", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$path$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$base$file_system$$,
    axiom$fs$js$directory$$,
    axiom$fs$node$execute_context$$,
    axiom$fs$node$open_context$$,
    axiom$fs$js$resolve_result$$,
    axiom$fs$node$nodefs_util$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var FileSystem;
    FileSystem = axiom$fs$base$file_system$$["default"];
    var JsDirectory;
    JsDirectory = axiom$fs$js$directory$$["default"];
    var NodeExecuteContext;
    NodeExecuteContext = axiom$fs$node$execute_context$$["default"];
    var NodeOpenContext;
    NodeOpenContext = axiom$fs$node$open_context$$["default"];
    var JsResolveResult;
    JsResolveResult = axiom$fs$js$resolve_result$$["default"];
    var nodefsUtil;
    nodefsUtil = axiom$fs$node$nodefs_util$$["default"];

    /** @typedef OpenContext$$module$axiom$fs$base$open_context */
    var OpenContext;

    /** @typedef OpenMode$$module$axiom$fs$open_mode */
    var OpenMode;

    /** @typedef StatResult$$module$axiom$fs$stat_result */
    var StatResult;

    var NodeFileSystem = function(fileSystem) {
      this.fileSystem = fileSystem;

      FileSystem.call(this);
    };

    __es6_export__("NodeFileSystem", NodeFileSystem);
    __es6_export__("default", NodeFileSystem);

    NodeFileSystem.prototype = Object.create(FileSystem.prototype);

    NodeFileSystem.available = function() {
      return true;
    }

    /**
     * Mounts a given type if node filesystem at /jsDir/mountName
     *
     * @param {FileSystem} nodefs a node filesystem object.
     * @param {string} mountName
     * @param {JsDirectory} jsDir
     */
    NodeFileSystem.mount = function(fs, mountName, jsDir) {
        var nodefs = new NodeFileSystem(fs);
        jsDir.mount(mountName, nodefs);
        return nodefs;
    };

    /**
     * This method is not directly reachable through the FileSystemBinding.
     *
     * @param {Path} path
     * @return {Promise<JsResolveResult>}
     */
    NodeFileSystem.prototype.resolve = function(path) {
      //TODO(grv): resolve directories and read mode bits.
      var nodefs = this.fileSystem;
      return new Promise(function(resolve, reject) {
        nodefs.root.getFile(path.spec, {create: true}, resolve, reject);
      });
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!StatResult>}
     */
    NodeFileSystem.prototype.stat = function(path) {
      return new Promise(function(resolve, reject) {
        var statCb = function(err, stat) {
          resolve(nodefsUtil.filterStat(stat));
        };
        this.fileSystem.stat(path.spec, statCb);
      }.bind(this));
    };

    /**
     * This version of mkdir_ is attached to the FileSystemBinding to ensure that
     * the NodeDirectory returned by `mkdir` doesn't leak through the binding.
     *:/m
     * @param {Path} path
     * @return {Promise}
     */
    NodeFileSystem.prototype.mkdir_ = function(path) {
      return this.mkdir(path).then(function() {
        return null;
      });
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<undefined>}
     */
    NodeFileSystem.prototype.mkdir = function(path) {

      return new Promise(function(resolve, reject) {
        var cb = function(err, dir) {
          console.log(dir);
          resolve(null);
        };

        this.fileSystem.mkdir([path.spec], cb);

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
    NodeFileSystem.prototype.alias = function(pathFrom, pathTo) {
        return Promise.reject(new AxiomError.NotImplemented('To be implemented.'));
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
     * @param {Path} fromSpec
     * @param {Path} toSpec
     * @return {!Promise<undefined>}
     */
    NodeFileSystem.prototype.move = function(fromSpec, toSpec) {
      return Promise.reject(new AxiomError.NotImplemented('To be implemented.'));
    };

    /**
     * @override
     * @param {Path} path
     * @return {Promise}
     */
    NodeFileSystem.prototype.unlink = function(path) {

      return new Promise(function(resolve, reject) {
        this.fileSystem.unlink(path.spec, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        });

      }.bind(this));
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!Object<string, StatResult>>}
     */
    NodeFileSystem.prototype.list = function(path) {
      return nodefsUtil.listDirectory(this.fileSystem, path.spec).then(
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
    NodeFileSystem.prototype.createExecuteContext = function(path, arg) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      /** @type {!ExecuteContext} */
      var cx = new NodeExecuteContext(this, path, arg);
      return Promise.resolve(cx);
    };

    /**
     * @override
     * @param {Path} path
     * @param {string|OpenMode} mode
     * @return {!Promise<!OpenContext>}
     */
    NodeFileSystem.prototype.createOpenContext = function(path, mode) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      /** @type {!OpenContext} */
      var cx = new NodeOpenContext(this, path, mode);
      return Promise.resolve(cx);
    };
  }
);

//# sourceMappingURL=file_system.js.map