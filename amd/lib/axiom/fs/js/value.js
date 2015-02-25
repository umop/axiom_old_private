// Copyright (c) 2015 Google Inc. All rights reserved.
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
  "axiom/fs/js/value",
  ["axiom/core/error", "axiom/fs/data_type", "axiom/fs/base/open_context", "axiom/fs/js/entry", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$data_type$$,
    axiom$fs$base$open_context$$,
    axiom$fs$js$entry$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var DataType;
    DataType = axiom$fs$data_type$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var JsEntry;
    JsEntry = axiom$fs$js$entry$$["default"];

    /** @typedef {JsFileSystem$$module$axiom$fs$js$file_system} */
    var JsFileSystem;

    /** @typedef {ReadResult$$module$axiom$fs$read_result} */
    var ReadResult;

    /** @typedef {WriteResult$$module$axiom$fs$write_result} */
    var WriteResult;

    var JsValue = function(jsfs, modeStr) {
      JsEntry.call(this, jsfs, modeStr);

      /** @type {*} */
      this.value = null;
    };

    __es6_export__("JsValue", JsValue);
    __es6_export__("default", JsValue);

    JsValue.prototype = Object.create(JsEntry.prototype);

    /**
     * @param {ReadResult} readResult
     * @return !Promise<!ReadResult>
     */
    JsValue.prototype.read = function(readResult) {
      readResult.dataType = DataType.Value;
      readResult.data = this.value;
      return Promise.resolve(readResult);
    };

    /**
     * @param {WriteResult} writeResult
     * @param {*} data
     * @return !Promise<!WriteResult>
     */
    JsValue.prototype.write = function(writeResult, data) {
      if (writeResult.dataType == DataType.Value ||
          writeResult.dataType == DataType.UTF8String) {
        this.value = data;
      } else if (typeof data == 'string' &&
          writeResult.dataType == DataType.Base64String) {
        this.value = window.btoa(data);
      } else {
        return Promise.reject(new AxiomError.Invalid('dataType',
                                                     writeResult.dataType));
      }

      writeResult.dataType = DataType.Value;
      return Promise.resolve(writeResult);
    };
  }
);

//# sourceMappingURL=value.js.map