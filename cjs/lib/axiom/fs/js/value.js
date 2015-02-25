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

"use strict";
var axiom$core$error$$ = require("axiom/core/error"), axiom$fs$data_type$$ = require("axiom/fs/data_type"), axiom$fs$base$open_context$$ = require("axiom/fs/base/open_context"), axiom$fs$js$entry$$ = require("axiom/fs/js/entry");

/** @typedef {JsFileSystem$$module$axiom$fs$js$file_system} */
var JsFileSystem;

/** @typedef {ReadResult$$module$axiom$fs$read_result} */
var ReadResult;

/** @typedef {WriteResult$$module$axiom$fs$write_result} */
var WriteResult;

var JsValue = function(jsfs, modeStr) {
  axiom$fs$js$entry$$.default.call(this, jsfs, modeStr);

  /** @type {*} */
  this.value = null;
};

exports["default"] = JsValue;

JsValue.prototype = Object.create(axiom$fs$js$entry$$.default.prototype);

/**
 * @param {ReadResult} readResult
 * @return !Promise<!ReadResult>
 */
JsValue.prototype.read = function(readResult) {
  readResult.dataType = axiom$fs$data_type$$.default.Value;
  readResult.data = this.value;
  return Promise.resolve(readResult);
};

/**
 * @param {WriteResult} writeResult
 * @param {*} data
 * @return !Promise<!WriteResult>
 */
JsValue.prototype.write = function(writeResult, data) {
  if (writeResult.dataType == axiom$fs$data_type$$.default.Value ||
      writeResult.dataType == axiom$fs$data_type$$.default.UTF8String) {
    this.value = data;
  } else if (typeof data == 'string' &&
      writeResult.dataType == axiom$fs$data_type$$.default.Base64String) {
    this.value = window.btoa(data);
  } else {
    return Promise.reject(new axiom$core$error$$.default.Invalid('dataType',
                                                 writeResult.dataType));
  }

  writeResult.dataType = axiom$fs$data_type$$.default.Value;
  return Promise.resolve(writeResult);
};
exports.JsValue = JsValue;

//# sourceMappingURL=value.js.map