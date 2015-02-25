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
  "axiom/fs/base/open_context",
  ["axiom/core/completer", "axiom/core/ephemeral", "axiom/core/error", "axiom/core/event", "axiom/fs/open_mode", "axiom/fs/path", "axiom/fs/read_result", "axiom/fs/write_result", "exports"],
  function(
    axiom$core$completer$$,
    axiom$core$ephemeral$$,
    axiom$core$error$$,
    axiom$core$event$$,
    axiom$fs$open_mode$$,
    axiom$fs$path$$,
    axiom$fs$read_result$$,
    axiom$fs$write_result$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var Completer;
    Completer = axiom$core$completer$$["default"];
    var Ephemeral;
    Ephemeral = axiom$core$ephemeral$$["default"];
    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var AxiomEvent;
    AxiomEvent = axiom$core$event$$["default"];
    var OpenMode;
    OpenMode = axiom$fs$open_mode$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var ReadResult;
    ReadResult = axiom$fs$read_result$$["default"];
    var WriteResult;
    WriteResult = axiom$fs$write_result$$["default"];

    /** @typedef {DataType$$module$axiom$fs$data_type} */
    var DataType;

    /** @typedef {FileSystem$$module$axiom$fs$base$file_system} */
    var FileSystem;

    /** @typedef {SeekWhence$$module$axiom$fs$seek_whence} */
    var SeekWhence;

    var OpenContext = function(fileSystem, path, mode) {
      Ephemeral.call(this);

      /** @type {FileSystem} */
      this.fileSystem = fileSystem;

      /** @type {Path} */
      this.path = path;

      if (typeof mode == 'string')
        mode = OpenMode.fromString(mode);

      /** @type {OpenMode} */
      this.mode = mode;

      // If the parent file system is closed, we close too.
      this.dependsOn(this.fileSystem);

      /**
       * @private @type {Completer}
       */
      this.openCompleter_ = null;
    };

    __es6_export__("OpenContext", OpenContext);
    __es6_export__("default", OpenContext);

    OpenContext.prototype = Object.create(Ephemeral.prototype);

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
        return Promise.reject(new AxiomError.Invalid('mode.read', this.mode.read));

      return Promise.resolve(new ReadResult(offset, whence, dataType));
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
        return Promise.reject(new AxiomError.Invalid('mode.write',
                                                     this.mode.write));
      }

      return Promise.resolve(new WriteResult(offset, whence, dataType));
    };
  }
);

//# sourceMappingURL=open_context.js.map