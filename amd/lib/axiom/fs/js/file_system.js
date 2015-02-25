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
  "axiom/fs/js/file_system",
  ["axiom/core/error", "axiom/fs/path", "axiom/fs/stat_result", "axiom/fs/base/file_system", "axiom/fs/base/execute_context", "axiom/fs/js/directory", "axiom/fs/js/executable", "axiom/fs/js/execute_context", "axiom/fs/js/open_context", "axiom/fs/js/resolve_result", "axiom/fs/js/value", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$path$$,
    axiom$fs$stat_result$$,
    axiom$fs$base$file_system$$,
    axiom$fs$base$execute_context$$,
    axiom$fs$js$directory$$,
    axiom$fs$js$executable$$,
    axiom$fs$js$execute_context$$,
    axiom$fs$js$open_context$$,
    axiom$fs$js$resolve_result$$,
    axiom$fs$js$value$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var StatResult;
    StatResult = axiom$fs$stat_result$$["default"];
    var FileSystem;
    FileSystem = axiom$fs$base$file_system$$["default"];
    var ExecuteContext;
    ExecuteContext = axiom$fs$base$execute_context$$["default"];
    var JsDirectory;
    JsDirectory = axiom$fs$js$directory$$["default"];
    var JsExecutable;
    JsExecutable = axiom$fs$js$executable$$["default"];
    var JsExecuteContext;
    JsExecuteContext = axiom$fs$js$execute_context$$["default"];
    var JsOpenContext;
    JsOpenContext = axiom$fs$js$open_context$$["default"];
    var JsResolveResult;
    JsResolveResult = axiom$fs$js$resolve_result$$["default"];
    var JsValue;
    JsValue = axiom$fs$js$value$$["default"];

    /** @typedef {OpenMode$$module$axiom$fs$open_mode} */
    var OpenMode;

    /** @typedef {OpenContext$$module$axiom$fs$base$open_context} */
    var OpenContext;

    var JsFileSystem = function(opt_rootDirectory) {
      FileSystem.call(this);

      this.rootDirectory = opt_rootDirectory || new JsDirectory(this);
    };

    __es6_export__("JsFileSystem", JsFileSystem);
    __es6_export__("default", JsFileSystem);

    JsFileSystem.prototype = Object.create(FileSystem.prototype);

    /**
     * Resolve a path to a specific kind of JsEntry or reference to BaseFileSystem,
     * if possible.  See JsResolveResult for more information.
     *
     * @param {Path} path
     * @return {JsResolveResult}
     */
    JsFileSystem.prototype.resolve = function(path) {
      if (!path.elements.length)
        return new JsResolveResult(null, null, this.rootDirectory);

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
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (rv.entry instanceof FileSystem)
        return rv.entry.stat(new Path('/' + Path.join(rv.suffixList)));

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
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
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var parentPath = path.getParentPath();
      var targetName = path.getBaseName();

      var rv = this.resolve(parentPath);

      if (rv.entry instanceof FileSystem)
        return rv.entry.mkdir(new Path('/' + Path.join(rv.suffixList, targetName)));

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (!rv.entry.hasMode('D'))
        return Promise.reject(new AxiomError.TypeMismatch('dir', parentPath.spec));

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
          new AxiomError.Invalid('pathFrom', pathFrom.originalSpec));
      }
      var resolveFrom = this.resolve(pathFrom);

      if (!pathTo.isValid) {
        return Promise.reject(
          new AxiomError.Invalid('pathTo', pathTo.originalSpec));
      }
      var resolveTo = this.resolve(pathTo);

      if (!resolveFrom.isFinal) {
        if (resolveFrom.entry instanceof FileSystem) {
          // If the source resolution stopped on a file system, then the target
          // must stop on the same file system.  If not, this is an attempt to move
          // across file systems.
          if (resolveTo.entry == resolveFrom.entry) {
            return resolveFrom.entry.move(
                new Path(Path.join(resolveFrom.suffixList)),
                new Path(Path.join(resolveTo.suffixList)));
          }

          return Promise.reject(
            new AxiomError.Invalid('filesystem', pathFrom.originalSpec));
        }

        // Otherwise, if the source resolve was not final then the source path
        // doesn't exist.
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(resolveTo.prefixList.join('/'),
                              resolveTo.suffixList[0])));
      }

      var targetName;

      // If the target path resolution stops (finally, or otherwise) on a
      // filesystem, that's trouble.
      if (resolveTo.entry instanceof FileSystem) {
        return Promise.reject(
          new AxiomError.Invalid('filesystem', pathTo.originalSpec));
      }

      if (resolveTo.isFinal) {
        // If target path resolution makes it to the end and finds something other
        // than a directory, that's trouble.
        if (!(resolveTo.entry instanceof JsDirectory)) {
          return Promise.reject(
            new AxiomError.Duplicate('pathTo', pathTo.originalSpec));
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
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(resolveFrom.prefixList.join('/'),
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
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var parentPath = path.getParentPath();
      var targetName = path.getBaseName();

      var rv = this.resolve(parentPath);
      if (rv.entry instanceof FileSystem) {
        return rv.entry.unlink(
           new Path('/' + Path.join(rv.suffixList, targetName)));
      }

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (rv.entry instanceof JsDirectory)
        return rv.entry.unlink(targetName);

      return Promise.reject(new AxiomError.TypeMismatch('dir', parentPath.spec));
    };

    /**
     * @override
     * @param {Path} path
     * @return {!Promise<!Object<string, StatResult>>}
     */
    JsFileSystem.prototype.list = function(path) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (rv.entry instanceof FileSystem)
        return rv.entry.list(new Path('/' + Path.join(rv.suffixList)));

      if (!rv.isFinal) {
        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (!(rv.entry instanceof JsDirectory)) {
        return Promise.reject(
          new AxiomError.TypeMismatch('dir', path.originalSpec));
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
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (!rv.isFinal) {
        if (rv.entry instanceof FileSystem) {
          return rv.entry.createExecuteContext(
            new Path('/' + Path.join(rv.suffixList)), arg);
        }

        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (rv.entry instanceof JsExecutable) {
        /** @type {!ExecuteContext} */
        var cx = new JsExecuteContext(this, path, rv.entry, arg);
        return Promise.resolve(cx);
      }

      return Promise.reject(
        new AxiomError.TypeMismatch('executable', path.originalSpec));
    };

    /**
     * @override
     * @param {Path} path
     * @param {string|OpenMode} mode
     * @return {!Promise<!OpenContext>}
     */
    JsFileSystem.prototype.createOpenContext = function(path, mode) {
      if (!path.isValid)
        return Promise.reject(new AxiomError.Invalid('path', path.originalSpec));

      var rv = this.resolve(path);
      if (!rv.isFinal) {
        if (rv.entry instanceof FileSystem) {
          return rv.entry.createOpenContext(
            new Path('/' + Path.join(rv.suffixList)), mode);
        }

        return Promise.reject(new AxiomError.NotFound(
            'path', Path.join(rv.prefixList.join('/'), rv.suffixList[0])));
      }

      if (rv.entry instanceof JsValue) {
        /** @type {!OpenContext} */
        var cx = new JsOpenContext(this, path, rv.entry, mode);
        return Promise.resolve(cx);
      }

      return Promise.reject(
        new AxiomError.TypeMismatch('openable', path.originalSpec));
    };
  }
);

//# sourceMappingURL=file_system.js.map