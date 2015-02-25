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

/** @typedef {SeekWhence$$module$axiom$fs$seek_whence} */
"use strict";
var SeekWhence;

/** @typedef {DataType$$module$axiom$fs$data_type} */
var DataType;

var WriteResult = function(offset, whence, dataType) {
  /** @type {number} */
  this.offset = offset;

  /** @type {SeekWhence} */
  this.whence = whence;

  /** @type {DataType} */
  this.dataType = dataType;

  /** @type {*} */
  this.data = null;
};

exports["default"] = WriteResult;
exports.WriteResult = WriteResult;

//# sourceMappingURL=write_result.js.map