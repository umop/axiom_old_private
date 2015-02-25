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

define(
  "axiom/fs/base/file_system",
  ["axiom/core/error", "axiom/core/ephemeral", "axiom/fs/base/open_context", "axiom/fs/path", "axiom/fs/seek_whence", "axiom/fs/data_type", "exports"],
  function(
    axiom$core$error$$,
    axiom$core$ephemeral$$,
    axiom$fs$base$open_context$$,
    axiom$fs$path$$,
    axiom$fs$seek_whence$$,
    axiom$fs$data_type$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Ephemeral;
    Ephemeral = axiom$core$ephemeral$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var SeekWhence;
    SeekWhence = axiom$fs$seek_whence$$["default"];
    var DataType;
    DataType = axiom$fs$data_type$$["default"];

    /** @typedef {ExecuteContext$$module$axiom$fs$base$execute_context} */
    var ExecuteContext;

    /** @typedef {OpenMode$$module$axiom$fs$open_mode} */
    var OpenMode;

    /** @typedef {ReadResult$$module$axiom$fs$read_result} */
    var ReadResult;

    /** @typedef {WriteResult$$module$axiom$fs$write_result} */
    var WriteResult;

    /** @typedef {StatResult$$module$axiom$fs$stat_result} */
    var StatResult;

    var abstract = function() { throw new AxiomError.AbstractCall() };

    var FileSystem = function() {
      Ephemeral.call(this);
    };

    __es6_export__("FileSystem", FileSystem);
    __es6_export__("default", FileSystem);

    FileSystem.prototype = Object.create(Ephemeral.prototype);

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
     * @param {Path} pathFrom
     * @param {Path} pathTo
     * @return {!Promise<undefined>}
     */
    FileSystem.prototype.alias = function(pathFrom, pathTo) {
      abstract();
    };

    /**
     * @param {Path} path
     * @param {*} arg
     * @return {!Promise<!ExecuteContext>}
     */
    FileSystem.prototype.createExecuteContext = function(path, arg) {
      abstract();
    };

    /**
     * @param {Path} path
     * @param {string|OpenMode} mode
     * @return {!Promise<!OpenContext>}
     */
    FileSystem.prototype.createOpenContext = function(path, mode) {
      abstract();
    };

    /**
     * @param {Path} path
     * @return {!Promise<!Object<string, StatResult>>}
     */
    FileSystem.prototype.list = function(path) {
      abstract();
    };

    /**
     * @param {Path} path
     * @return {!Promise<undefined>}
     */
    FileSystem.prototype.mkdir = function(path) {
      abstract();
    };

    /**
     * Move an entry from a path on a file system to a different path on the
     * same file system.
     *
     * The destination path must refer to a file that does not yet exist, inside a
     * directory that does.
     *
     * @param {Path} fromPath
     * @param {Path} toPath
     * @return {!Promise<undefined>}
     */
    FileSystem.prototype.move = function(fromPath, toPath) {
      abstract();
    };

    /**
     * @param {Path} path
     * @return {!Promise<!StatResult>}
     */
    FileSystem.prototype.stat = function(path) {
      abstract();
    };

    /**
     * Remove the given path.
     *
     * @param {Path} path
     * @return {Promise}
     */
    FileSystem.prototype.unlink = function(path) {
      abstract();
    };

    /**
     * Read the entire contents of a file.
     *
     * This is a utility method that creates an OpenContext, uses the read
     * method to read in the entire file (by default) and then discards the
     * open context.
     *
     * By default this will return the data in the dataType preferred by the
     * file. You can request a specific dataType by including it in readArg.
     *
     * @param {Path} path The path to read from.
     * @param {DataType=} opt_dataType
     * @param {(string|OpenMode)=} opt_openMode
     * @param {number=} opt_offset
     * @param {SeekWhence=} opt_whence
     * @return {!Promise<!ReadResult>}
     */
    FileSystem.prototype.readFile = function(
        path, opt_dataType, opt_openMode, opt_offset, opt_whence) {
      var openMode = opt_openMode || 'r';
      var dataType = opt_dataType || null;
      var offset = opt_offset || 0;
      var whence = opt_whence || SeekWhence.Begin;

      return this.createOpenContext(path, openMode).then(
          function(cx) {
            return cx.read(offset, whence, dataType).then(
                function(readResult) {
                  return cx.closeOk(readResult);
                });
          });
    };

    /**
     * Write the entire contents of a file.
     *
     * This is a utility method that creates an OpenContext, uses the write
     * method to write the entire file (by default) and then discards the
     * open context.
     *
     * @param {Path} path The path to write to.
     * @param {DataType=} opt_dataType
     * @param {*} data
     * @param {(string|OpenMode)=} opt_openMode
     * @param {number=} opt_offset
     * @param {SeekWhence=} opt_whence
     * @return {!Promise<!WriteResult>}
     */
    FileSystem.prototype.writeFile = function(
        path, dataType, data, opt_openMode, opt_offset, opt_whence) {
      var openMode = opt_openMode || 'wtc';
      var offset = opt_offset || 0;
      var whence = opt_whence || SeekWhence.Begin;

      return this.createOpenContext(path, openMode).then(
          function(cx) {
            return cx.write(offset, whence, dataType, data).then(
                function(writeResult) {
                  return cx.closeOk(writeResult);
                });
          });
    };
  }
);

//# sourceMappingURL=file_system.js.map