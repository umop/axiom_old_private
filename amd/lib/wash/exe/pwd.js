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

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
define("wash/exe/pwd", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var JsExecuteContext;

 var main = function(cx) {
   cx.ready();
   return Promise.resolve(cx.getEnv('$PWD', '/'));
 };

 __es6_export__("main", main);
 __es6_export__("default", main);

 main.argSigil = '';
});

//# sourceMappingURL=pwd.js.map