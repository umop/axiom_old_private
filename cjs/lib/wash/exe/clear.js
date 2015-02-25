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
var wash$termcap$$ = require("wash/termcap");

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
var JsExecuteContext;

var main = function(cx) {
  cx.ready();
  var tc = new wash$termcap$$.default();
  var output = tc.output('%clear-terminal()%set-row-column(row, column)',
                         {row: 1, column: 1});
  cx.stdout(output);
  return Promise.resolve(null);
};

exports["default"] = main;

main.argSigil = '';
exports.main = main;

//# sourceMappingURL=clear.js.map