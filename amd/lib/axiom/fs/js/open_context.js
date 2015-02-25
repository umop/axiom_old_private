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
  "axiom/fs/js/open_context",
  ["axiom/core/error", "axiom/fs/base/open_context", "axiom/fs/js/entry", "axiom/fs/path", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$base$open_context$$,
    axiom$fs$js$entry$$,
    axiom$fs$path$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var JsEntry;
    JsEntry = axiom$fs$js$entry$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    /** @typedef JsFileSystem$$module$axiom$fs$js$file_system */
    var JsFileSystem;

    /** @typedef JsValue$$module$axiom$fs$js$value */
    var JsValue;

    /** @typedef {OpenMode$$module$axiom$fs$open_mode} */
    var OpenMode;

    var JsOpenContext = function(jsfs, path, entry, mode) {
      OpenContext.call(this, jsfs, path, mode);

      /** @type {JsFileSystem} */
      this.jsfs = jsfs;
      /** @type {Path} */
      this.path = path;
      /** @type {JsValue} */
      this.targetEntry = entry;
    };

    __es6_export__("JsOpenContext", JsOpenContext);
    __es6_export__("default", JsOpenContext);

    JsOpenContext.prototype = Object.create(JsOpenContext.prototype);

    /**
     * @override
     */
    JsOpenContext.prototype.open = function() {
      if (!(this.targetEntry instanceof JsValue)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('openable', this.path.spec));
      }

      return OpenContext.prototype.open.call(this);
    };

    /**
     * @override
     */
    JsOpenContext.prototype.seek = function(offset, whence) {
      if (!(this.targetEntry.mode & Path.Mode.K)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('seekable', this.path.spec));
      }

      return OpenContext.prototype.seek.apply(this, arguments);
    };

    /**
     * @override
     */
    JsOpenContext.prototype.read = function(offset, whence, dataType) {
      if (!(this.targetEntry.mode & Path.Mode.R)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('readable', this.path.spec));
      }

      return OpenContext.prototype.read.apply(this, arguments).then(
          function(readResult) {
            return this.targetEntry.read(readResult);
          }.bind(this));
    };

    /**
     * @override
     */
    JsOpenContext.prototype.write = function(offset, whence, dataType, data) {
      if (!(this.targetEntry.mode & Path.Mode.W)) {
        return Promise.reject(
            new AxiomError.TypeMismatch('writable', this.path.spec));
      }

      return OpenContext.prototype.write.apply(this, arguments).then(
        function(writeResult) {
          return this.targetEntry.write(writeResult, data);
        }.bind(this));
    };
  }
);

//# sourceMappingURL=open_context.js.map